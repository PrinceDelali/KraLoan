const Transaction = require('../models/Transaction');
const Group = require('../models/Group');

exports.createTransaction = async (req, res) => {
  try {
    const { group, type, amount, method, reason, paystackReference } = req.body;
    const transaction = new Transaction({
      user: req.user.userId,
      group,
      type,
      amount,
      method,
      reason,
      paystackReference,
      status: type === 'contribution' ? 'completed' : undefined
    });
    await transaction.save();

    // If it's a contribution, update the group's contributions and totalSavings
    if (type === 'contribution') {
      const groupDoc = await Group.findById(group);
      if (groupDoc) {
        groupDoc.contributions.push({
          user: req.user.userId,
          amount,
          paystackReference,
          status: 'completed',
          method
        });
        // Optionally recalculate totalSavings
        groupDoc.totalSavings = groupDoc.contributions
          .filter(c => c.status === 'completed')
          .reduce((sum, c) => sum + c.amount, 0);
        await groupDoc.save();
      }
    }

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.userId }).populate('group', 'name');
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get transactions for a specific group (user's transactions only)
exports.getGroupTransactions = async (req, res) => {
  try {
    const { groupId } = req.params;
    const transactions = await Transaction.find({ 
      group: groupId,
      user: req.user.userId 
    }).populate('group', 'name').populate('user', 'name email avatar');
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all transactions for a specific group (for admin/group view)
exports.getAllGroupTransactions = async (req, res) => {
  try {
    const { groupId } = req.params;
    const transactions = await Transaction.find({ 
      group: groupId 
    }).populate('group', 'name').populate('user', 'name email avatar');
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
