const { pool } = require("../config/db");

async function list() {
  const { rows } = await pool.query(
    "SELECT id, name, plate_number FROM vehicles ORDER BY id ASC"
  );
  return rows;
}

async function getById(id) {
  const { rows } = await pool.query(
    "SELECT id, name, plate_number FROM vehicles WHERE id = $1",
    [id]
  );
  return rows[0] || null;
}

async function create({ name, plate_number }) {
  const { rows } = await pool.query(
    "INSERT INTO vehicles (name, plate_number) VALUES ($1, $2) RETURNING id, name, plate_number",
    [name, plate_number]
  );
  return rows[0];
}

async function update(id, { name, plate_number }) {
  const { rows } = await pool.query(
    `
    UPDATE vehicles
    SET
      name = COALESCE($2, name),
      plate_number = COALESCE($3, plate_number)
    WHERE id = $1
    RETURNING id, name, plate_number
    `,
    [id, name ?? null, plate_number ?? null]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await pool.query("DELETE FROM vehicles WHERE id = $1", [
    id
  ]);
  return rowCount > 0;
}

module.exports = { list, getById, create, update, remove };

