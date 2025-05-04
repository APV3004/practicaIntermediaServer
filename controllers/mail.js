const { sendEmail } = require('../utils/handleEmail');
const { handleHttpError } = require('../utils/handleError');
const { matchedData } = require('express-validator');
const User = require('../models/user');

const send = async (req, res) => {
  try {
    const info = matchedData(req);

    const user = await User.findOne({ email: info.to });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (!user.verificationCode) {
      return res.status(400).json({ message: 'Este usuario no tiene código de verificación' });
    }

    await sendEmail({
      to: info.to,
      subject: info.subject || 'Tu código de verificación',
      text: info.text || `Tu código de verificación es: ${user.verificationCode}`,
      from: info.from
    });

    res.send({ message: "Email enviado correctamente" });
  } catch (err) {
    console.error(err);
    handleHttpError(res, 'ERROR_SEND_EMAIL');
  }
};

module.exports = { send };