/**
 * Script para listar los usuarios de la tabla users.
 * Ejecutar: node scripts/list-users.js
 */
require('dotenv').config();
const db = require('../src/db');

async function listUsers() {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY id'
    );
    console.log('\n=== Usuarios en la tabla users ===\n');
    if (rows.length === 0) {
      console.log('No hay usuarios registrados.\n');
      return;
    }
    console.table(rows);
    console.log(`Total: ${rows.length} usuario(s)\n`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

listUsers();
