const { pool } = require("../config/db");

async function vehiclesWithinRadius({ lat, lng, radius_m }) {
  const { rows } = await pool.query(
    `
    WITH latest AS (
      SELECT DISTINCT ON (p.vehicle_id)
        p.vehicle_id,
        p.location,
        p.recorded_at
      FROM positions p
      ORDER BY p.vehicle_id, p.recorded_at DESC
    )
    SELECT
      v.id,
      v.name,
      v.plate_number,
      ST_Y(latest.location::geometry) AS lat,
      ST_X(latest.location::geometry) AS lng,
      latest.recorded_at
    FROM vehicles v
    JOIN latest ON latest.vehicle_id = v.id
    WHERE ST_DWithin(
      latest.location,
      ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
      $3
    )
    ORDER BY v.id ASC
    `,
    [lng, lat, radius_m]
  );
  return rows;
}

async function nearestVehicle({ lat, lng }) {
  // KNN avec l'opérateur <-> pour obtenir le plus proche sur la dernière position.
  const { rows } = await pool.query(
    `
    WITH latest AS (
      SELECT DISTINCT ON (p.vehicle_id)
        p.vehicle_id,
        p.location,
        p.recorded_at
      FROM positions p
      ORDER BY p.vehicle_id, p.recorded_at DESC
    ),
    ref AS (
      SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography AS g
    )
    SELECT
      v.id,
      v.name,
      v.plate_number,
      ST_Y(latest.location::geometry) AS lat,
      ST_X(latest.location::geometry) AS lng,
      latest.recorded_at,
      ST_Distance(latest.location, ref.g) AS distance_m
    FROM vehicles v
    JOIN latest ON latest.vehicle_id = v.id
    CROSS JOIN ref
    ORDER BY (latest.location <-> ref.g) ASC
    LIMIT 1
    `,
    [lng, lat]
  );
  return rows[0] || null;
}

module.exports = { vehiclesWithinRadius, nearestVehicle };

