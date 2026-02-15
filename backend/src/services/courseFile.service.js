const courseRepository = require('../repositories/course.repository');
const courseFileRepository = require('../repositories/courseFile.repository');
const { AppError } = require('../utils/errors');

async function getByCourseId(courseId) {
  return courseFileRepository.findByCourseId(courseId);
}

async function create(courseId, data, file) {
  const exists = await courseRepository.exists(courseId);
  if (!exists) throw new AppError('Curso no encontrado.', 404);
  if (!file) throw new AppError('No se proporcionó archivo.', 400);
  const fileUrl = `/uploads/files/${file.filename}`;
  const { title, sectionId, order } = data;
  const id = await courseFileRepository.create({
    courseId,
    sectionId: sectionId || null,
    title: title || file.originalname,
    fileUrl,
    order: order ?? 0,
  });
  return courseFileRepository.findById(id);
}

async function remove(id) {
  const deleted = await courseFileRepository.remove(id);
  if (!deleted) throw new AppError('Archivo no encontrado.', 404);
  return { message: 'Archivo eliminado.' };
}

module.exports = { getByCourseId, create, remove };
