const courseRepository = require('../repositories/course.repository');
const videoRepository = require('../repositories/video.repository');
const { AppError } = require('../utils/errors');
const { uploadVideo, uploadSubtitle } = require('../utils/cloudinary');

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

  const videoResult = await uploadVideo(videoFile, courseId);
  const videoUrl = videoResult.secure_url;

  let subtitleUrl = null;
  if (subtitleFile) {
    const subResult = await uploadSubtitle(subtitleFile, courseId);
    subtitleUrl = subResult.secure_url;
  }

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
