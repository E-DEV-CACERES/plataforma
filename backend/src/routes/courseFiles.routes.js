const express = require('express');
const courseFileController = require('../controllers/courseFile.controller');
const auth = require('../middleware/auth');
const requireCourseOwnerOrAdmin = require('../middleware/requireCourseOwnerOrAdmin');
const uploadFiles = require('../middleware/uploadFiles');
const { requirePositiveIntParam } = require('../middleware/validateRequest');

const router = express.Router();

router.get('/:courseId', auth, requirePositiveIntParam('courseId'), courseFileController.getByCourseId);
router.post(
  '/:courseId/upload',
  auth,
  requirePositiveIntParam('courseId'),
  requireCourseOwnerOrAdmin,
  uploadFiles.single('file'),
  courseFileController.create
);
router.post(
  '/:courseId/create',
  auth,
  requirePositiveIntParam('courseId'),
  requireCourseOwnerOrAdmin,
  courseFileController.create
);
router.delete('/:courseId/:fileId', auth, requirePositiveIntParam('courseId'), requirePositiveIntParam('fileId'), requireCourseOwnerOrAdmin, courseFileController.remove);

module.exports = router;
