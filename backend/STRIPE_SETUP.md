# Configuración de Stripe para pagos de cursos

## 1. Variables de entorno

Añade a tu archivo `.env`:

```env
# Stripe (obtén las claves en https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...

# Webhook (obtén el signing secret en https://dashboard.stripe.com/webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...

# URL del frontend (para success/cancel del checkout)
FRONTEND_URL=http://localhost:5173
```

## 2. Crear producto y precio en Stripe

1. Entra a [Stripe Dashboard](https://dashboard.stripe.com) > Productos
2. Crea un producto (ej: "Curso de React")
3. Añade un precio (ej: 29.99 USD)
4. Copia el **Price ID** (empieza con `price_`)

## 3. Vincular el precio al curso

- En **Admin** > Editar curso: pega el Price ID en "Stripe Price ID"
- O al **Crear curso** (de pago): pega el Price ID en "Stripe Price ID"

## 4. Webhook para producción

Para que Stripe inscriba al usuario tras el pago:

1. Instala Stripe CLI: `stripe login`
2. En desarrollo, reenvía webhooks: `stripe listen --forward-to localhost:4000/api/webhooks/stripe`
3. Copia el `whsec_...` que muestra y ponlo en `STRIPE_WEBHOOK_SECRET`
4. En producción, crea un webhook en Dashboard: `https://tu-dominio.com/api/webhooks/stripe` con evento `checkout.session.completed`

## 5. Flujo

- **Curso gratis**: botón "Inscribirse" → inscripción directa
- **Curso de pago** (con Stripe Price ID): botón "Comprar" → redirige a Stripe Checkout → tras pago → webhook inscribe al usuario
