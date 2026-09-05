const pool = require('../config/db');
const trainService = require('./trainService');
const { formatDuration } = require('../utils/timeUtils');

async function getOptionsForStation(stationId, type) {
  const [rows] = await pool.query(
    'SELECT * FROM hospitality_options WHERE station_id = ? AND type = ? AND available = TRUE ORDER BY rating DESC',
    [stationId, type]
  );
  return rows;
}

function withinBudget(items, budget) {
  if (!budget) return items;
  const filtered = items.filter((i) => Number(i.price) <= Number(budget));
  return filtered.length ? filtered : items; // never return an empty list just because of budget
}

/**
 * Waiting-time tiers (spec section 20):
 *   < 2h        -> food + rest facilities only
 *   2h - 8h     -> restaurant + hotel/lounge + short local activity
 *   8h+ (overnight) -> hotel + food + transport, full recommendation
 */
function tierForWaitingMinutes(minutes) {
  if (minutes < 120) return 'short';
  if (minutes < 480) return 'medium';
  return 'long';
}

async function getHospitalityRecommendations(cityOrStation, waitingMinutes = 60, budget = null) {
  const station = await trainService.getStationByCity(cityOrStation);
  if (!station) {
    return null;
  }

  const [hotels, restaurants, transport, attractions] = await Promise.all([
    getOptionsForStation(station.id, 'hotel'),
    getOptionsForStation(station.id, 'restaurant'),
    getOptionsForStation(station.id, 'transport'),
    getOptionsForStation(station.id, 'attraction'),
  ]);

  const tier = tierForWaitingMinutes(waitingMinutes);

  let hotelResult = [];
  let restaurantResult = withinBudget(restaurants, budget);
  let transportResult = withinBudget(transport, budget);
  let attractionResult = [];

  if (tier === 'short') {
    // brief layover: food + nearby facilities, no point booking a hotel
    restaurantResult = restaurantResult.slice(0, 3);
    transportResult = transportResult.slice(0, 2);
  } else if (tier === 'medium') {
    hotelResult = withinBudget(hotels, budget).slice(0, 2); // lounge/rest option
    attractionResult = withinBudget(attractions, budget).slice(0, 2);
    restaurantResult = restaurantResult.slice(0, 3);
  } else {
    // long/overnight wait: full recommendation set
    hotelResult = withinBudget(hotels, budget);
    transportResult = transportResult;
    restaurantResult = restaurantResult;
    attractionResult = withinBudget(attractions, budget).slice(0, 2);
  }

  return {
    station: station.city,
    waitingTime: formatDuration(waitingMinutes),
    tier,
    hotels: hotelResult,
    restaurants: restaurantResult,
    transport: transportResult,
    attractions: attractionResult,
  };
}

module.exports = { getHospitalityRecommendations, tierForWaitingMinutes };
