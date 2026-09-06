-- ============================================================
-- RailConnect AI — Railway MySQL Database Schema
-- ============================================================
-- IMPORTANT:
-- Do NOT CREATE DATABASE or USE a database here.
-- Railway automatically connects the application to its
-- configured database (normally "railway").
-- ============================================================


-- ============================================================
-- 1. USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,

  name VARCHAR(120) NOT NULL,

  email VARCHAR(180) NOT NULL UNIQUE,

  password VARCHAR(255) NOT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 2. STATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS stations (
  id INT AUTO_INCREMENT PRIMARY KEY,

  name VARCHAR(150) NOT NULL,

  city VARCHAR(100) NOT NULL,

  state VARCHAR(100),

  average_transfer_time INT DEFAULT 20,

  station_complexity ENUM(
    'Low',
    'Medium',
    'High'
  ) DEFAULT 'Medium',

  food_available BOOLEAN DEFAULT TRUE,

  hotel_available BOOLEAN DEFAULT TRUE,

  transport_available BOOLEAN DEFAULT TRUE,

  UNIQUE KEY uniq_station_city (city)
);


-- ============================================================
-- 3. TRAINS
-- ============================================================

CREATE TABLE IF NOT EXISTS trains (
  id INT AUTO_INCREMENT PRIMARY KEY,

  train_number VARCHAR(20) NOT NULL UNIQUE,

  train_name VARCHAR(150) NOT NULL,

  source VARCHAR(100) NOT NULL,

  destination VARCHAR(100) NOT NULL,

  departure_time TIME NOT NULL,

  arrival_time TIME NOT NULL,

  average_delay INT DEFAULT 0,

  delay_probability DECIMAL(4,2) DEFAULT 0.20,

  reliability_score INT DEFAULT 80,

  base_fare DECIMAL(10,2) DEFAULT 500,

  INDEX idx_source (source),

  INDEX idx_destination (destination)
);


-- ============================================================
-- 4. HOSPITALITY OPTIONS
-- Hotels, restaurants, transport and attractions
-- ============================================================

CREATE TABLE IF NOT EXISTS hospitality_options (
  id INT AUTO_INCREMENT PRIMARY KEY,

  station_id INT NOT NULL,

  type ENUM(
    'hotel',
    'restaurant',
    'transport',
    'attraction'
  ) NOT NULL,

  name VARCHAR(150) NOT NULL,

  distance VARCHAR(30),

  price DECIMAL(10,2) DEFAULT 0,

  rating DECIMAL(2,1) DEFAULT 4.0,

  available BOOLEAN DEFAULT TRUE,

  meta JSON NULL,

  FOREIGN KEY (station_id)
    REFERENCES stations(id)
    ON DELETE CASCADE,

  INDEX idx_station_type (station_id, type)
);


-- ============================================================
-- 5. JOURNEYS
-- ============================================================

CREATE TABLE IF NOT EXISTS journeys (
  id INT AUTO_INCREMENT PRIMARY KEY,

  user_id INT NULL,

  source VARCHAR(100) NOT NULL,

  destination VARCHAR(100) NOT NULL,

  travel_date DATE NOT NULL,

  overall_safety_score INT DEFAULT 0,

  total_duration VARCHAR(30),

  estimated_cost DECIMAL(10,2) DEFAULT 0,

  status ENUM(
    'planned',
    'active',
    'delayed',
    'recovery',
    'completed',
    'cancelled'
  ) DEFAULT 'planned',

  route_snapshot JSON NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL
);


-- ============================================================
-- 6. JOURNEY SEGMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS journey_segments (
  id INT AUTO_INCREMENT PRIMARY KEY,

  journey_id INT NOT NULL,

  train_id INT NULL,

  segment_order INT NOT NULL,

  source VARCHAR(100) NOT NULL,

  destination VARCHAR(100) NOT NULL,

  departure_time DATETIME NOT NULL,

  arrival_time DATETIME NOT NULL,

  connection_buffer INT DEFAULT 0,

  risk_score INT DEFAULT 0,

  risk_level ENUM(
    'LOW',
    'MEDIUM',
    'HIGH'
  ) DEFAULT 'LOW',

  status ENUM(
    'upcoming',
    'active',
    'completed',
    'delayed',
    'missed'
  ) DEFAULT 'upcoming',

  FOREIGN KEY (journey_id)
    REFERENCES journeys(id)
    ON DELETE CASCADE,

  FOREIGN KEY (train_id)
    REFERENCES trains(id)
    ON DELETE SET NULL,

  INDEX idx_journey_order (
    journey_id,
    segment_order
  )
);


-- ============================================================
-- 7. DELAY EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS delay_events (
  id INT AUTO_INCREMENT PRIMARY KEY,

  journey_id INT NOT NULL,

  train_id INT NULL,

  scheduled_arrival DATETIME NOT NULL,

  actual_arrival DATETIME NOT NULL,

  delay_minutes INT NOT NULL,

  connection_missed BOOLEAN DEFAULT FALSE,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (journey_id)
    REFERENCES journeys(id)
    ON DELETE CASCADE,

  FOREIGN KEY (train_id)
    REFERENCES trains(id)
    ON DELETE SET NULL
);


-- ============================================================
-- 8. RECOVERY PLANS
-- ============================================================

CREATE TABLE IF NOT EXISTS recovery_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,

  journey_id INT NOT NULL,

  missed_train_id INT NULL,

  alternative_train_id INT NULL,

  new_arrival_time DATETIME NULL,

  hotel_cost DECIMAL(10,2) DEFAULT 0,

  food_cost DECIMAL(10,2) DEFAULT 0,

  transport_cost DECIMAL(10,2) DEFAULT 0,

  train_cost DECIMAL(10,2) DEFAULT 0,

  total_additional_cost DECIMAL(10,2) DEFAULT 0,

  reason TEXT,

  status ENUM(
    'generated',
    'accepted',
    'rejected'
  ) DEFAULT 'generated',

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (journey_id)
    REFERENCES journeys(id)
    ON DELETE CASCADE,

  FOREIGN KEY (missed_train_id)
    REFERENCES trains(id)
    ON DELETE SET NULL,

  FOREIGN KEY (alternative_train_id)
    REFERENCES trains(id)
    ON DELETE SET NULL
);


-- ============================================================
-- END OF SCHEMA
-- ============================================================