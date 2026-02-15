const jwt = require('jsonwebtoken');
const config = require('../config');

function auth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Token requerido.' });
  }
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido.' });
  }
}

module.exports = auth;
