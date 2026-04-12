const express = require('express');
const coursesController = require('../controllers/courses.controller');
const stripeController = require('../controllers/stripe.controller');
const auth = require('../middleware/auth');
const requireInstructorOrAdmin = require('../middleware/requireInstructorOrAdmin');
const requireCourseOwnerOrAdmin = require('../middleware/requireCourseOwnerOrAdmin');

const router = express.Router();

router.get('/', auth, coursesController.getAll);
router.get('/enrolled', auth, coursesController.getEnrolled);
router.get('/:id', auth, coursesController.getById);
router.post('/', auth, requireInstructorOrAdmin, coursesController.create);
router.put('/:id', auth, requireCourseOwnerOrAdmin, coursesController.update);
router.delete('/:id', auth, requireCourseOwnerOrAdmin, coursesController.remove);
router.post('/:id/enroll', auth, coursesController.enroll);
router.post('/:id/checkout', auth, stripeController.createCheckoutSession);
router.post('/:id/rate', auth, coursesController.rate);

module.exports = router;
