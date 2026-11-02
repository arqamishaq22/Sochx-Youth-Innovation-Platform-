const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Generate standard JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET || 'sochx_super_secret_jwt_key_2026',
    { expiresIn: '7d' }
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { fullName, name, username, email, password } = req.body;
    const finalFullName = fullName || name;

    // 1. Validate required fields
    if (!finalFullName || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fullName, username, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    // 2. Check if email or username is already taken
    const [existing] = await pool.query(
      'SELECT id, email, username FROM users WHERE email = ? OR username = ? LIMIT 1',
      [normalizedEmail, normalizedUsername]
    );

    if (existing.length > 0) {
      const match = existing[0];
      const conflictField = match.email === normalizedEmail ? 'Email' : 'Username';
      return res.status(409).json({
        success: false,
        message: `${conflictField} is already registered. Please use another or log in.`,
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Insert user into users table
    const defaultBio = 'Turning coffee into code and ideas into innovation at SochX.';
    const defaultBadge = 'Full Stack Developer';

    const [result] = await pool.query(
      `INSERT INTO users (fullName, username, email, password, roleBadge, bio, rankVal, role)
       VALUES (?, ?, ?, ?, ?, ?, 4, 'user')`,
      [finalFullName.trim(), normalizedUsername, normalizedEmail, hashedPassword, defaultBadge, defaultBio]
    );

    const newUserId = result.insertId;

    const userPayload = {
      id: newUserId,
      fullName: finalFullName.trim(),
      name: finalFullName.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      roleBadge: defaultBadge,
      bio: defaultBio,
      rankVal: 4,
      role: 'user',
    };

    // 5. Generate Token
    const token = generateToken(userPayload);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userPayload,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Query user by email
    const [rows] = await pool.query(
      `SELECT id, fullName, username, email, password, roleBadge, bio, rankVal, role, createdAt
       FROM users
       WHERE email = ? LIMIT 1`,
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = rows[0];

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 4. Prepare sanitized user object
    const userPayload = {
      id: user.id,
      fullName: user.fullName,
      name: user.fullName,
      username: user.username,
      email: user.email,
      roleBadge: user.roleBadge,
      bio: user.bio,
      rankVal: user.rankVal,
      role: user.role,
      createdAt: user.createdAt,
    };

    // 5. Generate Token
    const token = generateToken(userPayload);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userPayload,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

/**
 * @desc    Logout user (Session invalidation endpoint)
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
