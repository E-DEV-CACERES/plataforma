const progressService = require('../services/progress.service');
const diplomaService = require('../services/diploma.service');

async function markVideoWatched(req, res, next) {
  try {
    const result = await progressService.markVideoWatched(
      req.params.courseId,
      req.params.videoId,
      req.user.id
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getProgress(req, res, next) {
  try {
    const progress = await progressService.getProgress(
      req.params.courseId,
      req.user.id
    );
    res.json(progress);
  } catch (err) {
    next(err);
  }
}

async function getAllProgressByCourse(req, res, next) {
  try {
    const list = await progressService.getAllProgressByCourse(req.params.courseId);
    res.json(list);
  } catch (err) {
    next(err);
  }
}

async function downloadDiploma(req, res, next) {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const courseRepository = require('../repositories/course.repository');
    const course = await courseRepository.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }

    const safeTitle = (course.title || 'curso').replace(/[^a-zA-Z0-9\u00C0-\u024F\s-]/g, '').trim().slice(0, 60) || 'diploma';
    const filename = `Diploma-${safeTitle}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await diplomaService.generateDiploma(courseId, userId, res);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  markVideoWatched,
  getProgress,
  getAllProgressByCourse,
  downloadDiploma,
};
