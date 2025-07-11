const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

// Get user profile
router.get('/:id', auth, getProfile);
// Update user profile
router.put('/:id', auth, updateProfile);

module.exports = router;
