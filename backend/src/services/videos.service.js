const path = require('path');
const courseRepository = require('../repositories/course.repository');
const videoRepository = require('../repositories/video.repository');
const { AppError } = require('../utils/errors');
const { convertToH264 } = require('../utils/convertVideo');

async function getByCourseId(courseId) {
  return videoRepository.findByCourseId(courseId);
}

async function getById(videoId) {
  const video = await videoRepository.findById(videoId);
  if (!video) {
    throw new AppError('Video no encontrado.', 404);
  }
  return video;
}

async function create(courseId, data, videoFile, subtitleFile) {
  const exists = await courseRepository.exists(courseId);
  if (!exists) {
    throw new AppError('Curso no encontrado.', 404);
  }
  if (!videoFile) {
    throw new AppError('No se proporcionó archivo de video.', 400);
  }
  const videoPath = path.join(process.cwd(), 'uploads', 'videos', videoFile.filename);
  try {
    await convertToH264(videoPath);
  } catch (err) {
    console.warn('Conversión de video omitida:', err.message);
  }
  const videoUrl = `/uploads/videos/${videoFile.filename}`;
  const subtitleUrl = subtitleFile ? `/uploads/subtitles/${subtitleFile.filename}` : null;
  const { title, description, duration, order, sectionId } = data;
  const id = await videoRepository.create({
    title,
    description,
    duration: duration ? Number(duration) : 0,
    videoUrl,
    subtitleUrl,
    courseId,
    sectionId: sectionId || null,
    order: order ? Number(order) : 0,
  });
  return videoRepository.findById(id);
}

async function update(videoId, data) {
  const updated = await videoRepository.update(videoId, data);
  if (!updated) {
    throw new AppError('Video no encontrado.', 404);
  }
  return videoRepository.findById(videoId);
}

async function remove(videoId) {
  const deleted = await videoRepository.remove(videoId);
  if (!deleted) {
    throw new AppError('Video no encontrado.', 404);
  }
  return { message: 'Video eliminado.' };
}

module.exports = {
  getByCourseId,
  getById,
  create,
  update,
  remove,
};
