const trainService = require('./trainService');
const { calculateConnectionRisk } = require('./riskService');
const { diffMinutesClock, formatDuration } = require('../utils/timeUtils');
const { clamp, weightedOverallSafety, safetyLevelFromScore } = require('../utils/scoreUtils');

const MAX_HOPS = 3; // up to 4 trains in a route
const MAX_PATHS_PER_BRANCH = 3; // per first-leg option, so no single early branch starves others
const MAX_RAW_ROUTES = 30;
const MAX_RETURNED_ROUTES = 3;

/**
 * Depth-first search over the train graph. A connection is only valid if
 * the next train's departure is later than the previous train's arrival
 * plus the station's minimum transfer time (spec section 16).
 *
 * Every distinct first-leg option out of `source` gets its own bounded
 * search, so a corridor reached later in departure-time order (e.g.
 * Chennai -> Hyderabad -> Nagpur -> Delhi) isn't starved out by an
 * earlier-departing branch (e.g. via Bangalore) exhausting the raw-route
 * cap first.
 */
function findRoutePaths(graph, stationByCity, source, destination) {
  const results = [];
  const firstLegOptions = graph[source] || [];

  for (const firstTrain of firstLegOptions) {
    if (results.length >= MAX_RAW_ROUTES) break;
    if (firstTrain.destination === source) continue;

    const branchResults = [];

    function dfs(city, path, visitedCities) {
      if (branchResults.length >= MAX_PATHS_PER_BRANCH) return;

      if (city === destination && path.length > 0) {
        branchResults.push([...path]);
        return;
      }
      if (path.length >= MAX_HOPS + 1) return;

      const options = graph[city] || [];
      for (const train of options) {
        if (branchResults.length >= MAX_PATHS_PER_BRANCH) return;
        if (visitedCities.has(train.destination)) continue;

        const prevLeg = path[path.length - 1];
        const station = stationByCity[city];
        if (!station) continue;
        const buffer = diffMinutesClock(prevLeg.arrival_time, train.departure_time);
        if (buffer < station.average_transfer_time) continue; // invalid connection, skip

        visitedCities.add(train.destination);
        path.push(train);
        dfs(train.destination, path, visitedCities);
        path.pop();
        visitedCities.delete(train.destination);
      }
    }

    if (firstTrain.destination === destination) {
      branchResults.push([firstTrain]);
    } else {
      dfs(firstTrain.destination, [firstTrain], new Set([source, firstTrain.destination]));
    }

    results.push(...branchResults);
  }

  return results.slice(0, MAX_RAW_ROUTES);
}

function buildRouteFromLegs(legs, stationByCity) {
  const segments = [];
  const connections = [];
  const segmentSafetyScores = [];
  let cumulativeMinutes = 0;
  let cost = 0;

  legs.forEach((train, i) => {
    const legDuration = diffMinutesClock(train.departure_time, train.arrival_time);

    if (i > 0) {
      const prevTrain = legs[i - 1];
      const station = stationByCity[train.source];
      const buffer = diffMinutesClock(prevTrain.arrival_time, train.departure_time);
      const risk = calculateConnectionRisk({ bufferMinutes: buffer, incomingTrain: prevTrain, station });

      connections.push({
        station: train.source,
        buffer,
        risk,
      });
      segmentSafetyScores.push(100 - risk.score);
      cumulativeMinutes += buffer;
    } else {
      // First leg has no incoming connection - approximate its own safety
      // from the train's reliability and delay probability.
      const directSafety = clamp(train.reliability_score - train.delay_probability * 40, 0, 100);
      segmentSafetyScores.push(Math.round(directSafety));
    }

    cumulativeMinutes += legDuration;
    cost += Number(train.base_fare);

    segments.push({
  trainId: train.id,
  trainNumber: train.train_number,
  trainName: train.train_name,
  source: train.source,
  destination: train.destination,
  departureTime: train.departure_time,
  arrivalTime: train.arrival_time,

  depart: train.departure_time,
  arrive: train.arrival_time,
  from: train.source,
  to: train.destination,
  train: train.train_number,

  duration: formatDuration(legDuration),
});
  });

  const { overallScore } = weightedOverallSafety(segmentSafetyScores);

  let weakestConnection = null;
  if (connections.length) {
    const weakest = connections.reduce((min, c) => (c.risk.score > min.risk.score ? c : min), connections[0]);
    const weakestLegIndex = connections.indexOf(weakest);
    weakestConnection = `${legs[weakestLegIndex].destination} → ${legs[weakestLegIndex + 1].destination}`;
  }

  return {
    legs: segments,
    segments,
    connections,
    safetyScore: overallScore,
    reliability: overallScore,
    riskLevel: safetyLevelFromScore(overallScore),
    duration: formatDuration(cumulativeMinutes),
    totalDuration: formatDuration(cumulativeMinutes),
    durationMinutes: cumulativeMinutes,
    estimatedCost: Math.round(cost),
    cost: Math.round(cost),
    overallSafety: {
      overallScore,
      overallRisk: safetyLevelFromScore(overallScore),
      weakestConnection,
    },
  };
}

async function planJourney(source, destination) {
  const [allTrains, stations] = await Promise.all([
    trainService.getAllTrains(),
    trainService.getAllStations(),
  ]);

  const stationByCity = Object.fromEntries(stations.map((s) => [s.city, s]));

  const graph = {};
  for (const t of allTrains) {
    if (!graph[t.source]) graph[t.source] = [];
    graph[t.source].push(t);
  }
  // deterministic ordering: earlier departures explored first
  Object.values(graph).forEach((list) => list.sort((a, b) => (a.departure_time > b.departure_time ? 1 : -1)));

  const rawPaths = findRoutePaths(graph, stationByCity, source, destination);

  if (!rawPaths.length) {
    return { source, destination, routes: [], recommendation: null };
  }

  let built = rawPaths.map((legs) => buildRouteFromLegs(legs, stationByCity));

  // Rank: highest safety first, then lower cost as a tiebreaker
  built.sort((a, b) => b.safetyScore - a.safetyScore || a.estimatedCost - b.estimatedCost);

  const top = built.slice(0, MAX_RETURNED_ROUTES);
  const cheapest = Math.min(...top.map((r) => r.estimatedCost));
  const fastest = Math.min(...top.map((r) => r.durationMinutes));

  top.forEach((route, i) => {
    route.routeId = `R${i + 1}`;
    route.id = `R${i + 1}`;
    route.recommended = i === 0;
    if (i === 0) route.tag = 'Recommended';
    else if (route.estimatedCost === cheapest) route.tag = 'Cheapest';
    else if (route.durationMinutes === fastest) route.tag = 'Fastest';
    else route.tag = 'Alternative';
    delete route.durationMinutes;
  });

  const recommendation = {
    routeId: top[0].routeId,
    safetyScore: top[0].safetyScore,
    reason: `${top[0].routeId} has the highest overall safety score (${top[0].safetyScore}/100) among ${built.length} route option(s) found for this journey.`,
  };

  return { source, destination, routes: top, recommendation };
}

module.exports = { planJourney, findRoutePaths, buildRouteFromLegs };
