const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middleware/multerConfig');
const auth = require('../middleware/authMiddleware');

// Get current user profile
router.get('/me', auth, userController.getCurrentUser);
// Get user profile
router.get('/:id', auth, userController.getProfile);
// Update user profile
router.put('/:id', auth, userController.updateProfile);
// Upload profile image
router.post('/profile-image', auth, upload.single('profileImage'), userController.uploadProfileImage);
// Update avatar
router.post('/avatar', auth, userController.updateAvatar);
router.get('/:userId/direct-messages', auth, userController.getDirectMessages);
router.post('/:userId/direct-messages', auth, userController.postDirectMessage);

module.exports = router;
