const express = require('express');
const videosController = require('../controllers/videos.controller');
const auth = require('../middleware/auth');
const requireCourseOwnerOrAdmin = require('../middleware/requireCourseOwnerOrAdmin');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/:courseId', auth, videosController.getByCourseId);
router.get('/:courseId/:videoId', auth, videosController.getById);
router.post(
  '/:courseId/upload',
  auth,
  requireCourseOwnerOrAdmin,
  upload.fields([{ name: 'video', maxCount: 1 }, { name: 'subtitle', maxCount: 1 }]),
  videosController.create
);
router.put('/:courseId/:videoId', auth, requireCourseOwnerOrAdmin, videosController.update);
router.delete('/:courseId/:videoId', auth, requireCourseOwnerOrAdmin, videosController.remove);

module.exports = router;
