// validators/project.js
const { body } = require("express-validator");

exports.validateProject = [
  body("name")
    .notEmpty().withMessage("El nombre del proyecto es obligatorio")
    .isLength({ max: 100 }).withMessage("Nombre demasiado largo"),
  body("client")
    .notEmpty().withMessage("Debe indicar el ID del cliente asociado")
];