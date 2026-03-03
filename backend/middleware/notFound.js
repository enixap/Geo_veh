function notFound(req, res) {
  return res.status(404).json({ message: "Endpoint introuvable." });
}

module.exports = { notFound };

