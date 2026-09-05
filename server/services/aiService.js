const axios = require('axios');

/**
 * The AI layer only ever *explains* numbers that the deterministic backend
 * (routeService/riskService/recoveryService) already calculated. It never
 * computes risk scores, costs, or route validity itself.
 */

function fallbackRouteRecommendation({ routes, userBudget, preferences }) {
  if (!routes || !routes.length) {
    return {
      recommendation: null,
      explanation: 'No routes were provided to evaluate.',
      keyReasons: [],
    };
  }

  const preferSafe = preferences?.safeConnections !== false;
  const preferLowCost = preferences?.lowCost === true;

  let sorted = [...routes];
  if (preferLowCost) {
    sorted.sort((a, b) => a.estimatedCost - b.estimatedCost || b.safetyScore - a.safetyScore);
  } else {
    sorted.sort((a, b) => b.safetyScore - a.safetyScore || a.estimatedCost - b.estimatedCost);
  }

  if (userBudget) {
    const withinBudget = sorted.filter((r) => r.estimatedCost <= userBudget);
    if (withinBudget.length) sorted = withinBudget;
  }

  const best = sorted[0];
  const keyReasons = [];
  if (preferSafe) keyReasons.push(`Safety score of ${best.safetyScore}/100 (${best.riskLevel} risk)`);
  if (best.connections?.length) {
    const worst = best.connections.reduce((m, c) => (c.risk.score > m.risk.score ? c : m), best.connections[0]);
    keyReasons.push(`Weakest connection at ${worst.station} has a ${worst.buffer}-minute buffer`);
  } else {
    keyReasons.push('Direct route with no connection risk');
  }
  keyReasons.push(`Estimated cost ₹${best.estimatedCost}, total duration ${best.duration}`);

  return {
    recommendation: best.routeId || best.id,
    explanation: `${best.routeId || best.id} is recommended because it has the strongest overall safety score (${best.safetyScore}/100) while keeping cost and duration reasonable given your preferences.`,
    keyReasons,
  };
}

function fallbackRecoveryExplanation(recoveryPlan) {
  if (!recoveryPlan || recoveryPlan.status !== 'recovered') {
    return recoveryPlan?.message || 'No recovery plan could be generated.';
  }
  return `Since your original connection was missed, we've rebooked you on ${recoveryPlan.alternativeTrain.trainName} (${recoveryPlan.alternativeTrain.trainNumber}), departing ${recoveryPlan.alternativeTrain.departure}. This keeps your journey safety at ${recoveryPlan.safetyScore}/100 with an additional cost of ₹${recoveryPlan.additionalCost.total}.`;
}

async function callLLM(prompt) {
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  if (!apiKey) return null; // no key configured - caller falls back to deterministic explanation

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: model || 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    const text = response.data?.content?.find((b) => b.type === 'text')?.text;
    return text || null;
  } catch (err) {
    return null; // fail soft - deterministic fallback keeps the demo working
  }
}

async function getRouteRecommendation({ routes, userBudget, preferences }) {
  const deterministic = fallbackRouteRecommendation({ routes, userBudget, preferences });

  const prompt = `You are explaining pre-calculated train route options to a traveler. Do NOT invent or change any numbers - only explain and justify using the data given.
Routes: ${JSON.stringify(routes)}
User budget: ${userBudget ?? 'not specified'}
Preferences: ${JSON.stringify(preferences || {})}
Deterministic best pick: ${deterministic.recommendation}
Reply with 2-3 sentences explaining why this route is the best choice, referencing the actual safety score, cost and duration.`;

  const aiText = await callLLM(prompt);
  return {
    recommendation: deterministic.recommendation,
    explanation: aiText || deterministic.explanation,
    keyReasons: deterministic.keyReasons,
  };
}

async function getRecoveryExplanation(recoveryPlan) {
  const deterministic = fallbackRecoveryExplanation(recoveryPlan);
  if (!recoveryPlan || recoveryPlan.status !== 'recovered') return deterministic;

  const prompt = `Explain this pre-calculated train journey recovery plan to a traveler in 2-3 reassuring sentences. Do not invent numbers - only use what's given.
Recovery plan: ${JSON.stringify(recoveryPlan)}`;

  const aiText = await callLLM(prompt);
  return aiText || deterministic;
}

module.exports = { getRouteRecommendation, getRecoveryExplanation };
