const express = require("express");
const { query } = require("express-validator");

const { authJwt } = require("../middleware/authJwt");
const { validate } = require("../middleware/validate");
const searchController = require("../controllers/search.controller");

const router = express.Router();

router.use(authJwt);

router.get(
  "/within-radius",
  [
    query("lat").isFloat({ min: -90, max: 90 }).withMessage("Latitude invalide."),
    query("lng")
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude invalide."),
    query("radius_m")
      .isInt({ min: 1, max: 500000 })
      .withMessage("radius_m invalide (1..500000).")
  ],
  validate,
  searchController.withinRadius
);

router.get(
  "/nearest",
  [
    query("lat").isFloat({ min: -90, max: 90 }).withMessage("Latitude invalide."),
    query("lng")
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude invalide.")
  ],
  validate,
  searchController.nearest
);

module.exports = router;

