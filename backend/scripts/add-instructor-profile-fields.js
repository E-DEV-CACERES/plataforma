/**
 * Migración: añade campos de perfil de instructor a la tabla users.
 * Ejecutar: node scripts/add-instructor-profile-fields.js
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

const COLUMNS = [
  { name: 'instructor_tagline', sql: 'VARCHAR(255) NULL' },
  { name: 'instructor_bio', sql: 'TEXT NULL' },
  { name: 'instructor_website', sql: 'VARCHAR(500) NULL' },
  { name: 'instructor_linkedin', sql: 'VARCHAR(500) NULL' },
  { name: 'instructor_twitter', sql: 'VARCHAR(500) NULL' },
  { name: 'instructor_youtube', sql: 'VARCHAR(500) NULL' },
];

async function run() {
  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('Conectado a MySQL...');

    for (const col of COLUMNS) {
      try {
        await conn.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.sql} AFTER role`);
        console.log(`Columna ${col.name} OK`);
      } catch (e) {
        if (e.code === 'ER_DUP_FIELD') console.log(`${col.name} ya existe`);
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

run();
