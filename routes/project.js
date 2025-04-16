// routes/project.js
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
console.log("🧪 auth:", typeof auth);
const { validateProject } = require("../validators/project");
console.log("🧪 validateProject:", typeof validateProject);
console.log("🧪 es array:", Array.isArray(validateProject));
const { validationResult } = require("express-validator");
const projectController = require("../controllers/project");
console.log("🧪 createProject:", typeof projectController.createProject);

const checkValidations = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.post("/", auth, validateProject, checkValidations, projectController.createProject);
router.put("/:id", auth, validateProject, checkValidations, projectController.updateProject);
router.get("/", auth, projectController.getAllProjects);
router.get("/:id", auth, projectController.getProjectById);
router.patch("/archive/:id", auth, projectController.archiveProject);
router.patch("/restore/:id", auth, projectController.restoreProject);
router.delete("/:id", auth, projectController.deleteProject);

module.exports = router;