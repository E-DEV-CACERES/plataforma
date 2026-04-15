const express = require('express');
const sectionController = require('../controllers/section.controller');
const auth = require('../middleware/auth');
const requireCourseOwnerOrAdmin = require('../middleware/requireCourseOwnerOrAdmin');
const { requirePositiveIntParam } = require('../middleware/validateRequest');

const router = express.Router();

router.get('/:courseId', auth, requirePositiveIntParam('courseId'), sectionController.getByCourseId);
router.post('/:courseId', auth, requirePositiveIntParam('courseId'), requireCourseOwnerOrAdmin, sectionController.create);
router.put('/:courseId/:sectionId', auth, requirePositiveIntParam('courseId'), requirePositiveIntParam('sectionId'), requireCourseOwnerOrAdmin, sectionController.update);
router.delete('/:courseId/:sectionId', auth, requirePositiveIntParam('courseId'), requirePositiveIntParam('sectionId'), requireCourseOwnerOrAdmin, sectionController.remove);

module.exports = router;
