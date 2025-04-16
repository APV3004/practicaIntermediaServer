const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { validateProject } = require("../validators/project");
const { validationResult } = require("express-validator");
const projectController = require("../controllers/project");

const checkValidations = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

/**
 * @swagger
 * /api/project:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, client]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Proyecto Alpha
 *               description:
 *                 type: string
 *                 example: Este proyecto trata sobre...
 *               client:
 *                 type: string
 *                 example: 661f9b86c2ea4d9c12345678
 *     responses:
 *       201:
 *         description: Proyecto creado correctamente
 */
router.post("/", auth, validateProject, checkValidations, projectController.createProject);

/**
 * @swagger
 * /api/project/{id}:
 *   put:
 *     summary: Actualizar un proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               client:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 */
router.put("/:id", auth, validateProject, checkValidations, projectController.updateProject);

/**
 * @swagger
 * /api/project:
 *   get:
 *     summary: Obtener todos los proyectos del usuario o su compañía
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos obtenida correctamente
 */
router.get("/", auth, projectController.getAllProjects);

/**
 * @swagger
 * /api/project/{id}:
 *   get:
 *     summary: Obtener un proyecto específico por ID
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *       404:
 *         description: Proyecto no encontrado
 */
router.get("/:id", auth, projectController.getProjectById);

/**
 * @swagger
 * /api/project/archive/{id}:
 *   patch:
 *     summary: Archivar un proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto archivado correctamente
 */
router.patch("/archive/:id", auth, projectController.archiveProject);

/**
 * @swagger
 * /api/project/restore/{id}:
 *   patch:
 *     summary: Restaurar un proyecto archivado
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto restaurado correctamente
 */
router.patch("/restore/:id", auth, projectController.restoreProject);

/**
 * @swagger
 * /api/project/{id}:
 *   delete:
 *     summary: Eliminar un proyecto permanentemente
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto eliminado
 */
router.delete("/:id", auth, projectController.deleteProject);

module.exports = router;