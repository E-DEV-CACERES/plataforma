/**
 * Migración: añade campos de precio a la tabla courses.
 * Ejecutar: node scripts/add-course-pricing.js
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

    const columns = [
      { name: 'is_free', sql: 'ADD COLUMN is_free TINYINT(1) NOT NULL DEFAULT 1' },
      { name: 'price', sql: 'ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0' },
      { name: 'discount_percent', sql: 'ADD COLUMN discount_percent INT UNSIGNED NOT NULL DEFAULT 0' },
      { name: 'coupon_code', sql: 'ADD COLUMN coupon_code VARCHAR(50) NULL' },
    ];

    for (const col of columns) {
      try {
        await conn.query(`ALTER TABLE courses ${col.sql}`);
        console.log(`Columna ${col.name} OK`);
      } catch (e) {
        if (e.code === 'ER_DUP_FIELD') {
          console.log(`${col.name} ya existe`);
        } else throw e;
      }
    }

    console.log('\n✅ Migración de precios completada.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

migrate();
