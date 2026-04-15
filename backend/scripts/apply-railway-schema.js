/**
 * Aplica sql/plataforma_cursos_schema_railway.sql usando credenciales de .env
 * (útil cuando MYSQL_DATABASE=railway en Railway).
 *
 * Uso: npm run db:apply-railway-schema
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../src/config');

async function main() {
  const sqlPath = path.join(__dirname, '../sql/plataforma_cursos_schema_railway.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('No se encuentra:', sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const conn = await mysql.createConnection({
    ...config.mysql,
    multipleStatements: true,
  });

  try {
    await conn.query(sql);
    console.log('Esquema aplicado en la base configurada (MYSQL_DATABASE). Tablas listas.');
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Error al aplicar esquema:', err.message);
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('Revisa MYSQL_USER / MYSQL_PASSWORD en .env');
  }
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    console.error('Revisa MYSQL_HOST / MYSQL_PORT y firewall. Prueba MYSQL_SSL=true en .env');
  }
  process.exit(1);
});
