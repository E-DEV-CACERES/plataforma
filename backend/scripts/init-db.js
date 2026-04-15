/**
 * Crea la base `plataforma_cursos` y todas las tablas desde el SQL consolidado.
 * Ejecutar: npm run db:init
 *
 * Requiere MySQL accesible (local o remoto). Usa .env si existe.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '123456',
};

async function init() {
  const sqlPath = path.join(__dirname, '../sql/plataforma_cursos_schema.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('No se encuentra:', sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const conn = await mysql.createConnection({
    ...config,
    multipleStatements: true,
  });

  try {
    await conn.query(sql);
    console.log('✅ Base y tablas listas (sql/plataforma_cursos_schema.sql).');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

init();
