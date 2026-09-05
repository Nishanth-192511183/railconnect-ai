const hospitalityService = require('../services/hospitalityService');

// GET /api/hospitality/:station?waitingTime=&budget=
async function getForStation(req, res, next) {
  try {
    const { station } = req.params;
    let waitingMinutes = 60;
    if (req.query.waitMinutes !== undefined) {
      waitingMinutes = Number(req.query.waitMinutes);
    } else if (req.query.waitingTime !== undefined) {
      waitingMinutes = Math.round(Number(req.query.waitingTime) * 60); // hours -> minutes
    }
    const budget = req.query.budget ? Number(req.query.budget) : null;

    if (Number.isNaN(waitingMinutes) || waitingMinutes < 0) {
      return res.status(400).json({ success: false, message: 'waitingTime must be a positive number of hours' });
    }

    const result = await hospitalityService.getHospitalityRecommendations(station, waitingMinutes, budget);
    if (!result) {
      return res.status(404).json({ success: false, message: `Station "${station}" not found` });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getForStation };
