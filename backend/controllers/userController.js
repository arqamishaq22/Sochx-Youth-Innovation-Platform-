const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

/**
 * @desc    Get current user profile, submitted ideas & computed stats
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Fetch user record
    const [userRows] = await pool.query(
      `SELECT id, fullName, username, email, roleBadge, bio, rankVal, role, createdAt
       FROM users
       WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    const user = {
      ...userRows[0],
      name: userRows[0].fullName,
    };

    // 2. Fetch all ideas created by this user
    const [ideas] = await pool.query(
      `SELECT 
         id, title, problemDescription, proposedSolution, category,
         submitterName, submitterEmail, authorId, status,
         upvoteCount, commentsCount, createdAt
       FROM ideas
       WHERE authorId = ?
       ORDER BY createdAt DESC`,
      [userId]
    );

    // 3. Compute stats
    const totalIdeas = ideas.length;
    const totalLikes = ideas.reduce((acc, curr) => acc + (Number(curr.upvoteCount) || 0), 0);

    const stats = {
      totalIdeas,
      totalLikes,
      rank: user.rankVal || 4,
    };

    return res.status(200).json({
      success: true,
      user,
      ideas,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile details (fullName, bio, roleBadge)
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fullName, name, bio, roleBadge } = req.body;
    const finalFullName = fullName || name;

    const [existingRows] = await pool.query(
      'SELECT fullName, bio, roleBadge FROM users WHERE id = ?',
      [userId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const current = existingRows[0];
    const updatedFullName = finalFullName !== undefined ? finalFullName.trim() : current.fullName;
    const updatedBio = bio !== undefined ? bio.trim() : current.bio;
    const updatedRoleBadge = roleBadge !== undefined ? roleBadge.trim() : current.roleBadge;

    await pool.query(
      `UPDATE users 
       SET fullName = ?, bio = ?, roleBadge = ?
       WHERE id = ?`,
      [updatedFullName, updatedBio, updatedRoleBadge, userId]
    );

    const [updatedRows] = await pool.query(
      `SELECT id, fullName, username, email, roleBadge, bio, rankVal, role, createdAt
       FROM users
       WHERE id = ?`,
      [userId]
    );

    const updatedUser = {
      ...updatedRows[0],
      name: updatedRows[0].fullName,
    };

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user password securely
 * @route   PUT /api/users/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current password and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    // Query current password hash
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentPasswordHash = rows[0].password;

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, currentPasswordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash and update new password
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [newHash, userId]);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully. Please use your new password next time you log in.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
