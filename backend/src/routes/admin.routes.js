const express = require('express');
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

router.get('/users', auth, requireAdmin, adminController.getUsersWithEnrollments);
router.put('/users/:userId/password', auth, requireAdmin, adminController.updateUserPassword);
router.put('/users/:userId/role', auth, requireAdmin, adminController.updateUserRole);
router.delete('/users/:userId', auth, requireAdmin, adminController.deleteUser);

module.exports = router;
