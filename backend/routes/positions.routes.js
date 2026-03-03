const express = require("express");
const { body, param, query } = require("express-validator");

const { authJwt } = require("../middleware/authJwt");
const { validate } = require("../middleware/validate");
const positionsController = require("../controllers/positions.controller");

const router = express.Router();

router.use(authJwt);

router.post(
  "/",
  [
    body("vehicle_id").isInt({ min: 1 }).withMessage("vehicle_id invalide."),
    body("lat").isFloat({ min: -90, max: 90 }).withMessage("Latitude invalide."),
    body("lng")
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude invalide."),
    body("recorded_at")
      .optional()
      .isISO8601()
      .withMessage("recorded_at doit être une date ISO8601.")
  ],
  validate,
  positionsController.record
);

router.get(
  "/vehicle/:vehicleId/latest",
  [param("vehicleId").isInt({ min: 1 }).withMessage("ID invalide.")],
  validate,
  positionsController.latestByVehicle
);

router.get(
  "/vehicle/:vehicleId/history",
  [
    param("vehicleId").isInt({ min: 1 }).withMessage("ID invalide."),
    query("from").optional().isISO8601().withMessage("from invalide."),
    query("to").optional().isISO8601().withMessage("to invalide."),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 10000 })
      .withMessage("limit invalide (1..10000).")
  ],
  validate,
  positionsController.historyByVehicle
);

module.exports = router;

