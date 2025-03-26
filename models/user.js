const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verificationCode: { type: String },  // Campo para almacenar el código de verificación
  isVerified: { type: Boolean, default: false },  // Para saber si el usuario está verificado
});

const User = mongoose.model('User', userSchema);

module.exports = User;