const courseRepository = require('../repositories/course.repository');
const sectionRepository = require('../repositories/section.repository');
const { AppError } = require('../utils/errors');

async function getByCourseId(courseId) {
  return sectionRepository.findByCourseId(courseId);
}

async function create(courseId, data) {
  const exists = await courseRepository.exists(courseId);
  if (!exists) throw new AppError('Curso no encontrado.', 404);
  const id = await sectionRepository.create({ ...data, courseId });
  return sectionRepository.findById(id);
}

async function update(id, data) {
  const updated = await sectionRepository.update(id, data);
  if (!updated) throw new AppError('Sección no encontrada.', 404);
  return sectionRepository.findById(id);
}

async function remove(id) {
  const deleted = await sectionRepository.remove(id);
  if (!deleted) throw new AppError('Sección no encontrada.', 404);
  return { message: 'Sección eliminada.' };
}

module.exports = { getByCourseId, create, update, remove };
