const { loadEnv } = require("./config/env");
loadEnv(); // ← DOIT être avant tout le reste !

const { createApp } = require("./app");
const { pool } = require("./config/db");

const app = createApp();
const port = Number(process.env.PORT || 4000);

pool.query("SELECT 1")
  .then(() => {
    console.log("✅ Base de données connectée !");
    app.listen(port, () => {
      console.log(`🚀 API démarrée sur http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Impossible de se connecter à la DB :", err.message);
    process.exit(1);
  });