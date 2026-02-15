const courseRepository = require('../repositories/course.repository');
const ratingRepository = require('../repositories/rating.repository');
const { AppError } = require('../utils/errors');

async function getAll(search = '') {
  return courseRepository.findAll(search);
}

async function getById(id, userId = null) {
  const course = await courseRepository.findById(id);
  if (!course) {
    throw new AppError('Curso no encontrado.', 404);
  }
  if (userId) {
    const enrolled = await courseRepository.isEnrolled(id, userId);
    course.isEnrolled = enrolled;
    if (enrolled) {
      const userRating = await ratingRepository.findByUserAndCourse(id, userId);
      course.userRating = userRating?.rating ?? null;
    }
  }
  return course;
}

async function create(data, userId) {
  const { title, description, content, instructorTagline, instructorBio } = data;
  const id = await courseRepository.create({
    title,
    description,
    content,
    instructorTagline,
    instructorBio,
    createdBy: userId,
  });
  return courseRepository.findById(id);
}

async function update(id, data) {
  const updated = await courseRepository.update(id, data);
  if (!updated) {
    throw new AppError('Curso no encontrado.', 404);
  }
  return courseRepository.findById(id);
}

async function remove(id) {
  const deleted = await courseRepository.remove(id);
  if (!deleted) {
    throw new AppError('Curso no encontrado.', 404);
  }
  return { message: 'Curso eliminado.' };
}

async function getEnrolled(userId) {
  return courseRepository.findEnrolledByUser(userId);
}

async function enroll(courseId, userId) {
  const exists = await courseRepository.exists(courseId);
  if (!exists) {
    throw new AppError('Curso no encontrado.', 404);
  }
  const alreadyEnrolled = await courseRepository.isEnrolled(courseId, userId);
  if (alreadyEnrolled) {
    throw new AppError('Ya inscrito.', 400);
  }
  await courseRepository.enroll(courseId, userId);
  return { message: 'Inscripción exitosa.' };
}

module.exports = {
  getAll,
  getById,
  getEnrolled,
  create,
  update,
  remove,
  enroll,
};
