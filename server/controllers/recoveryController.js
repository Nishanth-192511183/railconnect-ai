const pool = require('../config/db');
const recoveryService = require('../services/recoveryService');
const { logger } = require('../utils/timeUtils');

// POST /api/recovery/check
async function check(req, res, next) {
  try {
    const { journeyId, trainId, actualArrival, nextDeparture } = req.body;
    if (!actualArrival || !nextDeparture) {
      return res.status(400).json({ success: false, message: 'actualArrival and nextDeparture are required' });
    }

    const result = recoveryService.checkMissedConnection({ actualArrival, nextDeparture });

    if (journeyId && result.missed) {
      await pool.query(
        `INSERT INTO delay_events (journey_id, train_id, scheduled_arrival, actual_arrival, delay_minutes, connection_missed)
         VALUES (?, ?, ?, ?, ?, TRUE)`,
        [journeyId, trainId || null, nextDeparture, actualArrival, result.minutesPastDeparture]
      );
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
}

// POST /api/recovery/generate
async function generate(req, res, next) {
  try {
    const { journeyId, currentStation, destination, currentTime, budget } = req.body;
    if (!currentStation || !destination || !currentTime) {
      return res.status(400).json({ success: false, message: 'currentStation, destination and currentTime are required' });
    }

    let originalEstimatedCost = 0;
    let missedTrainId = null;
    if (journeyId) {
      const [rows] = await pool.query('SELECT * FROM journeys WHERE id = ?', [journeyId]);
      if (rows[0]) originalEstimatedCost = Number(rows[0].estimated_cost) || 0;

      const [segRows] = await pool.query(
        "SELECT * FROM journey_segments WHERE journey_id = ? AND status = 'missed' ORDER BY segment_order DESC LIMIT 1",
        [journeyId]
      );
      if (segRows[0]) missedTrainId = segRows[0].train_id;
    }

    const plan = await recoveryService.generateRecoveryPlan({
      currentStation,
      destination,
      currentTime,
      budget,
      originalEstimatedCost,
    });

    if (plan.status !== 'recovered') {
      return res.status(200).json(plan);
    }

    if (journeyId) {
      const alternativeTrainId = plan.newJourney?.[0]?.trainId || null;
      await pool.query(
        `INSERT INTO recovery_plans
          (journey_id, missed_train_id, alternative_train_id, new_arrival_time, hotel_cost, food_cost, transport_cost, train_cost, total_additional_cost, reason, status)
         VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, 'generated')`,
        [
          journeyId,
          missedTrainId,
          alternativeTrainId,
          plan.additionalCost.hotel,
          plan.additionalCost.food,
          plan.additionalCost.transport,
          plan.additionalCost.train,
          plan.additionalCost.total,
          plan.reason,
        ]
      );
      await pool.query("UPDATE journeys SET status = 'recovery' WHERE id = ?", [journeyId]);
    }

    logger('RECOVERY', `Generated recovery plan for journey ${journeyId || 'n/a'}: +₹${plan.additionalCost.total}`);
    res.json(plan);
  } catch (err) {
    next(err);
  }
}

module.exports = { check, generate };
