const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { auth } = require('../middleware/auth'); // ✅ Importación corregida
const upload = require('../middleware/upload');
const { uploadLogo } = require('../controllers/uploadLogo');
const { inviteGuest } = require('../controllers/inviteGuest');

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Endpoints relacionados con usuarios
 */

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
/**
 * @swagger
 * /api/user/validation:
 *   put:
 *     summary: Validar el código recibido por email
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Usuario verificado correctamente
 */
router.put('/validation', userController.verifyCode);

// Login
/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Iniciar sesión con email y contraseña
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/login'
 *     responses:
 *       200:
 *         description: Usuario autenticado exitosamente
 */
router.post('/login', userController.loginUser);

// Onboarding personal
/**
 * @swagger
 * /api/user/onboarding:
 *   put:
 *     summary: Guardar datos personales del usuario
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               nif:
 *                 type: string
 *     responses:
 *       200:
 *         description: Datos personales actualizados
 */
router.put('/onboarding', auth, userController.updateUserData);

// Datos de la compañía
/**
 * @swagger
 * /api/user/company:
 *   patch:
 *     summary: Guardar o actualizar datos de la empresa
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company:
 *                 type: object
 *                 properties:
 *                   companyName:
 *                     type: string
 *                   companyCif:
 *                     type: string
 *                   companyAddress:
 *                     type: string
 *     responses:
 *       200:
 *         description: Datos de la empresa actualizados
 */
router.patch('/company', auth, userController.updateCompanyData);

// Obtener perfil del usuario autenticado
/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Obtener información del usuario logueado
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 */
router.get('/me', auth, userController.getUserFromToken);

// Subir logo
/**
 * @swagger
 * /api/user/logo:
 *   patch:
 *     summary: Subir logo de la empresa
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo subido correctamente
 */
router.patch('/logo', auth, upload.single('logo'), uploadLogo);

// Funcionalidades adicionales (punto 6)
/**
 * @swagger
 * /api/user/delete:
 *   delete:
 *     summary: Eliminar usuario (hard o soft delete)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: soft
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           example: false
 *     responses:
 *       200:
 *         description: Usuario eliminado o archivado
 */
router.delete('/delete', auth, userController.deleteUser);

/**
 * @swagger
 * /api/user/recover:
 *   post:
 *     summary: Iniciar recuperación de contraseña
 *     tags: [User]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Código de recuperación enviado
 */
router.post('/recover', userController.recoverPasswordInit);

/**
 * @swagger
 * /api/user/reset-password:
 *   post:
 *     summary: Cambiar contraseña con código de recuperación
 *     tags: [User]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 */
router.post('/reset-password', userController.recoverPassword);

/**
 * @swagger
 * /api/user/invite:
 *   post:
 *     summary: Invitar a un usuario como guest
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario invitado correctamente
 */
router.post('/invite', auth, inviteGuest);

module.exports = router;