const { validationResult } = require("express-validator");

/**
 * Middleware para procesar los errores de validación
 */
const validateResults = (req, res, next) => {
  try {
    validationResult(req).throw();
    return next();
  } catch (err) {
    return res.status(400).json({
      errors: err.array()
    });
  }
};

module.exports = { validateResults };