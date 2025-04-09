// validators/client.js
const { body } = require("express-validator");

exports.validateClient = [
  body("name")
    .notEmpty().withMessage("El nombre del cliente es obligatorio")
    .isLength({ max: 100 }).withMessage("El nombre es demasiado largo"),

  body("email")
    .optional()
    .isEmail().withMessage("El email no es válido"),

  body("phone")
    .optional()
    .isMobilePhone("any").withMessage("Número de teléfono inválido"),

  body("address")
    .optional()
    .isLength({ max: 200 }).withMessage("La dirección es demasiado larga")
];