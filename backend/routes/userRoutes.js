const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All user profile routes require authentication
router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
