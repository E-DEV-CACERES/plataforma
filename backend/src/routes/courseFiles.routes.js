const express = require('express');
const courseFileController = require('../controllers/courseFile.controller');
const auth = require('../middleware/auth');
const requireCourseOwnerOrAdmin = require('../middleware/requireCourseOwnerOrAdmin');
const uploadFiles = require('../middleware/uploadFiles');

const router = express.Router();

router.get('/:courseId', auth, courseFileController.getByCourseId);
router.post(
  '/:courseId/upload',
  auth,
  requireCourseOwnerOrAdmin,
  uploadFiles.single('file'),
  courseFileController.create
);
router.delete('/:courseId/:fileId', auth, requireCourseOwnerOrAdmin, courseFileController.remove);

module.exports = router;
