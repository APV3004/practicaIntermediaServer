const { check } = require('express-validator');

// Validador para el NIF (Formato: 12345678Z)
const nifValidator = (nif) => {
  const regex = /^[0-9]{8}[A-Za-z]{1}$/;  // Expresión regular para NIF español
  return regex.test(nif);
};

// Middleware para validar el NIF
const validatorNif = [
  check('nif')
    .exists()
    .withMessage('NIF is required')  // Asegura que el NIF esté presente
    .bail()  // Detiene el procesamiento si ya hay un error
    .custom(nifValidator)
    .withMessage('Invalid NIF format'),  // Usa el validador personalizado para el NIF
];

module.exports = validatorNif;