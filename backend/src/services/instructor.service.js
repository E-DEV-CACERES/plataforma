const instructorRepository = require('../repositories/instructor.repository');
const { AppError } = require('../utils/errors');

async function getProfile(instructorId) {
  const profile = await instructorRepository.getProfileById(instructorId);
  if (!profile) {
    throw new AppError('Instructor no encontrado.', 404);
  }
  if (profile.coursesCount === 0) {
    throw new AppError('Este usuario no tiene cursos publicados.', 404);
  }
  return profile;
}

async function getMyProfile(userId) {
  const profile = await instructorRepository.getProfileById(userId);
  if (!profile) {
    throw new AppError('Usuario no encontrado.', 404);
  }
  return profile;
}

async function updateMyProfile(userId, data) {
  const updated = await instructorRepository.updateProfile(userId, data);
  if (!updated) {
    throw new AppError('No se pudo actualizar el perfil.', 400);
  }
  return instructorRepository.getProfileById(userId);
}

async function uploadProfileImage(userId, filePath) {
  const updated = await instructorRepository.updateProfileImage(userId, filePath);
  if (!updated) {
    throw new AppError('No se pudo actualizar la imagen de perfil.', 400);
  }
  return instructorRepository.getProfileById(userId);
}

async function uploadCoverImage(userId, filePath) {
  const updated = await instructorRepository.updateCoverImage(userId, filePath);
  if (!updated) {
    throw new AppError('No se pudo actualizar la imagen de portada.', 400);
  }
  return instructorRepository.getProfileById(userId);
}

module.exports = {
  getProfile,
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
  uploadCoverImage,
};
