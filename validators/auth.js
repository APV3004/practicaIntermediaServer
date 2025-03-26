const { check } = require('express-validator');
const handleValidator = require('../utils/handleValidator');  // Asegúrate de que handleValidator esté configurado correctamente

// Validador de registro
const validatorRegister = [
  check('email').exists().isEmail().withMessage('Email is required'),
  check('password')
    .exists()
    .isLength({ min: 8 })
    .withMessage('Password is required'),
  (req, res, next) => {
    return handleValidator(req, res, next);
  },
];

// Validador para la verificación del código
const validatorVerfiy = [
  check('code')
    .exists()
    .isLength({ min: 6 })
    .withMessage('Verification code is required'),
  (req, res, next) => {
    return handleValidator(req, res, next);
  },
];

// Validador de login
const validatorLogin = [
  check('email').exists().isEmail().withMessage('Email is required'),
  check('password')
    .exists()
    .isLength({ min: 8 })
    .withMessage('Password is required'),
  (req, res, next) => {
    return handleValidator(req, res, next);
  },
];

module.exports = { validatorRegister, validatorVerfiy, validatorLogin };