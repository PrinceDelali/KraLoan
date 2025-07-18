const mongoose = require('mongoose');

const DirectMessageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  attachment: {
    url: String,
    originalname: String,
    mimetype: String
  }
});

module.exports = mongoose.model('DirectMessage', DirectMessageSchema); 