const express = require("express");
const { body, param } = require("express-validator");

const { authJwt } = require("../middleware/authJwt");
const { validate } = require("../middleware/validate");
const vehicleController = require("../controllers/vehicles.controller");

const router = express.Router();

router.use(authJwt);

router.get("/", vehicleController.list);

router.get(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("ID invalide.")],
  validate,
  vehicleController.getById
);

router.post(
  "/",
  [
    body("name").isString().isLength({ min: 1 }).withMessage("Nom requis."),
    body("plate_number")
      .isString()
      .isLength({ min: 1 })
      .withMessage("Immatriculation requise.")
  ],
  validate,
  vehicleController.create
);

router.put(
  "/:id",
  [
    param("id").isInt({ min: 1 }).withMessage("ID invalide."),
    body("name").optional().isString().withMessage("Nom invalide."),
    body("plate_number")
      .optional()
      .isString()
      .withMessage("Immatriculation invalide.")
  ],
  validate,
  vehicleController.update
);

router.delete(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("ID invalide.")],
  validate,
  vehicleController.remove
);

module.exports = router;

