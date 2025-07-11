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
