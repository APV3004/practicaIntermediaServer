const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const authenticate = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadLogo } = require('../controllers/uploadLogo');
const { inviteGuest } = require('../controllers/inviteGuest');

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
router.get('/me', authenticate, userController.getUserFromToken); 

// Subir logo
router.patch('/logo', authenticate, upload.single('logo'), uploadLogo);

// Funcionalidades adicionales (punto 6)
router.delete('/delete', authenticate, userController.deleteUser);
router.post('/recover', userController.recoverPasswordInit);
router.post('/reset-password', userController.recoverPassword);
router.post('/invite', authenticate, inviteGuest); 

module.exports = router;