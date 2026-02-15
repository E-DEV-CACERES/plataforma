const express = require('express');
const coursesController = require('../controllers/courses.controller');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

router.get('/', coursesController.getAll);
router.get('/enrolled', auth, coursesController.getEnrolled);
router.get('/:id', optionalAuth, coursesController.getById);
router.post('/', auth, requireAdmin, coursesController.create);
router.put('/:id', auth, requireAdmin, coursesController.update);
router.delete('/:id', auth, requireAdmin, coursesController.remove);
router.post('/:id/enroll', auth, coursesController.enroll);
router.post('/:id/rate', auth, coursesController.rate);

module.exports = router;
