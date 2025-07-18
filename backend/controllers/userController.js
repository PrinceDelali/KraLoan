const User = require('../models/User');
const DirectMessage = require('../models/DirectMessage');

// Always define these at the top level so they can be exported
async function getDirectMessages(req, res) {
  res.status(501).json({ error: 'getDirectMessages not implemented' });
}
async function postDirectMessage(req, res) {
  res.status(501).json({ error: 'postDirectMessage not implemented' });
}

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

// Get direct chat history between two users
exports.getDirectMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;
    const messages = await DirectMessage.find({
      $or: [
        { from: myId, to: userId },
        { from: userId, to: myId }
      ]
    })
      .sort({ timestamp: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch direct messages' });
  }
};

// Post a new direct message
exports.postDirectMessage = async (req, res) => {
  try {
    const { to, text } = req.body;
    const message = new DirectMessage({
      from: req.user._id,
      to,
      text,
    });
    await message.save();
    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post direct message' });
  }
};

module.exports = {
  getCurrentUser,
  getProfile,
  updateProfile,
  uploadProfileImage,
  updateAvatar,
  getDirectMessages,
  postDirectMessage,
};

