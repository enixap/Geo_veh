const path = require("path");
const dotenv = require("dotenv");

function loadEnv() {
  // Charge .env depuis backend/.env (ou variables système)
  dotenv.config({ path: path.join(process.cwd(), ".env") });

  const required = ["JWT_SECRET"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`Variables d'environnement manquantes: ${missing.join(", ")}`);
  }
}

module.exports = { loadEnv };

