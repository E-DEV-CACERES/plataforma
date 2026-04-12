const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
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

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(
  cors({
    origin: config.corsOriginFn,
    credentials: true,
  })
);

const videoMimeTypes = { '.mp4': 'video/mp4', '.m4v': 'video/mp4', '.webm': 'video/webm', '.ogg': 'video/ogg', '.mov': 'video/quicktime', '.avi': 'video/x-msvideo' };
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Accept-Ranges', 'bytes');
    if (filePath.endsWith('.vtt')) {
      res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
    } else {
      const ext = path.extname(filePath).toLowerCase();
      if (videoMimeTypes[ext]) res.setHeader('Content-Type', videoMimeTypes[ext]);
    }
  },
}));
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
