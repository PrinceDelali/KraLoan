const express = require('express');
const router = express.Router();
const { getCurrentUser, getProfile, updateProfile, uploadProfileImage, updateAvatar } = require('../controllers/userController');
const upload = require('../middleware/multerConfig');
const auth = require('../middleware/authMiddleware');

// Get current user profile
router.get('/me', auth, getCurrentUser);
// Get user profile
router.get('/:id', auth, getProfile);
// Update user profile
router.put('/:id', auth, updateProfile);
// Upload profile image
router.post('/profile-image', auth, upload.single('profileImage'), uploadProfileImage);
// Update avatar
router.post('/avatar', auth, updateAvatar);

module.exports = router;
