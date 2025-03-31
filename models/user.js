const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verificationCode: { type: String },
  isVerified: { type: Boolean, default: false },
  
  // Datos personales
  firstName: { type: String },
  lastName: { type: String },
  nif: { type: String },
  
  // Datos de la compañía
  isAutonomous: { type: Boolean, default: false },
  companyName: { type: String },
  companyCif: { type: String },
  companyAddress: { type: String },
  companyStreet: { type: String },
  companyNumber: { type: Number },
  companyPostal: { type: Number },
  companyCity: { type: String },
  companyProvince: { type: String },

  // Logo del usuario
  logo: { type: String }
});

const User = mongoose.model('User', userSchema);

module.exports = User;