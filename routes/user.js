const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

// Rutas para las operaciones de usuario
router.post('/register', userController.registerUser);
router.put('/validation', userController.verifyCode);
router.post('/login', userController.loginUser); // Ruta añadida para login

module.exports = router;