const User = require('../models/User');

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId || req.params.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }
    // Remove fields that should not be updated directly
    const { password, _id, ...updateFields } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, select: '-password' }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Upload profile image
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const userId = req.user.userId;
    const imagePath = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(userId, { profileImage: imagePath, avatar: '' }, { new: true, select: '-password' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile image updated', profileImage: imagePath, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update avatar
const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ message: 'No avatar provided' });
    const userId = req.user.userId;
    const user = await User.findByIdAndUpdate(userId, { avatar, profileImage: '' }, { new: true, select: '-password' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Avatar updated', avatar, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getCurrentUser,
  getProfile,
  updateProfile,
  uploadProfileImage,
  updateAvatar
};

