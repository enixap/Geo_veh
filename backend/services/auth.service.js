const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = require("../models/user.model");

function createToken(user) {
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
  return jwt.sign(
    { email: user.email },
    process.env.JWT_SECRET,
    { subject: String(user.id), expiresIn }
  );
}

async function register({ email, password }) {
  const existing = await userModel.getByEmail(email);
  if (existing) {
    const err = new Error("Email déjà utilisé.");
    err.statusCode = 409;
    err.publicMessage = "Email déjà utilisé.";
    throw err;
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = await userModel.create({ email, passwordHash });
  const token = createToken(user);

  return {
    user: { id: user.id, email: user.email },
    token
  };
}

async function login({ email, password }) {
  const user = await userModel.getByEmail(email);
  if (!user) {
    const err = new Error("Identifiants invalides.");
    err.statusCode = 401;
    err.publicMessage = "Identifiants invalides.";
    throw err;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const err = new Error("Identifiants invalides.");
    err.statusCode = 401;
    err.publicMessage = "Identifiants invalides.";
    throw err;
  }

  const token = createToken(user);
  return {
    user: { id: user.id, email: user.email },
    token
  };
}

module.exports = { register, login };

