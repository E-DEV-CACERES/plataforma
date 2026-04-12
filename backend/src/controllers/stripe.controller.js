const stripeService = require('../services/stripe.service');
const { AppError } = require('../utils/errors');

async function createCheckoutSession(req, res, next) {
  try {
    const { id } = req.params;
    const courseId = parseInt(id, 10);
    if (isNaN(courseId)) {
      throw new AppError('ID de curso inválido.', 400);
    }
    const result = await stripeService.createCheckoutSession(courseId, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function handleWebhook(req, res, next) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Stripe] STRIPE_WEBHOOK_SECRET no configurado');
    return res.status(500).json({ message: 'Webhook no configurado' });
  }

  let event;
  try {
    event = stripeService.stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('[Stripe] Webhook signature verification failed:', err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    try {
      await stripeService.handleCheckoutCompleted(event.data.object);
    } catch (err) {
      console.error('[Stripe] Error procesando checkout.session.completed:', err);
    }
  }

  res.json({ received: true });
}

module.exports = {
  createCheckoutSession,
  handleWebhook,
};
