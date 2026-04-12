/**
 * Permite acceso a admin o al dueño del curso (instructor).
 * Requiere que el curso exista y que req.courseId esté definido, o se obtiene de req.params.
 */
const courseRepository = require('../repositories/course.repository');

async function requireCourseOwnerOrAdmin(req, res, next) {
  try {
    if (req.user.role === 'admin') {
      return next();
    }
    const courseId = req.params.courseId || req.params.id;
    if (!courseId) {
      return res.status(400).json({ message: 'ID de curso no especificado.' });
    }
    const course = await courseRepository.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }
    if (course.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para modificar este curso.' });
    }
    req.course = course;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = requireCourseOwnerOrAdmin;
