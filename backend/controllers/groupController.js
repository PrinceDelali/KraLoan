const Group = require('../models/Group');
const User = require('../models/User');

const crypto = require('crypto');

exports.createGroup = async (req, res) => {
  try {
    const { name, description, targetAmount, monthlyContribution, startDate, endDate } = req.body;
    // Generate a unique inviteToken
    const inviteToken = crypto.randomBytes(16).toString('hex');
    const group = new Group({
      name, description, targetAmount, monthlyContribution, startDate, endDate,
      admins: [req.user.userId],
      members: [req.user.userId],
      inviteToken
    });
    await group.save();
    // Add group to user's groups
    await User.findByIdAndUpdate(req.user.userId, { $push: { groups: group._id } });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Join group by invite token
exports.joinGroupByInviteToken = async (req, res) => {
  try {
    const { token } = req.params;
    const group = await Group.findOne({ inviteToken: token });
    if (!group) return res.status(404).json({ message: 'Invalid invite link.' });
    if (!group.members.includes(req.user.userId)) {
      group.members.push(req.user.userId);
      await group.save();
      await User.findByIdAndUpdate(req.user.userId, { $push: { groups: group._id } });
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('admins', 'name email').populate('members', 'name email');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.includes(req.user.userId)) {
      group.members.push(req.user.userId);
      await group.save();
      await User.findByIdAndUpdate(req.user.userId, { $push: { groups: group._id } });
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Delete a group (only by admin/creator)
exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    // Only allow if user is an admin
    if (!group.admins.map(a => a.toString()).includes(req.user.userId)) {
      return res.status(403).json({ message: 'Only an admin can delete this group.' });
    }
    // Remove group from all users' group lists
    await User.updateMany({ groups: group._id }, { $pull: { groups: group._id } });
    await group.deleteOne();
    res.json({ message: 'Group deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Remove a member from group (only by admin/creator)
exports.removeMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    // Only allow if user is an admin
    if (!group.admins.map(a => a.toString()).includes(req.user.userId)) {
      return res.status(403).json({ message: 'Only an admin can remove members.' });
    }
    const { userId } = req.body;
    // Remove member from group
    group.members = group.members.filter(m => m.toString() !== userId);
    await group.save();
    // Remove group from user's group list
    await User.findByIdAndUpdate(userId, { $pull: { groups: group._id } });
    res.json({ message: 'Member removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
