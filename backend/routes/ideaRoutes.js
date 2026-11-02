const express = require('express');
const router = express.Router();
const {
  getIdeas,
  getIdeaById,
  createIdea,
  updateIdea,
  deleteIdea,
  toggleUpvote,
  addComment,
} = require('../controllers/ideaController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

// Public / Filterable ideas list
router.get('/', optionalAuth, getIdeas);

// Single idea details with author modal info & comments
router.get('/:id', optionalAuth, getIdeaById);

// Submit new idea (Strictly authenticated)
router.post('/', authenticateToken, createIdea);

// Update idea (Strictly authenticated: Author only)
router.put('/:id', authenticateToken, updateIdea);

// Delete idea (Strictly authenticated: Author or Admin)
router.delete('/:id', authenticateToken, deleteIdea);

// Upvote / Toggle vote (supports both /upvote and /vote)
router.post('/:id/upvote', authenticateToken, toggleUpvote);
router.post('/:id/vote', authenticateToken, toggleUpvote);

// Post discussion comment
router.post('/:id/comments', authenticateToken, addComment);

module.exports = router;
