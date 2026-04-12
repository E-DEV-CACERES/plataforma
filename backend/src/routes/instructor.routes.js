const express = require('express');
const instructorController = require('../controllers/instructor.controller');
const auth = require('../middleware/auth');
const requireInstructorOrAdmin = require('../middleware/requireInstructorOrAdmin');
const { uploadProfile, uploadCover } = require('../middleware/uploadInstructorImages');

const router = express.Router();

// /me debe ir antes de /:id
router.get('/me', auth, instructorController.getMyProfile);
router.put('/me', auth, instructorController.updateMyProfile);
router.post('/me/profile-image', auth, requireInstructorOrAdmin, uploadProfile.single('image'), instructorController.uploadProfileImage);
router.post('/me/cover-image', auth, requireInstructorOrAdmin, uploadCover.single('image'), instructorController.uploadCoverImage);
router.get('/:id', auth, instructorController.getProfile);

module.exports = router;
