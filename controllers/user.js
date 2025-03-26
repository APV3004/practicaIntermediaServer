const jwt = require('jsonwebtoken');
const User = require('../models/user');  // Asegúrate de que el modelo esté importado
const { generateVerificationCode } = require('../utils/codeGenerator');

// Registrar usuario
exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({ message: 'Email no válido' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
  }

  try {
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

    res.status(201).json({
      email: user.email,
      status: user.status,
      role: user.role,
      verificationCode: user.verificationCode,  // Devolvemos el código de verificación
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el registro' });
  }
};

// Validar email
exports.validateEmail = async (req, res) => {
  const { code } = req.body; // El código de verificación que el usuario envía

  if (!code) {
    return res.status(400).json({ message: 'El código de verificación es requerido' });
  }

  try {
    // Decodificar el token JWT para obtener el ID del usuario
    const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
    const userId = decoded.id;

    // Buscar al usuario por ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el código coincide
    if (user.verificationCode === code) {
      // Si el código es correcto, cambiar el estado a 'verified'
      user.status = 'verified';
      await user.save();

      res.status(200).json({ message: 'Email verificado con éxito' });
    } else {
      return res.status(400).json({ message: 'Código de verificación incorrecto' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al verificar el email' });
  }
};

// Obtener el código de verificación (solo para pruebas)
exports.getVerificationCode = async (req, res) => {
  try {
    // Decodificar el token JWT para obtener el ID del usuario
    const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
    const userId = decoded.id;

    // Buscar al usuario por ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Retornar el código de verificación
    res.status(200).json({ verificationCode: user.verificationCode });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al obtener el código de verificación' });
  }
};