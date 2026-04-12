/**
 * Migración: añade stripe_price_id a la tabla courses.
 * Ejecutar: node scripts/add-stripe-price-id.js
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

async function migrate() {
  let conn;
  try {
    conn = await mysql.createConnection(config);
    try {
      await conn.query(
        'ALTER TABLE courses ADD COLUMN stripe_price_id VARCHAR(255) NULL'
      );
      console.log('Columna stripe_price_id OK');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELD') {
        console.log('stripe_price_id ya existe');
      } else throw e;
    }
    console.log('\n✅ Migración Stripe completada.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

migrate();
