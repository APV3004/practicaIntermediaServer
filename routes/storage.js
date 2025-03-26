const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storage');

// Rutas para el almacenamiento de archivos
router.post('/upload', storageController.uploadFile);
router.get('/files', storageController.getFiles);

module.exports = router;