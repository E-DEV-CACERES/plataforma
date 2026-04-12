/**
 * Migración: añade el rol 'instructor' al ENUM de users.
 * Ejecutar: node scripts/add-instructor-role.js
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

async function run() {
  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('Conectado a MySQL...');

    await conn.query(`
      ALTER TABLE users
      MODIFY COLUMN role ENUM('admin', 'user', 'instructor') NOT NULL DEFAULT 'user'
    `);
    console.log('Rol instructor añadido al ENUM.');

    console.log('\n✅ Migración completada.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

run();
