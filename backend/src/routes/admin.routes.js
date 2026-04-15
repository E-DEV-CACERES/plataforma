const express = require('express');
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const { requirePositiveIntParam } = require('../middleware/validateRequest');

const router = express.Router();

router.get('/users', auth, requireAdmin, adminController.getUsersWithEnrollments);
router.put('/users/:userId/password', auth, requireAdmin, requirePositiveIntParam('userId'), adminController.updateUserPassword);
router.put('/users/:userId/role', auth, requireAdmin, requirePositiveIntParam('userId'), adminController.updateUserRole);
router.delete('/users/:userId', auth, requireAdmin, requirePositiveIntParam('userId'), adminController.deleteUser);

module.exports = router;
