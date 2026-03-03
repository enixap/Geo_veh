const authService = require("../services/auth.service");

async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.register({ email, password });
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login };

