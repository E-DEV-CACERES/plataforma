/**
 * Permite acceso a admin o instructor.
 */
function requireInstructorOrAdmin(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Solo instructores o administradores pueden realizar esta acción.' });
  }
  next();
}

module.exports = requireInstructorOrAdmin;
