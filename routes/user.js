const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');  // Asegúrate de que esté importado correctamente

// Ruta para registrar usuario
router.post('/register', userController.registerUser);

// Ruta para validar el email
router.put('/validation', userController.validateEmail);

// Ruta para login
router.post('/login', userController.loginUser);  // Ruta para login

// Ruta temporal para obtener el código de verificación (para pruebas)
router.get('/verificationCode', userController.getVerificationCode);

module.exports = router;