const searchModel = require("../models/search.model");

async function withinRadius({ lat, lng, radius_m }) {
  return searchModel.vehiclesWithinRadius({ lat, lng, radius_m });
}

async function nearest({ lat, lng }) {
  const vehicle = await searchModel.nearestVehicle({ lat, lng });
  return { vehicle }; // peut être null si aucune position existante
}

module.exports = { withinRadius, nearest };

