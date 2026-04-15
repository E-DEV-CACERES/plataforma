/**
 * Lista todos los usuarios (sin contraseña).
 * Uso: npm run user:list
 */
require('dotenv').config();
const db = require('../src/db');

async function main() {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at AS createdAt FROM users ORDER BY id ASC'
    );

    if (!rows.length) {
      console.log('No hay usuarios en la base de datos.');
      return;
    }

    console.log(`Total: ${rows.length} usuario(s)\n`);
    console.table(
      rows.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      }))
    );
  } catch (err) {
    if (err.code === 'ER_BAD_FIELD_ERROR' || err.message?.includes('Unknown column')) {
      const [rows] = await db.query(
        'SELECT id, name, email, role FROM users ORDER BY id ASC'
      );
      if (!rows.length) {
        console.log('No hay usuarios.');
        return;
      }
      console.table(rows);
      return;
    }
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

main();
