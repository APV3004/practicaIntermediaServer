const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { generateVerificationCode } = require('../utils/codeGenerator');

exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación de email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ message: 'Email no válido' });
    }

    // Validación de contraseña
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
    }

    // Verificar si el email ya está registrado
    const existing = await User.findOne({ email });
    if (existing && existing.status === 'verified') {
      return res.status(409).json({ message: 'Este email ya está registrado y validado' });
    }

    // Generar código de verificación
    const verificationCode = generateVerificationCode();

    // Crear el nuevo usuario
    const user = new User({ email, password, verificationCode });
    await user.save();

    // Generar token JWT
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Responder con el usuario y el token
    res.status(201).json({
      email: user.email,
      status: user.status,
      role: user.role,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el registro' });
  }
};