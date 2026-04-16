const express = require('express');
const videosController = require('../controllers/videos.controller');
const auth = require('../middleware/auth');
const requireCourseOwnerOrAdmin = require('../middleware/requireCourseOwnerOrAdmin');
const upload = require('../middleware/upload');
const { requirePositiveIntParam } = require('../middleware/validateRequest');

const router = express.Router();

router.get('/:courseId', auth, requirePositiveIntParam('courseId'), videosController.getByCourseId);
router.get('/:courseId/:videoId', auth, requirePositiveIntParam('courseId'), requirePositiveIntParam('videoId'), videosController.getById);
router.post(
  '/:courseId/upload',
  auth,
  requirePositiveIntParam('courseId'),
  requireCourseOwnerOrAdmin,
  upload.fields([{ name: 'video', maxCount: 1 }, { name: 'subtitle', maxCount: 1 }]),
  videosController.create
);
router.post(
  '/:courseId/create',
  auth,
  requirePositiveIntParam('courseId'),
  requireCourseOwnerOrAdmin,
  videosController.create
);
router.put('/:courseId/:videoId', auth, requirePositiveIntParam('courseId'), requirePositiveIntParam('videoId'), requireCourseOwnerOrAdmin, videosController.update);
router.delete('/:courseId/:videoId', auth, requirePositiveIntParam('courseId'), requirePositiveIntParam('videoId'), requireCourseOwnerOrAdmin, videosController.remove);

module.exports = router;
