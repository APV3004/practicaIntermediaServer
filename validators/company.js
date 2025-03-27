const { check } = require('express-validator');

// Middleware para validar los datos de la compañía
const validatorCompany = [
  check('companyName')
    .exists()
    .withMessage('Company name is required')
    .bail(),  // Detiene el procesamiento si ya hay un error
  check('companyCif')
    .exists()
    .withMessage('CIF is required')
    .bail()
    .custom(cifValidator)
    .withMessage('Invalid CIF format'),
  check('companyAddress')
    .exists()
    .withMessage('Company address is required')
    .bail(),
];

module.exports = validatorCompany;