const { Pool } = require("pg");

function buildPoolConfig() {
  // Supporte DATABASE_URL (ex: Render/Heroku) ou config détaillée.
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.PGSSLMODE === "require"
          ? { rejectUnauthorized: false }
          : undefined
    };
  }

  return {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || "geo_veh",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || ""
  };
}

const pool = new Pool(buildPoolConfig());

pool.on("error", (err) => {
  // Erreur fatale côté pool : on la remonte clairement.
  // eslint-disable-next-line no-console
  console.error("Erreur inattendue du pool PostgreSQL:", err);
});

module.exports = { pool };

