const express = require('express');
const progressController = require('../controllers/progress.controller');
const auth = require('../middleware/auth');
const requireCourseOwnerOrAdmin = require('../middleware/requireCourseOwnerOrAdmin');

const router = express.Router();

router.post(
  '/:courseId/:videoId/mark-watched',
  auth,
  progressController.markVideoWatched
);
router.get('/:courseId/progress', auth, progressController.getProgress);
router.get('/:courseId/diploma', auth, progressController.downloadDiploma);
router.get(
  '/:courseId/all-progress',
  auth,
  requireCourseOwnerOrAdmin,
  progressController.getAllProgressByCourse
);

module.exports = router;
