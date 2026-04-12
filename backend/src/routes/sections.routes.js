const express = require('express');
const sectionController = require('../controllers/section.controller');
const auth = require('../middleware/auth');
const requireCourseOwnerOrAdmin = require('../middleware/requireCourseOwnerOrAdmin');

const router = express.Router();

router.get('/:courseId', auth, sectionController.getByCourseId);
router.post('/:courseId', auth, requireCourseOwnerOrAdmin, sectionController.create);
router.put('/:courseId/:sectionId', auth, requireCourseOwnerOrAdmin, sectionController.update);
router.delete('/:courseId/:sectionId', auth, requireCourseOwnerOrAdmin, sectionController.remove);

module.exports = router;
