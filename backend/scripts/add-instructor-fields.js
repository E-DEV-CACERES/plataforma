/**
 * Migración: añade instructor_bio e instructor_tagline a courses.
 * Ejecutar: node scripts/add-instructor-fields.js
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
      await conn.query('ALTER TABLE courses ADD COLUMN instructor_tagline VARCHAR(255) NULL AFTER content');
      console.log('Columna instructor_tagline OK');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELD') console.log('instructor_tagline ya existe');
      else throw e;
    }

    try {
      await conn.query('ALTER TABLE courses ADD COLUMN instructor_bio TEXT NULL AFTER instructor_tagline');
      console.log('Columna instructor_bio OK');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELD') console.log('instructor_bio ya existe');
      else throw e;
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
