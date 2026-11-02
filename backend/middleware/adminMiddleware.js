/**
 * Admin Authorization Middleware
 * Verifies that the authenticated user possesses administrative privileges (role === 'admin').
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin rights required.',
    });
  }
  next();
};

module.exports = requireAdmin;
