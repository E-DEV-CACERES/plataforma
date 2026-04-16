const courseRepository = require('../repositories/course.repository');
const courseFileRepository = require('../repositories/courseFile.repository');
const { AppError } = require('../utils/errors');
const { uploadFile } = require('../utils/cloudinary');

async function getByCourseId(courseId) {
  return courseFileRepository.findByCourseId(courseId);
}

async function create(courseId, data, file) {
  const exists = await courseRepository.exists(courseId);
  if (!exists) throw new AppError('Curso no encontrado.', 404);

  let fileUrl = data.fileUrl;
  if (!fileUrl) {
    if (!file) throw new AppError('No se proporcionó archivo.', 400);
    const result = await uploadFile(file, courseId);
    fileUrl = result.secure_url;
  }

  const { title, sectionId, order } = data;
  const id = await courseFileRepository.create({
    courseId,
    sectionId: sectionId || null,
    title: title || (file ? file.originalname : 'archivo'),
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
