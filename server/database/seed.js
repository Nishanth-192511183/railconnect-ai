require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', file), 'utf8'));
}

async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log('Seeding RailConnect AI database...');

    // Clear existing data (children first, respecting FKs)
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE recovery_plans');
    await conn.query('TRUNCATE TABLE delay_events');
    await conn.query('TRUNCATE TABLE journey_segments');
    await conn.query('TRUNCATE TABLE journeys');
    await conn.query('TRUNCATE TABLE hospitality_options');
    await conn.query('TRUNCATE TABLE trains');
    await conn.query('TRUNCATE TABLE stations');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    // Stations
    const stations = loadJSON('stations.json');
    const stationIdByCity = {};
    for (const s of stations) {
      const [result] = await conn.query(
        `INSERT INTO stations (name, city, state, average_transfer_time, station_complexity, food_available, hotel_available, transport_available)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.name, s.city, s.state, s.average_transfer_time, s.station_complexity, s.food_available, s.hotel_available, s.transport_available]
      );
      stationIdByCity[s.city] = result.insertId;
    }
    console.log(`  stations: ${stations.length}`);

    // Trains
    const trains = loadJSON('trains.json');
    for (const t of trains) {
      await conn.query(
        `INSERT INTO trains (train_number, train_name, source, destination, departure_time, arrival_time, average_delay, delay_probability, reliability_score, base_fare)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.train_number, t.train_name, t.source, t.destination, t.departure_time, t.arrival_time, t.average_delay, t.delay_probability, t.reliability_score, t.base_fare]
      );
    }
    console.log(`  trains: ${trains.length}`);

    // Hotels + restaurants -> hospitality_options
    const hotels = loadJSON('hotels.json');
    let hospitalityCount = 0;
    for (const h of hotels) {
      const stationId = stationIdByCity[h.station_city];
      if (!stationId) continue;
      await conn.query(
        `INSERT INTO hospitality_options (station_id, type, name, distance, price, rating, available, meta)
         VALUES (?, 'hotel', ?, ?, ?, ?, TRUE, NULL)`,
        [stationId, h.name, h.distance, h.price, h.rating]
      );
      hospitalityCount++;
    }

    const restaurants = loadJSON('restaurants.json');
    for (const r of restaurants) {
      const stationId = stationIdByCity[r.station_city];
      if (!stationId) continue;
      await conn.query(
        `INSERT INTO hospitality_options (station_id, type, name, distance, price, rating, available, meta)
         VALUES (?, 'restaurant', ?, ?, ?, ?, TRUE, ?)`,
        [stationId, r.name, r.distance, r.price, r.rating, JSON.stringify({ open: r.open })]
      );
      hospitalityCount++;
    }

    // A handful of generic transport + attraction options per major station
    const transportStations = ['Hyderabad', 'Nagpur', 'Bhopal', 'Mumbai', 'Delhi', 'Kolkata', 'Vijayawada', 'Pune', 'Bangalore', 'Chennai'];
    for (const city of transportStations) {
      const stationId = stationIdByCity[city];
      if (!stationId) continue;
      await conn.query(
        `INSERT INTO hospitality_options (station_id, type, name, distance, price, rating, available, meta)
         VALUES (?, 'transport', ?, '0.1 km', ?, ?, TRUE, NULL)`,
        [stationId, `${city} Prepaid Cab Counter`, 250, 4.0]
      );
      hospitalityCount++;
    }

    console.log(`  hospitality_options: ${hospitalityCount}`);
    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    conn.release();
    await pool.end();
  }
}

seed();
