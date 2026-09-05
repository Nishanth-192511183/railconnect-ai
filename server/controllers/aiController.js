const aiService = require('../services/aiService');

// POST /api/ai/recommend
async function recommend(req, res, next) {
  try {
    const { routes, userBudget, preferences } = req.body;
    if (!Array.isArray(routes) || !routes.length) {
      return res.status(400).json({ success: false, message: 'routes (non-empty array) is required' });
    }

    const result = await aiService.getRouteRecommendation({ routes, userBudget, preferences });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// POST /api/ai/explain-recovery
async function explainRecovery(req, res, next) {
  try {
    const { recoveryPlan } = req.body;
    if (!recoveryPlan) {
      return res.status(400).json({ success: false, message: 'recoveryPlan is required' });
    }
    const explanation = await aiService.getRecoveryExplanation(recoveryPlan);
    res.json({ explanation });
  } catch (err) {
    next(err);
  }
}

module.exports = { recommend, explainRecovery };
