const vehicleModel = require("../models/vehicle.model");
const positionsModel = require("../models/position.model");

async function record({ vehicle_id, lat, lng, recorded_at }) {
  const vehicle = await vehicleModel.getById(vehicle_id);
  if (!vehicle) {
    const err = new Error("Véhicule introuvable.");
    err.statusCode = 404;
    err.publicMessage = "Véhicule introuvable.";
    throw err;
  }
  return positionsModel.create({ vehicle_id, lat, lng, recorded_at });
}

async function latestByVehicle(vehicle_id) {
  const vehicle = await vehicleModel.getById(vehicle_id);
  if (!vehicle) {
    const err = new Error("Véhicule introuvable.");
    err.statusCode = 404;
    err.publicMessage = "Véhicule introuvable.";
    throw err;
  }

  const pos = await positionsModel.latestByVehicle(vehicle_id);
  return pos; // peut être null si aucune position
}

async function historyByVehicle(vehicle_id, { from, to, limit }) {
  const vehicle = await vehicleModel.getById(vehicle_id);
  if (!vehicle) {
    const err = new Error("Véhicule introuvable.");
    err.statusCode = 404;
    err.publicMessage = "Véhicule introuvable.";
    throw err;
  }
  return positionsModel.historyByVehicle(vehicle_id, { from, to, limit });
}

module.exports = { record, latestByVehicle, historyByVehicle };

