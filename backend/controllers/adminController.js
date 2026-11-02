const { pool } = require('../config/db');

/**
 * @desc    Get system-wide platform statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getStats = async (req, res, next) => {
  try {
    // 1. Total Users
    const [userCountRows] = await pool.query('SELECT COUNT(*) AS total FROM users');
    const totalUsers = userCountRows[0].total || 0;

    // 2. Total Ideas
    const [ideaCountRows] = await pool.query('SELECT COUNT(*) AS total FROM ideas');
    const totalIdeas = ideaCountRows[0].total || 0;

    // 3. Pending Ideas
    const [pendingRows] = await pool.query("SELECT COUNT(*) AS total FROM ideas WHERE UPPER(status) = 'PENDING'");
    const pendingIdeas = pendingRows[0].total || 0;

    // 4. Total Upvotes
    const [upvoteCountRows] = await pool.query('SELECT COUNT(*) AS total FROM idea_upvotes');
    const totalUpvotes = upvoteCountRows[0].total || 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: Number(totalUsers),
        totalIdeas: Number(totalIdeas),
        pendingIdeas: Number(pendingIdeas),
        totalUpvotes: Number(totalUpvotes),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get list of all registered platform users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getUsers = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      `SELECT id, fullName, username, email, role, roleBadge, bio, rankVal, createdAt
       FROM users
       ORDER BY createdAt DESC`
    );

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user account
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (Number(id) === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Security exception: You cannot delete your own administrator account.',
      });
    }

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User account not found or already deleted',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User account removed from database successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all ideas with author details regardless of status
 * @route   GET /api/admin/ideas
 * @access  Private/Admin
 */
const getIdeas = async (req, res, next) => {
  try {
    const [ideas] = await pool.query(
      `SELECT 
         i.*,
         COALESCE(u.fullName, i.submitterName, 'Student Innovator') AS authorName,
         u.username AS authorUsername,
         COALESCE(u.email, i.submitterEmail) AS authorEmail
       FROM ideas i
       LEFT JOIN users u ON i.authorId = u.id
       ORDER BY i.createdAt DESC`
    );

    return res.status(200).json({
      success: true,
      ideas,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update idea moderation status ('PENDING', 'APPROVED', 'INACTIVE')
 * @route   PUT /api/admin/ideas/:id/status
 * @access  Private/Admin
 */
const updateIdeaStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || typeof status !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status string',
      });
    }

    const normalizedStatus = status.trim().toUpperCase();
    const validStatuses = ['PENDING', 'APPROVED', 'INACTIVE'];

    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const [result] = await pool.query('UPDATE ideas SET status = ? WHERE id = ?', [normalizedStatus, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found with requested ID',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Idea status updated to ${normalizedStatus}`,
      status: normalizedStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an inappropriate idea
 * @route   DELETE /api/admin/ideas/:id
 * @access  Private/Admin
 */
const deleteIdea = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM ideas WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found or already deleted',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Idea deleted successfully from the platform',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getUsers,
  deleteUser,
  getIdeas,
  updateIdeaStatus,
  deleteIdea,
};
