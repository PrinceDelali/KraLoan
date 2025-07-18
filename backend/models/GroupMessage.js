const mongoose = require('mongoose');

const GroupMessageSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  attachment: {
    url: String,
    originalname: String,
    mimetype: String
  }
});

module.exports = mongoose.model('GroupMessage', GroupMessageSchema); 