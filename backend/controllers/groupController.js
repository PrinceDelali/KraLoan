const Group = require('../models/Group');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const crypto = require('crypto');
const axios = require('axios');

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

    // Already a member
    if (group.members.includes(req.user.userId)) {
      return res.status(400).json({ message: 'You are already a member of this group.' });
    }
    // Already requested
    if (group.pendingRequests.includes(req.user.userId)) {
      return res.status(400).json({ message: 'You have already requested to join this group. Please wait for admin approval.' });
    }
    // Add to pending requests
    group.pendingRequests.push(req.user.userId);
    await group.save();

    // (Simulated) Notify admin(s) - in a real app, send notification/email
    res.json({ message: 'Join request sent. Waiting for admin approval.' });
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
// Post a new message to a group (supports file upload)
exports.postGroupMessageWithFile = async (req, res) => {
  try {
    const { text = '' } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    // Only members can post
    if (!group.members.map(m => m.toString()).includes(req.user.userId)) {
      return res.status(403).json({ message: 'Only members can post messages.' });
    }
    let attachment = undefined;
    if (req.file) {
      attachment = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`
      };
    }
    if (!text && !attachment) return res.status(400).json({ message: 'Message text or attachment required' });
    const message = { user: req.user.userId, text, timestamp: new Date(), attachment };
    group.messages.push(message);
    await group.save();
    await group.populate('messages.user', 'name email');
    res.status(201).json({ message: 'Message posted', messages: group.messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Post a new message to a group (text-only, legacy)
exports.postGroupMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Message text required' });
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    // Only members can post
    if (!group.members.map(m => m.toString()).includes(req.user.userId)) {
      return res.status(403).json({ message: 'Only members can post messages.' });
    }
    const message = { user: req.user.userId, text, timestamp: new Date() };
    group.messages.push(message);
    await group.save();
    await group.populate('messages.user', 'name email');
    res.status(201).json({ message: 'Message posted', messages: group.messages });
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
// Get a single group by ID with all relevant fields populated
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email phone avatar')
      .populate('admins', 'name email phone avatar')
      .populate('loans.requester', 'name email phone avatar');
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Fetch all transactions for this group
    const transactions = await Transaction.find({ group: group._id }).populate('user', 'name email avatar');
    const groupObj = group.toObject();
    groupObj.transactions = transactions;

    res.json(groupObj);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// --- STUBS TO FIX ROUTE ERRORS ---
exports.getGroupMessages = async (req, res) => {
  res.status(200).json({ message: 'getGroupMessages stub' });
};
exports.editGroupMessage = async (req, res) => {
  res.status(200).json({ message: 'editGroupMessage stub' });
};
exports.deleteGroupMessage = async (req, res) => {
  res.status(200).json({ message: 'deleteGroupMessage stub' });
};
exports.requestLoan = async (req, res) => {
  res.status(200).json({ message: 'requestLoan stub' });
};
exports.getLoans = async (req, res) => {
  res.status(200).json({ message: 'getLoans stub' });
};
exports.approveLoan = async (req, res) => {
  res.status(200).json({ message: 'approveLoan stub' });
};
exports.declineLoan = async (req, res) => {
  res.status(200).json({ message: 'declineLoan stub' });
};
exports.repayLoan = async (req, res) => {
  res.status(200).json({ message: 'repayLoan stub' });
};

// Handle group contribution via Paystack
exports.contributeToGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { amount, paystackReference } = req.body;
    const userId = req.user.userId;
    if (!amount || !paystackReference) {
      return res.status(400).json({ message: 'Amount and Paystack reference are required.' });
    }
    // Verify payment with Paystack
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const verifyUrl = `https://api.paystack.co/transaction/verify/${paystackReference}`;
    const paystackRes = await axios.get(verifyUrl, {
      headers: { Authorization: `Bearer ${paystackSecret}` }
    });
    const paymentData = paystackRes.data;
    if (!paymentData.status || paymentData.data.status !== 'success' || paymentData.data.amount / 100 !== amount) {
      return res.status(400).json({ message: 'Payment verification failed or amount mismatch.' });
    }
    // Find group and check membership
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.map(m => m.toString()).includes(userId)) {
      return res.status(403).json({ message: 'Only group members can contribute.' });
    }
    // Record contribution in group
    group.contributions.push({ user: userId, amount, paystackReference });
    await group.save();
    // Optionally, record in Transaction model
    const transaction = new Transaction({
      user: userId,
      group: groupId,
      type: 'contribution',
      amount,
      status: 'completed',
      method: 'paystack',
      date: new Date(),
      reason: 'Group contribution'
    });
    await transaction.save();
    // Return updated group info
    await group.populate('contributions.user', 'name email');
    res.status(201).json({ message: 'Contribution successful', group });
  } catch (err) {
    if (err.response && err.response.data) {
      return res.status(400).json({ message: 'Paystack verification failed', error: err.response.data });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};