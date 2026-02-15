const courseRepository = require('../repositories/course.repository');
const ratingRepository = require('../repositories/rating.repository');
const { AppError } = require('../utils/errors');

async function rate(courseId, userId, rating) {
  const exists = await courseRepository.exists(courseId);
  if (!exists) throw new AppError('Curso no encontrado.', 404);

  const isEnrolled = await courseRepository.isEnrolled(courseId, userId);
  if (!isEnrolled) throw new AppError('Debes estar inscrito para calificar el curso.', 403);

  const ratingNum = Number(rating);
  if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    throw new AppError('La calificación debe ser entre 1 y 5.', 400);
  }

  await ratingRepository.upsert(courseId, userId, ratingNum);
  const stats = await ratingRepository.getAverageAndCount(courseId);
  const userRating = await ratingRepository.findByUserAndCourse(courseId, userId);

  return {
    message: 'Calificación enviada.',
    userRating: userRating?.rating ?? ratingNum,
    averageRating: stats.averageRating,
    ratingsCount: stats.ratingsCount,
  };
}

async function getUserRating(courseId, userId) {
  return ratingRepository.findByUserAndCourse(courseId, userId);
}

async function getStats(courseId) {
  return ratingRepository.getAverageAndCount(courseId);
}

module.exports = { rate, getUserRating, getStats };
