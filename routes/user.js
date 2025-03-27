const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');  // Importa el controlador actualizado
const authenticate = require('../middleware/auth');  // Middleware para proteger las rutas

// Ruta para registrar un nuevo usuario
router.post('/register', userController.registerUser);

// Ruta para verificar el código de verificación
router.put('/validation', userController.verifyCode);

// Ruta para login de usuario
router.post('/login', userController.loginUser);

// Ruta para actualizar los datos personales del usuario (onboarding)
router.put('/onboarding', authenticate, userController.updateUserData);

// Ruta para actualizar los datos de la compañía (con los cambios para autónomos)
router.patch('/company', authenticate, userController.updateCompanyData);  // Aquí se utiliza el método PATCH

module.exports = router;