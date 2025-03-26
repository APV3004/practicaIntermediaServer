const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Función para generar un código de verificación aleatorio
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();  // Genera un código de 6 dígitos
};

// Función para registrar un nuevo usuario
exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  try {
    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }

    const verificationCode = generateVerificationCode();  // Genera el código de verificación
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashedPassword, verificationCode });
    await user.save();

    // Devolver el código de verificación en la respuesta, junto con el email y el token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Respuesta con el código de verificación
    res.status(201).json({
      email: user.email,
      verificationCode: verificationCode,  // Código de verificación mostrado al usuario
      token: token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
};

// Función para verificar el código de verificación
exports.verifyCode = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'El código de verificación es requerido' });
  }

  try {
    const user = await User.findOne({ verificationCode: code });
    if (!user) {
      return res.status(404).json({ message: 'Código de verificación no válido' });
    }

    user.isVerified = true;
    user.verificationCode = null;  // Eliminar el código de verificación
    await user.save();

    res.status(200).json({ message: 'Usuario verificado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al verificar el código' });
  }
};

// Función de login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Verificar si el email existe
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  // Verificar la contraseña
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Contraseña incorrecta' });
  }

  // Generar un token JWT
  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

  // Devolver los datos del usuario y el token
  res.status(200).json({
    email: user.email,
    isVerified: user.isVerified,
    token: token,
  });
};