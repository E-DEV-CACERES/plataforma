const express = require('express');
const courseFileController = require('../controllers/courseFile.controller');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const uploadFiles = require('../middleware/uploadFiles');

const router = express.Router();

router.get('/:courseId', courseFileController.getByCourseId);
router.post(
  '/:courseId/upload',
  auth,
  requireAdmin,
  uploadFiles.single('file'),
  courseFileController.create
);
router.delete('/:courseId/:fileId', auth, requireAdmin, courseFileController.remove);

module.exports = router;
