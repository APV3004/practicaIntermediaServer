// routes/deliveryNote.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { auth } = require('../middleware/auth');
const controller = require('../controllers/deliveryNote');
const { validateDeliveryNote } = require('../validators/deliveryNote');

/**
 * @swagger
 * tags:
 *   name: Albaranes
 *   description: Endpoints para la gestión de albaranes
 */

/**
 * @swagger
 * /api/deliverynote:
 *   post:
 *     summary: Crear un nuevo albarán
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [project, client, type]
 *             properties:
 *               project:
 *                 type: string
 *               client:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [simple, multiple]
 *               data:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     person:
 *                       type: string
 *                     hours:
 *                       type: number
 *                     material:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       201:
 *         description: Albarán creado
 */
router.post('/', auth, validateDeliveryNote, controller.createNote);

/**
 * @swagger
 * /api/deliverynote:
 *   get:
 *     summary: Listar todos los albaranes del usuario o su compañía
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de albaranes
 */
router.get('/', auth, controller.getNotes);

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   get:
 *     summary: Obtener un albarán por ID (incluye usuario, cliente y proyecto)
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán encontrado
 *       404:
 *         description: Albarán no encontrado
 */
router.get('/:id', auth, controller.getNoteById);

/**
 * @swagger
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     summary: Obtener PDF de un albarán (redirige a IPFS si está firmado y subido)
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF generado o redirigido correctamente
 *       404:
 *         description: Albarán no encontrado
 *       500:
 *         description: Error generando o accediendo al PDF
 */
router.get('/pdf/:id', auth, controller.getPDF);

/**
 * @swagger
 * /api/deliverynote/sign/{id}:
 *   post:
 *     summary: Firmar un albarán y subir firma + PDF a la nube
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - signature
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Albarán firmado
 *       400:
 *         description: Falta la firma
 */
router.post('/sign/:id', auth, upload.single('signature'), controller.signNote);

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   delete:
 *     summary: Eliminar un albarán (solo si no está firmado)
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán eliminado
 *       400:
 *         description: No se puede eliminar si está firmado
 */
router.delete('/:id', auth, controller.deleteNote);

module.exports = router;
