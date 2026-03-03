const positionsService = require("../services/positions.service");

async function record(req, res, next) {
  try {
    const { vehicle_id, lat, lng, recorded_at } = req.body;
    const position = await positionsService.record({
      vehicle_id: Number(vehicle_id),
      lat: Number(lat),
      lng: Number(lng),
      recorded_at: recorded_at || null
    });
    return res.status(201).json({ position });
  } catch (err) {
    return next(err);
  }
}

async function latestByVehicle(req, res, next) {
  try {
    const vehicleId = Number(req.params.vehicleId);
    const position = await positionsService.latestByVehicle(vehicleId);
    return res.json({ position });
  } catch (err) {
    return next(err);
  }
}

async function historyByVehicle(req, res, next) {
  try {
    const vehicleId = Number(req.params.vehicleId);
    const { from, to, limit } = req.query;
    const positions = await positionsService.historyByVehicle(vehicleId, {
      from: from || null,
      to: to || null,
      limit: limit ? Number(limit) : 1000
    });
    return res.json({ positions });
  } catch (err) {
    return next(err);
  }
}

async function latestForAll(req, res, next) {
  try {
    const positions = await positionsService.latestForAllVehicles();
    return res.json({ positions });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  record,
  latestByVehicle,
  historyByVehicle,
  latestForAll
};

