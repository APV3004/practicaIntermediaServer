const { sendEmail } = require('../utils/handleEmail');
const { handleHttpError } = require('../utils/handleError');
const { matchedData } = require('express-validator');

const send = async (req, res) => {
  try {
    const info = matchedData(req);
    const data = await sendEmail({
      to: info.to,
      subject: info.subject,
      text: info.text,
      from: info.from,
    });
    res.send({ message: "Email enviado correctamente", data });
  } catch (err) {
    handleHttpError(res, 'ERROR_SEND_EMAIL');
  }
};

module.exports = { send };