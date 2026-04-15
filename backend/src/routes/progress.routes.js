const express = require('express');
const progressController = require('../controllers/progress.controller');
const auth = require('../middleware/auth');
const requireCourseOwnerOrAdmin = require('../middleware/requireCourseOwnerOrAdmin');
const { requirePositiveIntParam } = require('../middleware/validateRequest');

const router = express.Router();

router.post(
  '/:courseId/:videoId/mark-watched',
  auth,
  requirePositiveIntParam('courseId'),
  requirePositiveIntParam('videoId'),
  progressController.markVideoWatched
);
router.get('/:courseId/progress', auth, requirePositiveIntParam('courseId'), progressController.getProgress);
router.get('/:courseId/diploma', auth, requirePositiveIntParam('courseId'), progressController.downloadDiploma);
router.get(
  '/:courseId/all-progress',
  auth,
  requirePositiveIntParam('courseId'),
  requireCourseOwnerOrAdmin,
  progressController.getAllProgressByCourse
);

module.exports = router;
