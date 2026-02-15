const rateLimit = require('express-rate-limit');

/**
 * Rate limiter para rutas de autenticación (login, register).
 * Limita intentos por IP para mitigar fuerza bruta.
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 intentos por ventana
  message: { message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = authRateLimiter;
