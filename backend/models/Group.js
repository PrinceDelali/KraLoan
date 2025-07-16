const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  targetAmount: { type: Number, default: 0 },
  monthlyContribution: { type: Number, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  inviteToken: { type: String, unique: true, index: true },
  messages: [
    new mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      attachment: {
        filename: String,
        originalname: String,
        mimetype: String,
        size: Number,
        url: String
      }
    }, { _id: true })
  ],
  loans: [
    new mongoose.Schema({
      amount: { type: Number, required: true },
      reason: { type: String },
      requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      status: { type: String, enum: ['pending', 'approved', 'declined', 'repaid'], default: 'pending' },
      approvals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      repayments: [{
        amount: Number,
        date: { type: Date, default: Date.now }
      }],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }, { _id: true })
  ],
}, { timestamps: true });

module.exports = mongoose.model('Group', GroupSchema);
