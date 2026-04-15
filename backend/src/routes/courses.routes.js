const express = require('express');
const coursesController = require('../controllers/courses.controller');
const stripeController = require('../controllers/stripe.controller');
const auth = require('../middleware/auth');
const requireInstructorOrAdmin = require('../middleware/requireInstructorOrAdmin');
const requireCourseOwnerOrAdmin = require('../middleware/requireCourseOwnerOrAdmin');
const { requirePositiveIntParam, sanitizeSearchQuery } = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', auth, sanitizeSearchQuery, coursesController.getAll);
router.get('/enrolled', auth, coursesController.getEnrolled);
router.get('/:id', auth, requirePositiveIntParam('id'), coursesController.getById);
router.post('/', auth, requireInstructorOrAdmin, coursesController.create);
router.put('/:id', auth, requirePositiveIntParam('id'), requireCourseOwnerOrAdmin, coursesController.update);
router.delete('/:id', auth, requirePositiveIntParam('id'), requireCourseOwnerOrAdmin, coursesController.remove);
router.post('/:id/enroll', auth, requirePositiveIntParam('id'), coursesController.enroll);
router.post('/:id/checkout', auth, requirePositiveIntParam('id'), stripeController.createCheckoutSession);
router.post('/:id/rate', auth, requirePositiveIntParam('id'), coursesController.rate);

module.exports = router;
