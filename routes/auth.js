const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Rutas para la autenticación
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/validate', authController.validateEmail);

module.exports = router;