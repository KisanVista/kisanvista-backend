const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  village: { type: String },
  referral_code: { type: String },
  registered_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
