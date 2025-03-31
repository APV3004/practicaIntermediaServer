const User = require('../models/user');
const bcrypt = require('bcrypt');

const inviteGuest = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'El email es obligatorio' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }

    const dummyPassword = await bcrypt.hash('temporal123', 10);
    console.log('[INVITE] Email:', email);
    console.log('[INVITE] Password Hash:', dummyPassword);
    console.log('[INVITE] User ID:', req.user?.id);

    const newGuest = await User.create({
      email,
      password: dummyPassword,
      role: 'guest',
      status: 'pending',
      invitedBy: req.user.id
    });

    res.status(201).json({
      message: 'Usuario invitado correctamente',
      guest: {
        email: newGuest.email,
        role: newGuest.role,
        status: newGuest.status,
        invitedBy: newGuest.invitedBy
      }
    });
  } catch (err) {
    console.error('Error al invitar usuario:', err);
    res.status(500).json({ message: 'Error al invitar usuario' });
  }
};

module.exports = { inviteGuest };