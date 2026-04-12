/**
 * Migración: añade campos estilo Udemy a courses.
 * Ejecutar: node scripts/add-udemy-fields.js
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
  { name: 'subtitle', sql: 'ADD COLUMN subtitle VARCHAR(500) NULL AFTER description' },
  { name: 'learning_objectives', sql: 'ADD COLUMN learning_objectives TEXT NULL' },
  { name: 'requirements', sql: 'ADD COLUMN requirements TEXT NULL' },
  { name: 'who_is_for', sql: 'ADD COLUMN who_is_for TEXT NULL' },
  { name: 'categories', sql: 'ADD COLUMN categories TEXT NULL' },
  { name: 'language', sql: "ADD COLUMN language VARCHAR(50) NULL DEFAULT 'Spanish'" },
];

async function migrate() {
  let conn;
  try {
    conn = await mysql.createConnection(config);

    for (const { name, sql } of columns) {
      try {
        await conn.query(`ALTER TABLE courses ${sql}`);
        console.log(`Columna ${name} OK`);
      } catch (e) {
        if (e.code === 'ER_DUP_FIELD') console.log(`${name} ya existe`);
        else throw e;
      }
    }

    console.log('\nMigración completada.');
    console.log('   Campos añadidos: subtitle, learning_objectives, requirements, who_is_for, categories, language');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

migrate();
