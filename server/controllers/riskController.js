const trainService = require('../services/trainService');
const { calculateConnectionRisk } = require('../services/riskService');

// POST /api/risk/connection
// body: { bufferMinutes, trainNumber, stationCity }
async function calculateRisk(req, res, next) {
  try {
    const { bufferMinutes, trainNumber, stationCity } = req.body;
    if (bufferMinutes === undefined || !trainNumber || !stationCity) {
      return res.status(400).json({ success: false, message: 'bufferMinutes, trainNumber and stationCity are required' });
    }

    const incomingTrain = await trainService.getTrainByNumber(trainNumber);
    if (!incomingTrain) {
      return res.status(404).json({ success: false, message: `Train ${trainNumber} not found` });
    }
    const station = await trainService.getStationByCity(stationCity);
    if (!station) {
      return res.status(404).json({ success: false, message: `Station ${stationCity} not found` });
    }

    const risk = calculateConnectionRisk({ bufferMinutes: Number(bufferMinutes), incomingTrain, station });
    res.json(risk);
  } catch (err) {
    next(err);
  }
}

module.exports = { calculateRisk };
