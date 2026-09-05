const pool = require('../config/db');

/**
 * All train data access goes through this module. Today it reads from
 * MySQL (seeded from data/trains.json). To plug in a real railway API
 * later, swap the query bodies here for axios calls - callers (route
 * service, controllers) never talk to the database directly.
 */

async function searchTrains(source, destination) {
  const [rows] = await pool.query(
    'SELECT * FROM trains WHERE source = ? AND destination = ? ORDER BY departure_time',
    [source, destination]
  );
  return rows;
}

async function getAllTrains() {
  const [rows] = await pool.query('SELECT * FROM trains');
  return rows;
}

async function getTrain(trainId) {
  const [rows] = await pool.query('SELECT * FROM trains WHERE id = ?', [trainId]);
  return rows[0] || null;
}

async function getTrainByNumber(trainNumber) {
  const [rows] = await pool.query('SELECT * FROM trains WHERE train_number = ?', [trainNumber]);
  return rows[0] || null;
}

async function getTrainsFrom(city) {
  const [rows] = await pool.query('SELECT * FROM trains WHERE source = ?', [city]);
  return rows;
}

// Demo-only: real integrations would hit a live status API here.
async function getTrainStatus(trainId) {
  const train = await getTrain(trainId);
  if (!train) return null;
  return {
    trainId: train.id,
    trainNumber: train.train_number,
    trainName: train.train_name,
    onTimeProbability: Math.round((1 - train.delay_probability) * 100),
    typicalDelayMinutes: train.average_delay,
  };
}

async function getStationByCity(city) {
  const [rows] = await pool.query('SELECT * FROM stations WHERE city = ?', [city]);
  return rows[0] || null;
}

async function getAllStations() {
  const [rows] = await pool.query('SELECT * FROM stations');
  return rows;
}

module.exports = {
  searchTrains,
  getAllTrains,
  getTrain,
  getTrainByNumber,
  getTrainsFrom,
  getTrainStatus,
  getStationByCity,
  getAllStations,
};
