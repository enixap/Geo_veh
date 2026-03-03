function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.publicMessage || "Erreur interne du serveur.";
  return res.status(status).json({ message });
}

module.exports = { errorHandler };

