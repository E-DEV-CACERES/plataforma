const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.controller');

router.post('/stripe', stripeController.handleWebhook);

module.exports = router;
