const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { auth } = require('../middleware/auth'); // ✅ Importación corregida
const upload = require('../middleware/upload');
const { uploadLogo } = require('../controllers/uploadLogo');
const { inviteGuest } = require('../controllers/inviteGuest');

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Endpoint base para comprobar disponibilidad del servicio de usuario
 *     tags: [User]
 *     responses:
 *       200:
 *         description: OK - Ruta base de usuarios disponible
 */
router.get('/', (req, res) => {
  res.status(200).json({ message: 'OK - ruta base /api/user' });
});

// Registro
router.post('/register', userController.registerUser);

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/user'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 */

// Verificación
router.put('/validation', userController.verifyCode);

// Login
router.post('/login', userController.loginUser);

// Onboarding personal
router.put('/onboarding', auth, userController.updateUserData);

// Datos de la compañía
router.patch('/company', auth, userController.updateCompanyData);

// Obtener perfil del usuario autenticado
router.get('/me', auth, userController.getUserFromToken);

// Subir logo
router.patch('/logo', auth, upload.single('logo'), uploadLogo);

// Funcionalidades adicionales (punto 6)
router.delete('/delete', auth, userController.deleteUser);
router.post('/recover', userController.recoverPasswordInit);
router.post('/reset-password', userController.recoverPassword);
router.post('/invite', auth, inviteGuest);

module.exports = router;