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
  
  exports.uploadProfileImage = uploadProfileImage;
  exports.updateAvatar = updateAvatar;