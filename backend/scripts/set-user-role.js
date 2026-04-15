/**
 * Cambia el rol de un usuario por email.
 * Uso: npm run user:set-role -- --email correo@dominio.com --role admin
 * Roles válidos: admin, user (y instructor si tu ENUM lo incluye en MySQL)
 */
require('dotenv').config();
const userRepository = require('../src/repositories/user.repository');
const db = require('../src/db');

const ALLOWED_ROLES = ['admin', 'user', 'instructor'];

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
  let email = getArgValue('--email').toLowerCase();
  let role = getArgValue('--role').toLowerCase();
  // Fallback (útil en Windows si npm no pasa bien los flags)
  if (!email && process.argv[2] && process.argv[2].includes('@')) {
    email = String(process.argv[2]).toLowerCase().trim();
  }
  if (!role && process.argv[3]) {
    role = String(process.argv[3]).toLowerCase().trim();
  }

  if (!email || !role) {
    console.error('Uso: npm run user:set-role -- --email usuario@correo.com --role admin');
    console.error('  o: node scripts/set-user-role.js usuario@correo.com admin');
    process.exit(1);
  }

  if (!ALLOWED_ROLES.includes(role)) {
    console.error(`Rol inválido. Use uno de: ${ALLOWED_ROLES.join(', ')}`);
    process.exit(1);
  }

  try {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      console.error(`No existe usuario con email: ${email}`);
      process.exit(1);
    }

    const updated = await userRepository.updateRole(user.id, role);
    if (!updated) {
      console.error('No se pudo actualizar el rol (¿ENUM en MySQL sin ese valor?).');
      process.exit(1);
    }

    console.log(`OK: ${email} ahora tiene rol "${role}" (id=${user.id}).`);
    console.log('Cierra sesión en la app y vuelve a iniciar para que el token cargue el nuevo rol.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

main();
