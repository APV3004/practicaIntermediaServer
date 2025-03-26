const { check } = require('express-validator');

// Validador para email
const emailValidator = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

// Middleware de validación para el email
const validatorEmail = [
  check('email')
    .exists()
    .withMessage('Email is required')  // Asegura que el email esté presente
    .bail()  // Detiene el procesamiento si ya hay un error
    .isEmail()
    .withMessage('Invalid email format')  // Verifica que el formato del email sea válido
    .custom(emailValidator)
    .withMessage('Custom email validation failed'),  // Usa el validador personalizado
];

module.exports = validatorEmail;