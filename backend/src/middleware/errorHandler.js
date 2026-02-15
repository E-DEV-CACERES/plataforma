function errorHandler(err, req, res, next) {
  console.error('Error global:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(statusCode).json({ message });
}

module.exports = errorHandler;
