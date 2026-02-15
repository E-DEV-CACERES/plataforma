const express = require('express');
const sectionController = require('../controllers/section.controller');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

router.get('/:courseId', sectionController.getByCourseId);
router.post('/:courseId', auth, requireAdmin, sectionController.create);
router.put('/:courseId/:sectionId', auth, requireAdmin, sectionController.update);
router.delete('/:courseId/:sectionId', auth, requireAdmin, sectionController.remove);

module.exports = router;
