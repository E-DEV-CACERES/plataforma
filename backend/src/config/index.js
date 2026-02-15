require('dotenv').config();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || 'secret';
  if (process.env.NODE_ENV === 'production' && secret === 'secret') {
    console.warn('ADVERTENCIA: JWT_SECRET no configurado. Usa una clave segura en producción.');
  }
  return secret;
};

const getCorsOrigins = () => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.split(',').map((s) => s.trim());
  }
  return ['http://localhost:3000', 'http://localhost:5173'];
};

module.exports = {
  port: Number(process.env.PORT) || 4000,
  corsOrigins: getCorsOrigins(),
  jwtSecret: getJwtSecret(),
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '123456',
    database: process.env.MYSQL_DATABASE || 'plataforma_cursos',
  },
};
