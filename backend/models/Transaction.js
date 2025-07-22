const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  type: { type: String, enum: ['contribution', 'withdrawal'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'completed', 'rejected'], default: 'pending' },
  method: { type: String },
  paystackReference: { type: String, unique: true, sparse: true },
  date: { type: Date, default: Date.now },
  reason: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
