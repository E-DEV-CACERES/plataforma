const { AppError } = require('../utils/errors');

const MAX_SEARCH_LENGTH = 100;

function requirePositiveIntParam(paramName) {
  return (req, _res, next) => {
    const rawValue = req.params?.[paramName];
    const parsedValue = Number(rawValue);

    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
      return next(new AppError(`Parámetro inválido: ${paramName}`, 400));
    }

    req.params[paramName] = String(parsedValue);
    return next();
  };
}

function sanitizeSearchQuery(req, _res, next) {
  const rawSearch = req.query?.search ?? req.query?.q ?? '';

  if (typeof rawSearch !== 'string') {
    return next(new AppError('El parámetro de búsqueda debe ser texto.', 400));
  }

  const normalized = rawSearch.trim().replace(/\s+/g, ' ');
  if (normalized.length > MAX_SEARCH_LENGTH) {
    return next(new AppError(`La búsqueda excede ${MAX_SEARCH_LENGTH} caracteres.`, 400));
  }

  req.safeSearch = normalized;
  return next();
}

module.exports = {
  requirePositiveIntParam,
  sanitizeSearchQuery,
};
