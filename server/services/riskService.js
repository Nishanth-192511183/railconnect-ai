const { clamp, riskLevelFromScore } = require('../utils/scoreUtils');

const COMPLEXITY_POINTS = { Low: 20, Medium: 50, High: 80 };

/**
 * Computes a "safe" recommended buffer (in minutes) for a connection,
 * factoring in the station's own transfer time, its complexity, and how
 * delay-prone the incoming train historically is.
 */
function computeSafeBuffer({ stationTransferTime, stationComplexity, incomingTrain }) {
  const complexityBonus = { Low: 10, Medium: 25, High: 45 }[stationComplexity] || 25;
  const delayCushion = Math.round((incomingTrain.average_delay || 0) * 0.6);
  return Math.max(30, Math.round(stationTransferTime * 1.4) + complexityBonus + delayCushion);
}

/**
 * Core connection risk algorithm (see spec section 17).
 *
 * Weights:
 *   Buffer Risk        35%
 *   Delay Risk         25%
 *   Train Reliability  20%
 *   Station Risk       20%
 */
function calculateConnectionRisk({ bufferMinutes, incomingTrain, station }) {
  const safeBuffer = computeSafeBuffer({
    stationTransferTime: station.average_transfer_time,
    stationComplexity: station.station_complexity,
    incomingTrain,
  });

  // 1. Buffer risk - the tighter the buffer relative to what's "safe", the higher the risk
  const bufferRatio = bufferMinutes / safeBuffer;
  const bufferRisk =
    bufferRatio >= 1
      ? clamp(20 - (bufferRatio - 1) * 15, 0, 20)
      : clamp(100 - bufferRatio * 100, 0, 100);

  // 2. Delay risk - historical delay probability + magnitude of average delay
  const delayProbabilityPoints = (incomingTrain.delay_probability || 0) * 100;
  const delayMagnitudePoints = clamp(((incomingTrain.average_delay || 0) / 90) * 100, 0, 100);
  const delayRisk = clamp(delayProbabilityPoints * 0.6 + delayMagnitudePoints * 0.4, 0, 100);

  // 3. Train reliability - inverse of reliability_score
  const reliabilityRisk = clamp(100 - (incomingTrain.reliability_score ?? 80), 0, 100);

  // 4. Station risk - complexity + how long transfers typically take here
  const complexityPoints = COMPLEXITY_POINTS[station.station_complexity] || 50;
  const transferPoints = clamp((station.average_transfer_time / 60) * 100, 0, 100);
  const stationRisk = clamp(complexityPoints * 0.6 + transferPoints * 0.4, 0, 100);

  const score = Math.round(
    bufferRisk * 0.35 + delayRisk * 0.25 + reliabilityRisk * 0.2 + stationRisk * 0.2
  );

  const reasons = [];
  if (bufferMinutes < safeBuffer) {
    reasons.push(`Connection buffer is only ${bufferMinutes} minutes (recommended ${safeBuffer}+)`);
  }
  if ((incomingTrain.delay_probability || 0) >= 0.25) {
    reasons.push(
      `${incomingTrain.train_name} has a high historical delay probability (${Math.round(
        (incomingTrain.delay_probability || 0) * 100
      )}%)`
    );
  }
  if ((incomingTrain.reliability_score ?? 80) < 80) {
    reasons.push(`${incomingTrain.train_name} has a below-average reliability score`);
  }
  if (station.station_complexity === 'High') {
    reasons.push(`${station.city} station transfer complexity is high`);
  } else if (station.average_transfer_time >= 25) {
    reasons.push(`Station transfer time is relatively high (${station.average_transfer_time} min)`);
  }
  if (!reasons.length) {
    reasons.push('Buffer and train reliability are both within safe margins');
  }

  return {
    score: clamp(score, 0, 100),
    level: riskLevelFromScore(score),
    buffer: bufferMinutes,
    recommendedBuffer: safeBuffer,
    reasons,
  };
}

module.exports = { calculateConnectionRisk, computeSafeBuffer };
