const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  googleId: String,
  authMethod: { type: String, required: true, enum: ['password', 'google'], default: 'password' }
});

module.exports = mongoose.model('User', userSchema);