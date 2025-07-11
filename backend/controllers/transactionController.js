const Transaction = require('../models/Transaction');

exports.createTransaction = async (req, res) => {
  try {
    const { group, type, amount, method, reason } = req.body;
    const transaction = new Transaction({
      user: req.user.userId,
      group,
      type,
      amount,
      method,
      reason
    });
    await transaction.save();
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
