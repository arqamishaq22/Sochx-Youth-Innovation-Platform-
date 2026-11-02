const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  deleteUser,
  getIdeas,
  updateIdeaStatus,
  deleteIdea,
} = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/adminMiddleware');

// All admin routes require valid JWT token AND role === 'admin'
router.use(authenticateToken);
router.use(requireAdmin);

// Platform stats
router.get('/stats', getStats);

// User management
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

// Idea moderation
router.get('/ideas', getIdeas);
router.put('/ideas/:id/status', updateIdeaStatus);
router.delete('/ideas/:id', deleteIdea);

module.exports = router;
