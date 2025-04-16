const { check } = require('express-validator');
const { validateResults } = require('../utils/handleValidator');

// Validador personalizado para email
const emailValidator = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

// Middleware de validación de campos de envío de correo
const validatorMail = [
  check('subject')
    .exists().withMessage('Subject is required')
    .notEmpty().withMessage('Subject cannot be empty'),

  check('text')
    .exists().withMessage('Text is required')
    .notEmpty().withMessage('Text cannot be empty'),

  check('to')
    .exists().withMessage('Recipient email (to) is required')
    .bail()
    .isEmail().withMessage('Invalid email format')
    .custom(emailValidator).withMessage('Custom email validation failed for "to"'),

  check('from')
    .exists().withMessage('Sender email (from) is required')
    .bail()
    .isEmail().withMessage('Invalid email format')
    .custom(emailValidator).withMessage('Custom email validation failed for "from"'),

  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validatorMail };