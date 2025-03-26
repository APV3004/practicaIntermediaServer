const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');  // Asegúrate de que esté importado correctamente
const authenticate = require('../middleware/auth');  // Importamos el middleware

// Ruta para registrar usuario
router.post('/register', userController.registerUser);

// Ruta para validar el email
router.put('/validation', userController.validateEmail);

// Ruta para login
router.post('/login', userController.loginUser);

// Ruta para actualizar datos personales (onboarding) - protegida con JWT
router.put('/onboarding', authenticate, userController.onboarding);  // Usamos el middleware aquí

module.exports = router;