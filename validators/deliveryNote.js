const { check } = require('express-validator');
const { validateResults } = require('../utils/handleValidator');

exports.validateDeliveryNote = [
  check('project').notEmpty().withMessage('ID de proyecto requerido'),
  check('client').notEmpty().withMessage('ID de cliente requerido'),
  check('type').isIn(['simple', 'multiple']),
  (req, res, next) => validateResults(req, res, next),
];