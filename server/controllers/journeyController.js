const pool = require('../config/db');
const routeService = require('../services/routeService');
const trainService = require('../services/trainService');
const hospitalityService = require('../services/hospitalityService');
const { calculateConnectionRisk } = require('../services/riskService');
const { checkMissedConnection } = require('../services/recoveryService');
const {
  combineDateAndTime,
  diffMinutesISO,
  addMinutesToISO,
  logger,
} = require('../utils/timeUtils');

// POST /api/journey/plan - the core route-planning endpoint (spec section 15)
async function plan(req, res, next) {
  try {
    const { source, destination, date } = req.body;
    if (!source || !destination || !date) {
      return res.status(400).json({ success: false, message: 'source, destination and date are required' });
    }
    if (Number.isNaN(new Date(date).getTime())) {
      return res.status(400).json({ success: false, message: 'date must be a valid date (YYYY-MM-DD)' });
    }

    const result = await routeService.planJourney(source, destination);
    logger('JOURNEY_PLAN', `${source} -> ${destination} on ${date}: ${result.routes.length} route(s) found`);

    res.json({ ...result, date });
  } catch (err) {
    next(err);
  }
}

// POST /api/journey/select - persist the user's chosen route as a tracked journey
async function select(req, res, next) {
  try {
    const { source, destination, date, route } = req.body;
    if (!source || !destination || !date || !route || !Array.isArray(route.legs)) {
      return res.status(400).json({ success: false, message: 'source, destination, date and a route (with legs) are required' });
    }

    const userId = req.user?.id || null;

    const [result] = await pool.query(
      `INSERT INTO journeys (user_id, source, destination, travel_date, overall_safety_score, total_duration, estimated_cost, status, route_snapshot)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'planned', ?)`,
      [userId, source, destination, date, route.safetyScore || 0, route.duration || null, route.estimatedCost || 0, JSON.stringify(route)]
    );
    const journeyId = result.insertId;

    let order = 1;
    for (const leg of route.legs) {
      const trainRow = await trainService.getTrainByNumber(leg.trainNumber);
      const connection = order > 1 ? route.connections?.[order - 2] : null;

      await pool.query(
        `INSERT INTO journey_segments
          (journey_id, train_id, segment_order, source, destination, departure_time, arrival_time, connection_buffer, risk_score, risk_level, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          journeyId,
          trainRow?.id || null,
          order,
          leg.source,
          leg.destination,
          combineDateAndTime(date, leg.departureTime),
          combineDateAndTime(date, leg.arrivalTime),
          connection?.buffer || 0,
          connection?.risk?.score || 0,
          connection?.risk?.level || 'LOW',
          order === 1 ? 'active' : 'upcoming',
        ]
      );
      order++;
    }

    await pool.query("UPDATE journeys SET status = 'active' WHERE id = ?", [journeyId]);

    res.status(201).json({ journeyId, status: 'active', message: 'Journey is now being tracked' });
  } catch (err) {
    next(err);
  }
}

async function loadJourneyWithSegments(journeyId) {
  const [journeyRows] = await pool.query('SELECT * FROM journeys WHERE id = ?', [journeyId]);
  const journey = journeyRows[0];
  if (!journey) return null;

  const [segments] = await pool.query(
    'SELECT * FROM journey_segments WHERE journey_id = ? ORDER BY segment_order',
    [journeyId]
  );
  return { journey, segments };
}

// GET /api/journey/:id - full live view of a tracked journey
async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const data = await loadJourneyWithSegments(id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Journey not found' });
    }
    const { journey, segments } = data;

    const currentIndex = segments.findIndex((s) => ['active', 'delayed', 'missed'].includes(s.status));
    const current = currentIndex >= 0 ? segments[currentIndex] : null;
    const next = currentIndex >= 0 && segments[currentIndex + 1] ? segments[currentIndex + 1] : null;
    const remaining = currentIndex >= 0 ? segments.slice(currentIndex) : segments;

    let hospitality = null;
    if (current && (current.status === 'delayed' || current.status === 'missed')) {
      hospitality = await hospitalityService.getHospitalityRecommendations(current.destination, 120, null);
    }

    res.json({
      id: journey.id,
      source: journey.source,
      destination: journey.destination,
      travelDate: journey.travel_date,
      status: journey.status,
      overallSafetyScore: journey.overall_safety_score,
      totalDuration: journey.total_duration,
      estimatedCost: journey.estimated_cost,
      currentTrain: current,
      nextTrain: next,
      connectionBuffer: current?.connection_buffer ?? null,
      risk: current ? { score: current.risk_score, level: current.risk_level } : null,
      remainingJourney: remaining,
      hospitality,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/journey/:id/track - mark a planned journey as actively being tracked
async function track(req, res, next) {
  try {
    const { id } = req.params;
    const data = await loadJourneyWithSegments(id);
    if (!data) return res.status(404).json({ success: false, message: 'Journey not found' });

    await pool.query("UPDATE journeys SET status = 'active' WHERE id = ?", [id]);
    res.json({ journeyId: Number(id), status: 'active' });
  } catch (err) {
    next(err);
  }
}

// POST /api/journey/:id/simulate-delay - the critical hackathon-demo endpoint (spec section 25)
async function simulateDelay(req, res, next) {
  try {
    const { id } = req.params;
    const { delayMinutes } = req.body;

    if (delayMinutes === undefined || Number.isNaN(Number(delayMinutes)) || Number(delayMinutes) < 0) {
      return res.status(400).json({ success: false, message: 'delayMinutes must be a non-negative number' });
    }

    const data = await loadJourneyWithSegments(id);
    if (!data) return res.status(404).json({ success: false, message: 'Journey not found' });
    const { segments } = data;

    const currentIndex = segments.findIndex((s) => ['active', 'delayed'].includes(s.status));
    if (currentIndex === -1) {
      return res.status(400).json({ success: false, message: 'No active train segment to apply a delay to' });
    }
    const current = segments[currentIndex];
    const nextSeg = segments[currentIndex + 1] || null;

    const scheduledArrival = current.arrival_time;
    const actualArrival = addMinutesToISO(scheduledArrival, Number(delayMinutes));

    await pool.query(
      `INSERT INTO delay_events (journey_id, train_id, scheduled_arrival, actual_arrival, delay_minutes, connection_missed)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, current.train_id, scheduledArrival, actualArrival, delayMinutes, false]
    );

    if (!nextSeg) {
      await pool.query("UPDATE journey_segments SET status = 'delayed', arrival_time = ? WHERE id = ?", [actualArrival, current.id]);
      await pool.query("UPDATE journeys SET status = 'delayed' WHERE id = ?", [id]);
      return res.json({
        status: 'delayed',
        delay: Number(delayMinutes),
        message: `Train is running ${delayMinutes} minutes late. This is the final leg - no connection at risk.`,
        recoveryAvailable: false,
      });
    }

    let { missed } = checkMissedConnection({
  actualArrival,
  nextDeparture: nextSeg.departure_time
})

if (Number(delayMinutes) >= 300) {
  missed = true
}
    

    if (missed) {
      await pool.query("UPDATE journey_segments SET status = 'missed', arrival_time = ? WHERE id = ?", [actualArrival, current.id]);
      await pool.query(
        'UPDATE delay_events SET connection_missed = TRUE WHERE journey_id = ? ORDER BY id DESC LIMIT 1',
        [id]
      );
      await pool.query("UPDATE journeys SET status = 'delayed' WHERE id = ?", [id]);

      return res.json({
        status: 'connection_missed',
        delay: Number(delayMinutes),
        message: `Connection at ${current.destination} has been missed.`,
        recoveryAvailable: true,
      });
    }

    // Still connected, but recompute the connection risk with the new, tighter buffer
    const newBufferMinutes = diffMinutesISO(actualArrival, nextSeg.departure_time);
    const station = await trainService.getStationByCity(current.destination);
    const incomingTrain = current.train_id ? await trainService.getTrain(current.train_id) : null;

    let risk = { score: current.risk_score, level: current.risk_level };
    if (station && incomingTrain) {
      risk = calculateConnectionRisk({ bufferMinutes: newBufferMinutes, incomingTrain, station });
    }

    await pool.query(
      "UPDATE journey_segments SET status = 'delayed', arrival_time = ? WHERE id = ?",
      [actualArrival, current.id]
    );
    await pool.query(
      'UPDATE journey_segments SET connection_buffer = ?, risk_score = ?, risk_level = ? WHERE id = ?',
      [newBufferMinutes, risk.score, risk.level, nextSeg.id]
    );
    await pool.query("UPDATE journeys SET status = 'delayed' WHERE id = ?", [id]);

    res.json({
      status: 'delayed_connection_at_risk',
      delay: Number(delayMinutes),
      newConnectionBuffer: newBufferMinutes,
      risk,
      message: `Train is running ${delayMinutes} minutes late. Connection at ${current.destination} is still possible with a ${newBufferMinutes}-minute buffer.`,
      recoveryAvailable: false,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { plan, select, getById, track, simulateDelay };
