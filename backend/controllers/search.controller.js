const searchService = require("../services/search.service");

async function withinRadius(req, res, next) {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius_m = Number(req.query.radius_m);
    const vehicles = await searchService.withinRadius({ lat, lng, radius_m });
    return res.json({ vehicles });
  } catch (err) {
    return next(err);
  }
}

async function nearest(req, res, next) {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const result = await searchService.nearest({ lat, lng });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { withinRadius, nearest };

