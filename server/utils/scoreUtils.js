function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function riskLevelFromScore(score) {
  if (score <= 30) return 'LOW';
  if (score <= 60) return 'MEDIUM';
  return 'HIGH';
}

// safetyScore is the inverse framing of riskScore (100 = perfectly safe)
function safetyLevelFromScore(score) {
  if (score >= 70) return 'LOW'; // low risk
  if (score >= 40) return 'MEDIUM';
  return 'HIGH';
}

/**
 * Weighted average that gives extra weight to the weakest (lowest safety)
 * segment, so a single bad connection drags the overall score down harder
 * than a plain average would.
 */
function weightedOverallSafety(segmentScores) {
  if (!segmentScores.length) return { overallScore: 100, weakestIndex: -1 };

  const min = Math.min(...segmentScores);
  const weakestIndex = segmentScores.indexOf(min);

  const plainAvg =
    segmentScores.reduce((a, b) => a + b, 0) / segmentScores.length;

  // Pull the overall score toward the weakest link: 60% plain average,
  // 40% weighted toward the minimum. This ensures [92, 54, 71] scores
  // meaningfully below a naive average of 72.
  const overall = plainAvg * 0.6 + min * 0.4;

  return {
    overallScore: Math.round(clamp(overall)),
    weakestIndex,
  };
}

module.exports = {
  clamp,
  riskLevelFromScore,
  safetyLevelFromScore,
  weightedOverallSafety,
};
