const MYSQL_FK_ERROR = 1452; // ER_NO_REFERENCED_ROW_2

function errorHandler(err, req, res, next) {
  console.error('Error global:', err?.message || err);
  if (err?.stack) console.error(err.stack);
  if (err?.errno) console.error('MySQL errno:', err.errno);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // Errores de MySQL: FK constraint = datos inconsistentes (sesión inválida, etc.)
  if (err.errno === MYSQL_FK_ERROR) {
    statusCode = 400;
    message = 'Sesión inválida o datos inconsistentes. Cierra sesión e inicia de nuevo.';
  }

  res.status(statusCode).json({ message });
}

module.exports = errorHandler;
