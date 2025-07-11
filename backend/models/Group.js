const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  targetAmount: { type: Number, default: 0 },
  monthlyContribution: { type: Number, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  inviteToken: { type: String, unique: true, index: true },
}, { timestamps: true });

module.exports = mongoose.model('Group', GroupSchema);
