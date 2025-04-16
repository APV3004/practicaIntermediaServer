const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validatorMail } = require("../validators/mail");
const { send } = require("../controllers/mail");

/**
 * @swagger
 * /api/mail:
 *   post:
 *     summary: Enviar un correo electrónico con OAuth2 (Gmail)
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - from
 *               - subject
 *               - text
 *             properties:
 *               to:
 *                 type: string
 *                 example: destinatario@gmail.com
 *               from:
 *                 type: string
 *                 example: tuemail@gmail.com
 *               subject:
 *                 type: string
 *                 example: Código de verificación
 *               text:
 *                 type: string
 *                 example: Tu código de verificación es 123456
 *     responses:
 *       200:
 *         description: Email enviado correctamente
 *       400:
 *         description: Validación fallida o error en el envío
 *       401:
 *         description: No autorizado
 */
router.post("/mail", auth, validatorMail, send);

module.exports = router;