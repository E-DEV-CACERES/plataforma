const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const mountRoutes = require('./routes');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);

// Webhook Stripe debe recibir body raw (antes de express.json)
app.use(
  '/api/webhooks',
  express.raw({ type: 'application/json' }),
  require('./routes/webhooks.routes')
);

app.use(
  cors({
    origin: config.corsOriginFn,
    credentials: true,
  })
);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(logger);

app.get('/', (req, res) => {
  res.send('API de plataforma de cursos funcionando');
});

mountRoutes(app);

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.use(errorHandler);

module.exports = app;
