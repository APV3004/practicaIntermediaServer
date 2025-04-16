const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const clientController = require("../controllers/client");
const { validateClient } = require("../validators/client");
const { validationResult } = require("express-validator");

const checkValidations = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Endpoints para la gestión de clientes
 */

/**
 * @swagger
 * /api/client:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Empresa XYZ
 *               email:
 *                 type: string
 *                 example: contacto@empresa.com
 *               phone:
 *                 type: string
 *                 example: "+34123456789"
 *               address:
 *                 type: string
 *                 example: Calle Falsa 123, Madrid
 *     responses:
 *       201:
 *         description: Cliente creado correctamente
 */
router.post("/", auth, validateClient, checkValidations, clientController.createClient);

/**
 * @swagger
 * /api/client/{id}:
 *   put:
 *     summary: Actualizar un cliente existente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente actualizado
 */
router.put("/:id", auth, validateClient, checkValidations, clientController.updateClient);

/**
 * @swagger
 * /api/client:
 *   get:
 *     summary: Obtener todos los clientes del usuario o su compañía
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router.get("/", auth, clientController.getAllClients);

/**
 * @swagger
 * /api/client/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     tags: [Clientes]
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
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 */
router.get("/:id", auth, clientController.getClientById);

/**
 * @swagger
 * /api/client/archive/{id}:
 *   patch:
 *     summary: Archivar (soft delete) un cliente
 *     tags: [Clientes]
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
 *         description: Cliente archivado correctamente
 */
router.patch("/archive/:id", auth, clientController.archiveClient);

/**
 * @swagger
 * /api/client/restore/{id}:
 *   patch:
 *     summary: Restaurar un cliente archivado
 *     tags: [Clientes]
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
 *         description: Cliente restaurado correctamente
 */
router.patch("/restore/:id", auth, clientController.restoreClient);

/**
 * @swagger
 * /api/client/{id}:
 *   delete:
 *     summary: Eliminar un cliente permanentemente (hard delete)
 *     tags: [Clientes]
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
 *         description: Cliente eliminado
 */
router.delete("/:id", auth, clientController.deleteClient);

module.exports = router;