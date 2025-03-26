const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: false  // Nombre agregado para onboarding
  },
  surname: {
    type: String,
    required: false  // Apellidos agregados para onboarding
  },
  nif: {
    type: String,
    required: false  // NIF agregado para onboarding
  },
  status: {
    type: String,
    enum: ['pending', 'verified'],
    default: 'pending'
  },
  role: {
    type: String,
    enum: ['user', 'guest', 'admin'],
    default: 'user'
  },
  verificationCode: String,
  recoveryCode: String,  // Para la recuperación de contraseña
  verificationAttempts: {
    type: Number,
    default: 3
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);