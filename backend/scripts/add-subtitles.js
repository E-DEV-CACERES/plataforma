/**
 * Migración: añade columna subtitle_url a la tabla videos.
 * Ejecutar: node scripts/add-subtitles.js
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
    await conn.query(`
      ALTER TABLE videos ADD COLUMN subtitle_url VARCHAR(500) NULL AFTER video_url
    `);
    console.log('✅ Columna subtitle_url añadida.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELD' || err.message?.includes('Duplicate column')) {
      console.log('✅ Columna subtitle_url ya existe.');
    } else {
      throw err;
    }
  } finally {
    if (conn) await conn.end();
  }
}

migrate().then(() => console.log('✅ Migración completada.')).catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
