const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Strict Authentication Middleware
 * Requires a valid Bearer JWT in the Authorization header.
 * Attaches sanitized user record to req.user.
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Missing or malformed authorization token',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sochx_super_secret_jwt_key_2026');

    // Query user from MySQL excluding password
    const [rows] = await pool.query(
      `SELECT id, fullName, username, email, roleBadge, bio, rankVal, role, createdAt
       FROM users
       WHERE id = ? LIMIT 1`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User account no longer exists',
      });
    }

    const user = rows[0];
    // Attach both user and alias 'name' for frontend compatibility
    req.user = {
      ...user,
      name: user.fullName,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Session expired, please log in again',
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Forbidden: Invalid authorization token',
    });
  }
};

/**
 * Optional Authentication Middleware
 * If a token is provided and valid, attaches user to req.user.
 * If no token or invalid, allows request to proceed with req.user = null.
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sochx_super_secret_jwt_key_2026');
    const [rows] = await pool.query(
      `SELECT id, fullName, username, email, roleBadge, bio, rankVal, role, createdAt
       FROM users
       WHERE id = ? LIMIT 1`,
      [decoded.id]
    );

    if (rows.length > 0) {
      req.user = {
        ...rows[0],
        name: rows[0].fullName,
      };
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
};
