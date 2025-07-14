const Group = require('../models/Group');
const User = require('../models/User');

// Get pending join requests for a group (admin only)
exports.getPendingRequests = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('pendingRequests', 'name email');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.admins.map(a => a.toString()).includes(req.user.userId)) {
      return res.status(403).json({ message: 'Only an admin can view pending requests.' });
    }
    res.json({ pendingRequests: group.pendingRequests });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Approve a join request (admin only)
exports.approveJoinRequest = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.admins.map(a => a.toString()).includes(req.user.userId)) {
      return res.status(403).json({ message: 'Only an admin can approve join requests.' });
    }
    const { userId } = req.body;
    if (!group.pendingRequests.map(u => u.toString()).includes(userId)) {
      return res.status(400).json({ message: 'No such pending request.' });
    }
    // Remove from pendingRequests, add to members
    group.pendingRequests = group.pendingRequests.filter(u => u.toString() !== userId);
    group.members.push(userId);
    await group.save();
    await User.findByIdAndUpdate(userId, { $push: { groups: group._id } });
    res.json({ message: 'User approved and added to group.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Decline a join request (admin only)
exports.declineJoinRequest = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.admins.map(a => a.toString()).includes(req.user.userId)) {
      return res.status(403).json({ message: 'Only an admin can decline join requests.' });
    }
    const { userId } = req.body;
    if (!group.pendingRequests.map(u => u.toString()).includes(userId)) {
      return res.status(400).json({ message: 'No such pending request.' });
    }
    // Remove from pendingRequests
    group.pendingRequests = group.pendingRequests.filter(u => u.toString() !== userId);
    await group.save();
    res.json({ message: 'Join request declined.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
