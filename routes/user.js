const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const authenticate = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadLogo } = require('../controllers/uploadLogo');
const { getUserProfile } = require('../controllers/getUserProfile');

// Registro
router.post('/register', userController.registerUser);

// Verificación
router.put('/validation', userController.verifyCode);

// Login
router.post('/login', userController.loginUser);

// Onboarding personal
router.put('/onboarding', authenticate, userController.updateUserData);

// Datos de la compañía
router.patch('/company', authenticate, userController.updateCompanyData);

// Obtener perfil del usuario autenticado
router.get('/me', authenticate, getUserProfile);

// Subir logo
router.patch('/logo', authenticate, upload.single('logo'), uploadLogo);

module.exports = router;