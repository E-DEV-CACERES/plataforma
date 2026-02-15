/**
 * Convierte un usuario a administrador por email.
 * Uso: node scripts/make-admin.js <email>
 * Ejemplo: node scripts/make-admin.js admin@ejemplo.com
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '123456',
  database: process.env.MYSQL_DATABASE || 'plataforma_cursos',
};

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.log('Uso: node scripts/make-admin.js <email>');
    console.log('Ejemplo: node scripts/make-admin.js tu@email.com');
    process.exit(1);
  }

  let conn;
  try {
    conn = await mysql.createConnection(config);
    const [result] = await conn.query(
      'UPDATE users SET role = ? WHERE email = ?',
      ['admin', email]
    );
    if (result.affectedRows === 0) {
      console.log(`No se encontró ningún usuario con el email: ${email}`);
      console.log('Primero regístrate en la app y luego ejecuta este script.');
      process.exit(1);
    }
    console.log(`✅ Usuario ${email} ahora es administrador.`);
    console.log('Inicia sesión con ese email en la plataforma.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

makeAdmin();
