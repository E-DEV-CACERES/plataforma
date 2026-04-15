require('dotenv').config();
const bcrypt = require('bcryptjs');
const userRepository = require('../src/repositories/user.repository');
const db = require('../src/db');

function getArgValue(flagName) {
  const arg = process.argv.find((item) => item.startsWith(`${flagName}=`));
  if (arg) return arg.slice(flagName.length + 1).trim();

  const index = process.argv.indexOf(flagName);
  if (index !== -1 && process.argv[index + 1]) {
    return String(process.argv[index + 1]).trim();
  }

  return '';
}

async function main() {
  const email = getArgValue('--email').toLowerCase();
  const password = getArgValue('--password');

  if (!email || !password) {
    console.error('Uso: npm run user:reset-password -- --email usuario@correo.com --password nuevaClave123');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('La contraseña debe tener al menos 6 caracteres.');
    process.exit(1);
  }

  try {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      console.error(`No existe un usuario con email: ${email}`);
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updated = await userRepository.updatePassword(user.id, hashedPassword);

    if (!updated) {
      console.error('No se pudo actualizar la contraseña.');
      process.exit(1);
    }

    console.log(`Contraseña actualizada correctamente para: ${email}`);
  } catch (error) {
    console.error('Error al actualizar contraseña:', error.message);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

main();
