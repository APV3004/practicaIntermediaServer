const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validatorMail } = require("../validators/mail");
const { send } = require("../controllers/mail");

/**
 * @swagger
 * tags:
 *   name: Email
 *   description: Endpoints para el envío de correos electrónicos
 */

/**
 * @swagger
 * /api/mail:
 *   post:
 *     summary: Enviar un correo electrónico usando OAuth2 (Gmail)
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
 *             properties:
 *               to:
 *                 type: string
 *                 example: destinatario@gmail.com
 *               from:
 *                 type: string
 *                 example: tucuenta@gmail.com
 *               subject:
 *                 type: string
 *                 example: Código de verificación
 *               text:
 *                 type: string
 *                 example: "Tu código es: 123456"
 *               verificationCode:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email enviado correctamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error al enviar el correo
 */
router.post("/mail", auth, validatorMail, send);

module.exports = router;