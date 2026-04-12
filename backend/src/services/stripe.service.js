const Stripe = require('stripe');
const courseRepository = require('../repositories/course.repository');
const userRepository = require('../repositories/user.repository');
const { AppError } = require('../utils/errors');

let _stripe = null;
function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
    _stripe = new Stripe(key);
  }
  return _stripe;
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Crea una sesión de Stripe Checkout para un curso de pago.
 * @param {number} courseId - ID del curso
 * @param {number} userId - ID del usuario
 * @returns {Promise<{ url: string }>}
 */
async function createCheckoutSession(courseId, userId) {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_placeholder')) {
    throw new AppError('Pagos no configurados. Añade STRIPE_SECRET_KEY al .env', 503);
  }

  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw new AppError('Curso no encontrado.', 404);
  }

  if (course.isFree || (course.price ?? 0) <= 0) {
    throw new AppError('Este curso es gratuito. Usa Inscribirse.', 400);
  }

  const stripePriceId = course.stripePriceId || course.stripe_price_id;
  if (!stripePriceId) {
    throw new AppError(
      'Este curso no tiene un precio de Stripe configurado. El instructor debe añadir el Price ID en la configuración del curso.',
      400
    );
  }

  const alreadyEnrolled = await courseRepository.isEnrolled(courseId, userId);
  if (alreadyEnrolled) {
    throw new AppError('Ya estás inscrito en este curso.', 400);
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('Usuario no encontrado.', 404);
  }

  const baseUrl = FRONTEND_URL.split(',')[0].trim();
  const successUrl = `${baseUrl}/course/${courseId}/learn?payment=success`;
  const cancelUrl = `${baseUrl}/course/${courseId}?payment=cancelled`;

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: stripePriceId,
        quantity: 1,
      },
    ],
    metadata: {
      courseId: String(courseId),
      userId: String(userId),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: user.email,
  });

  return { url: session.url };
}

/**
 * Procesa el webhook de Stripe (checkout.session.completed).
 * Inscribe al usuario en el curso tras pago exitoso.
 * @param {object} session - Stripe Checkout Session
 */
async function handleCheckoutCompleted(session) {
  const courseId = parseInt(session.metadata?.courseId, 10);
  const userId = parseInt(session.metadata?.userId, 10);

  if (!courseId || !userId || isNaN(courseId) || isNaN(userId)) {
    console.error('[Stripe] metadata inválida en checkout.session.completed:', session.metadata);
    return;
  }

  const alreadyEnrolled = await courseRepository.isEnrolled(courseId, userId);
  if (alreadyEnrolled) {
    return;
  }

  await courseRepository.enroll(courseId, userId);
  console.log(`[Stripe] Usuario ${userId} inscrito en curso ${courseId} tras pago.`);
}

module.exports = {
  get stripe() {
    return getStripe();
  },
  createCheckoutSession,
  handleCheckoutCompleted,
};
