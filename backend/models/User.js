const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  userType: { type: String, enum: ['individual', 'group_member', 'susu_collector'], default: 'individual' },
  ghanaCard: { type: String },
  role: { type: String, enum: ['member', 'admin'], default: 'member' },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  profileImage: { type: String }, // URL or file path to profile picture
  avatar: { type: String }, // Predefined avatar choice
  paystackRecipients: [
    {
      phone: { type: String, required: true },
      provider: { type: String, enum: ['MTN', 'Vodafone', 'AirtelTigo'], required: true },
      recipientCode: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
