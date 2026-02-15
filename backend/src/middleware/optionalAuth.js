const jwt = require('jsonwebtoken');
const config = require('../config');

function optionalAuth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), config.jwtSecret);
    req.user = decoded;
  } catch {
    // Token inválido, seguir sin usuario
  }
  next();
}

module.exports = optionalAuth;
