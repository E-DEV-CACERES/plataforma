/**
 * Migración: añade imagen de perfil y portada para instructores.
 * Ejecutar: node scripts/add-instructor-images.js
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

const columns = [
  { name: 'instructor_profile_image', sql: 'ADD COLUMN instructor_profile_image VARCHAR(500) NULL' },
  { name: 'instructor_cover_image', sql: 'ADD COLUMN instructor_cover_image VARCHAR(500) NULL' },
];

async function migrate() {
  let conn;
  try {
    conn = await mysql.createConnection(config);

    for (const { name, sql } of columns) {
      try {
        await conn.query(`ALTER TABLE users ${sql}`);
        console.log(`Columna ${name} OK`);
      } catch (e) {
        if (e.code === 'ER_DUP_FIELD') console.log(`${name} ya existe`);
        else throw e;
      }
    }

    console.log('\n✅ Migración completada.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

migrate();
