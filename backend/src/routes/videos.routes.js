const express = require('express');
const videosController = require('../controllers/videos.controller');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/:courseId', videosController.getByCourseId);
router.get('/:courseId/:videoId', videosController.getById);
router.post(
  '/:courseId/upload',
  auth,
  requireAdmin,
  upload.fields([{ name: 'video', maxCount: 1 }, { name: 'subtitle', maxCount: 1 }]),
  videosController.create
);
router.put('/:courseId/:videoId', auth, requireAdmin, videosController.update);
router.delete('/:courseId/:videoId', auth, requireAdmin, videosController.remove);

module.exports = router;
