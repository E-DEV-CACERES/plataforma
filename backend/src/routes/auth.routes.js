const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authRateLimiter = require('../middleware/rateLimitAuth');

const router = express.Router();

router.use(authRateLimiter);

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Nombre requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Contraseña mínimo 6 caracteres'),
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña requerida'),
  ],
  authController.login
);

module.exports = router;
