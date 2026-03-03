-- Initialisation PostgreSQL + PostGIS pour Geo_Veh

CREATE EXTENSION IF NOT EXISTS postgis;

-- ======================
-- Tables
-- ======================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  plate_number VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS positions (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  location GEOGRAPHY(Point, 4326),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- Indexes
-- ======================

-- Obligatoire: index GIST sur la géographie pour accélérer ST_DWithin / KNN.
CREATE INDEX IF NOT EXISTS positions_location_gist_idx
ON positions
USING GIST (location);

-- (Optionnel mais utile) accélère les dernières positions / historiques.
CREATE INDEX IF NOT EXISTS positions_vehicle_recorded_at_idx
ON positions (vehicle_id, recorded_at DESC);

