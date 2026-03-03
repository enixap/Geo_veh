const express = require("express");
const { body } = require("express-validator");

const { validate } = require("../middleware/validate");
const { register, login } = require("../controllers/auth.controller");

const router = express.Router();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Email invalide."),
    body("password")
      .isString()
      .isLength({ min: 8 })
      .withMessage("Mot de passe trop court (min 8).")
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email invalide."),
    body("password").isString().withMessage("Mot de passe requis.")
  ],
  validate,
  login
);

module.exports = router;

