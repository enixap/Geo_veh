const { pool } = require("../config/db");

async function create({ vehicle_id, lat, lng, recorded_at }) {
  // Insertion via ST_SetSRID + ST_MakePoint en paramètres (anti injection).
  const { rows } = await pool.query(
    `
    INSERT INTO positions (vehicle_id, location, recorded_at)
    VALUES (
      $1,
      ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
      COALESCE($4::timestamp, CURRENT_TIMESTAMP)
    )
    RETURNING
      id,
      vehicle_id,
      ST_Y(location::geometry) AS lat,
      ST_X(location::geometry) AS lng,
      recorded_at
    `,
    [vehicle_id, lng, lat, recorded_at]
  );
  return rows[0];
}

async function latestByVehicle(vehicle_id) {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      vehicle_id,
      ST_Y(location::geometry) AS lat,
      ST_X(location::geometry) AS lng,
      recorded_at
    FROM positions
    WHERE vehicle_id = $1
    ORDER BY recorded_at DESC
    LIMIT 1
    `,
    [vehicle_id]
  );
  return rows[0] || null;
}

async function historyByVehicle(vehicle_id, { from, to, limit }) {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      vehicle_id,
      ST_Y(location::geometry) AS lat,
      ST_X(location::geometry) AS lng,
      recorded_at
    FROM positions
    WHERE vehicle_id = $1
      AND ($2::timestamp IS NULL OR recorded_at >= $2::timestamp)
      AND ($3::timestamp IS NULL OR recorded_at <= $3::timestamp)
    ORDER BY recorded_at ASC
    LIMIT $4
    `,
    [vehicle_id, from, to, limit]
  );
  return rows;
}

async function latestPositionsForAllVehicles() {
  // DISTINCT ON = "dernière position" par véhicule (rapide + simple).
  const { rows } = await pool.query(
    `
    SELECT DISTINCT ON (p.vehicle_id)
      p.vehicle_id,
      ST_Y(p.location::geometry) AS lat,
      ST_X(p.location::geometry) AS lng,
      p.recorded_at
    FROM positions p
    ORDER BY p.vehicle_id, p.recorded_at DESC
    `
  );
  return rows;
}

module.exports = {
  create,
  latestByVehicle,
  historyByVehicle,
  latestPositionsForAllVehicles
};

