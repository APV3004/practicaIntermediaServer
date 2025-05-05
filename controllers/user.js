const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { generateCode } = require('../utils/codeGenerator');

// Función para generar un código de verificación aleatorio
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Registro
exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'El email ya está registrado' });

    const verificationCode = generateVerificationCode();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashedPassword, verificationCode });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      email: user.email,
      verificationCode: verificationCode,
      token: token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
};

// Verificación
exports.verifyCode = async (req, res) => {
  const { code } = req.body;

  if (!code) return res.status(400).json({ message: 'El código de verificación es requerido' });

  try {
    const user = await User.findOne({ verificationCode: code });
    if (!user) return res.status(404).json({ message: 'Código de verificación no válido' });

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ message: 'Usuario verificado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al verificar el código' });
  }
};

// Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(401).json({ message: 'Contraseña incorrecta' });

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.status(200).json({
    email: user.email,
    isVerified: user.isVerified,
    token: token,
  });
};

// Onboarding personal
exports.updateUserData = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { firstName, lastName, nif } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.firstName = firstName;
    user.lastName = lastName;
    user.nif = nif;
    await user.save();

    res.status(200).json({ message: 'Datos actualizados correctamente', firstName, lastName, nif });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar los datos del usuario' });
  }
};

// Onboarding empresa
exports.updateCompanyData = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { companyName, companyCif, companyAddress, companyStreet, companyNumber, companyPostal, companyCity, companyProvince, isAutonomous } = req.body.company;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (isAutonomous) {
      user.companyName = user.firstName + ' ' + user.lastName;
      user.companyCif = user.nif;
      user.companyAddress = `${user.firstName} ${user.lastName} Address`;
    } else {
      if (!companyName || !companyCif || !companyAddress || !companyStreet || !companyNumber || !companyPostal || !companyCity || !companyProvince) {
        return res.status(400).json({ message: 'Todos los campos de la compañía son requeridos' });
      }

      const cifPattern = /^[A-Z0-9]{9}$/;
      if (!cifPattern.test(companyCif)) {
        return res.status(400).json({ message: 'El CIF no tiene un formato válido' });
      }

      Object.assign(user, {
        companyName,
        companyCif,
        companyAddress,
        companyStreet,
        companyNumber,
        companyPostal,
        companyCity,
        companyProvince
      });
    }

    await user.save();
    res.status(200).json({ message: 'Datos de la compañía actualizados correctamente', company: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar los datos de la compañía' });
  }
};

// ✅ GET /me (desde JWT)
exports.getUserFromToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
};

// ✅ DELETE /delete?soft=false
exports.deleteUser = async (req, res) => {
  try {
    const { soft } = req.query;

    if (soft === 'false') {
      await User.findByIdAndDelete(req.user.id);
      return res.json({ message: 'Usuario eliminado permanentemente' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { status: 'inactive' },
      { new: true }
    );

    res.json({ message: 'Usuario desactivado', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
};

// ✅ POST /recover
exports.recoverPasswordInit = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

  const recoveryCode = generateVerificationCode();
  user.recoveryCode = recoveryCode;
  await user.save();

  console.log(`Código de recuperación para ${email}: ${recoveryCode}`);

  const response = { message: 'Código de recuperación enviado' };
if (process.env.NODE_ENV === 'test') {
  response.code = recoveryCode;
}
res.status(200).json(response);
};

// ✅ POST /reset-password
exports.recoverPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.recoveryCode !== code) {
    return res.status(400).json({ message: 'Código incorrecto o usuario inválido' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.recoveryCode = undefined;
  await user.save();

  res.json({ message: 'Contraseña actualizada correctamente' });
};

// ✅ POST /invite
exports.inviteGuest = async (req, res) => {
  const { email } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'El email ya está registrado' });

  const newGuest = await User.create({
    email,
    role: 'guest',
    status: 'pending',
    invitedBy: req.user.id
  });

  res.json({ message: 'Usuario invitado correctamente', guest: newGuest });
};