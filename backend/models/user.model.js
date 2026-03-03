const { pool } = require("../config/db");

async function getByEmail(email) {
  const { rows } = await pool.query(
    "SELECT id, email, password FROM users WHERE email = $1",
    [email]
  );
  return rows[0] || null;
}

async function create({ email, passwordHash }) {
  const { rows } = await pool.query(
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
    [email, passwordHash]
  );
  return rows[0];
}

module.exports = { getByEmail, create };

