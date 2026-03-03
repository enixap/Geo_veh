const vehicleService = require("../services/vehicles.service");

async function list(req, res, next) {
  try {
    const vehicles = await vehicleService.list();
    return res.json({ vehicles });
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const vehicle = await vehicleService.getById(id);
    return res.json({ vehicle });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, plate_number } = req.body;
    const vehicle = await vehicleService.create({ name, plate_number });
    return res.status(201).json({ vehicle });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { name, plate_number } = req.body;
    const vehicle = await vehicleService.update(id, { name, plate_number });
    return res.json({ vehicle });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    await vehicleService.remove(id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, getById, create, update, remove };

