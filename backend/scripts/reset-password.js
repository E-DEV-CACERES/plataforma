/**
 * Script para restablecer la contraseña de un usuario por email.
 * Uso: node scripts/reset-password.js <email> <nueva_contraseña>
 * Ejemplo: node scripts/reset-password.js admin@ejemplo.com MiNuevaPass123
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/db');

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.log('\nUso: node scripts/reset-password.js <email> <nueva_contraseña>');
    console.log('Ejemplo: node scripts/reset-password.js usuario@ejemplo.com MiNuevaPass123\n');
    process.exit(1);
  }

  try {
    const [[user]] = await db.query('SELECT id, email FROM users WHERE email = ?', [email]);
    if (!user) {
      console.log(`\n No se encontró ningún usuario con el email: ${email}\n`);
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    console.log(`\n Contraseña actualizada correctamente para ${email}`);
    console.log('Ya puedes iniciar sesión con la nueva contraseña.\n');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

resetPassword();
