require('dotenv').config();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || 'secret';
  if (process.env.NODE_ENV === 'production' && (!secret || secret === 'secret')) {
    throw new Error('ERROR CRÍTICO: JWT_SECRET no está configurado en producción. Configura una clave segura en las variables de entorno.');
  }
  return secret;
};

const getDbPassword = () => {
  const password = process.env.MYSQL_PASSWORD || '123456';
  if (process.env.NODE_ENV === 'production' && (!password || password === '123456')) {
    throw new Error('ERROR CRÍTICO: MYSQL_PASSWORD no está configurado de forma segura en producción. Usa una contraseña fuerte en las variables de entorno.');
  }
  return password;
};

const getCorsOrigins = () => {
  const defaults = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://127.0.0.1:5173',
  ];
  if (process.env.FRONTEND_URL) {
    const fromEnv = process.env.FRONTEND_URL.split(',').map((s) => s.trim()).filter(Boolean);
    return [...new Set([...fromEnv, ...defaults])];
  }
  return defaults;
};

/** Permite orígenes ngrok, localhost, 127.0.0.1 y red local (192.168.x.x, 10.x.x.x) en desarrollo */
const corsOriginFn = (origin, cb) => {
  const allowed = getCorsOrigins();
  if (!origin) return cb(null, true);
  if (allowed.includes(origin)) return cb(null, true);
  if (
    origin.endsWith('.ngrok-free.app') ||
    origin.endsWith('.ngrok-free.dev') ||
    origin.endsWith('.ngrok.io') ||
    origin.endsWith('.vercel.app')
  ) {
    return cb(null, true);
  }
  // En desarrollo: permitir 127.0.0.1 y red local (192.168.x.x, 10.x.x.x)
  if (process.env.NODE_ENV !== 'production') {
    try {
      const url = new URL(origin);
      const host = url.hostname;
      if (host === '127.0.0.1' || host === 'localhost') return cb(null, true);
      if (host.startsWith('192.168.') || host.startsWith('10.')) return cb(null, true);
    } catch {
      /* ignore */
    }
  }
  cb(new Error('CORS no permitido'));
};

module.exports = {
  port: Number(process.env.PORT) || 4000,
  corsOrigins: getCorsOrigins(),
  corsOriginFn,
  jwtSecret: getJwtSecret(),
  mysql: {
    host: process.env.MYSQL_HOST || (process.env.NODE_ENV === 'production' ? undefined : 'localhost'),
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: getDbPassword(),
    database: process.env.MYSQL_DATABASE || 'plataforma_cursos',
    // Railway / algunos hosts exigen TLS; si falla la conexión, pon MYSQL_SSL=true en .env
    ...(process.env.MYSQL_SSL === 'true' || process.env.MYSQL_SSL === '1'
      ? {
          ssl: {
            rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== 'false',
          },
        }
      : {}),
  },
};
