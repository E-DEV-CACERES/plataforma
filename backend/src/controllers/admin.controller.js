const adminService = require('../services/admin.service');

async function getUsersWithEnrollments(req, res, next) {
  try {
    const data = await adminService.getUsersWithEnrollments();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function updateUserPassword(req, res, next) {
  try {
    const { userId } = req.params;
    const { password } = req.body;
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }
    const result = await adminService.updateUserPassword(Number(userId), password, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ message: 'El rol es obligatorio.' });
    }
    const result = await adminService.updateUserRole(Number(userId), role, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { userId } = req.params;
    await adminService.deleteUser(Number(userId), req.user.id);
    res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUsersWithEnrollments,
  updateUserPassword,
  updateUserRole,
  deleteUser,
};
