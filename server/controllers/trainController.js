const trainService = require('../services/trainService');

async function search(req, res, next) {
  try {
    const { source, destination, date } = req.query;
    if (!source || !destination) {
      return res.status(400).json({ success: false, message: 'source and destination are required' });
    }

    const directTrains = await trainService.searchTrains(source, destination);

    res.json({
      source,
      destination,
      date: date || null,
      count: directTrains.length,
      trains: directTrains,
    });
  } catch (err) {
    next(err);
  }
}

async function getStatus(req, res, next) {
  try {
    const { trainId } = req.params;
    const status = await trainService.getTrainStatus(trainId);
    if (!status) {
      return res.status(404).json({ success: false, message: 'Train not found' });
    }
    res.json(status);
  } catch (err) {
    next(err);
  }
}

module.exports = { search, getStatus };
