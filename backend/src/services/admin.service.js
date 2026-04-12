const bcrypt = require('bcryptjs');
const adminRepository = require('../repositories/admin.repository');
const userRepository = require('../repositories/user.repository');
const { AppError } = require('../utils/errors');

async function getUsersWithEnrollments() {
  return adminRepository.getUsersWithEnrollments();
}

async function updateUserPassword(userId, newPassword, adminId) {
  if (String(userId) === String(adminId)) {
    throw new AppError('No puedes cambiar tu propia contraseña desde aquí. Usa el perfil.', 400);
  }
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('Usuario no encontrado.', 404);
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updated = await userRepository.updatePassword(userId, hashedPassword);
  if (!updated) throw new AppError('No se pudo actualizar la contraseña.', 500);
  return { message: 'Contraseña actualizada correctamente.' };
}

async function updateUserRole(userId, role, adminId) {
  if (String(userId) === String(adminId)) {
    throw new AppError('No puedes cambiar tu propio rol.', 400);
  }
  if (!['admin', 'user', 'instructor'].includes(role)) {
    throw new AppError('Rol inválido. Usa "admin" o "user".', 400);
  }
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('Usuario no encontrado.', 404);
  }
  const updated = await userRepository.updateRole(userId, role);
  if (!updated) throw new AppError('No se pudo actualizar el rol.', 500);
  return { message: 'Rol actualizado correctamente.', role };
}

async function deleteUser(userId, adminId) {
  if (String(userId) === String(adminId)) {
    throw new AppError('No puedes eliminarte a ti mismo.', 400);
  }
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('Usuario no encontrado.', 404);
  }
  const deleted = await userRepository.deleteById(userId);
  if (!deleted) throw new AppError('No se pudo eliminar el usuario.', 500);
  return { message: 'Usuario eliminado correctamente.' };
}

module.exports = {
  getUsersWithEnrollments,
  updateUserPassword,
  updateUserRole,
  deleteUser,
};
