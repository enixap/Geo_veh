const vehicleModel = require("../models/vehicle.model");

async function list() {
  return vehicleModel.list();
}

async function getById(id) {
  const vehicle = await vehicleModel.getById(id);
  if (!vehicle) {
    const err = new Error("Véhicule introuvable.");
    err.statusCode = 404;
    err.publicMessage = "Véhicule introuvable.";
    throw err;
  }
  return vehicle;
}

async function create({ name, plate_number }) {
  return vehicleModel.create({ name, plate_number });
}

async function update(id, { name, plate_number }) {
  const vehicle = await vehicleModel.update(id, { name, plate_number });
  if (!vehicle) {
    const err = new Error("Véhicule introuvable.");
    err.statusCode = 404;
    err.publicMessage = "Véhicule introuvable.";
    throw err;
  }
  return vehicle;
}

async function remove(id) {
  const ok = await vehicleModel.remove(id);
  if (!ok) {
    const err = new Error("Véhicule introuvable.");
    err.statusCode = 404;
    err.publicMessage = "Véhicule introuvable.";
    throw err;
  }
}

module.exports = { list, getById, create, update, remove };

