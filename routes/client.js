// routes/client.js
const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const clientController = require("../controllers/client");
const { validateClient } = require("../validators/client");
const { validationResult } = require("express-validator");

const checkValidations = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.post("/", auth, validateClient, checkValidations, clientController.createClient);
router.put("/:id", auth, validateClient, checkValidations, clientController.updateClient);
router.get("/", auth, clientController.getAllClients);
router.get("/:id", auth, clientController.getClientById);
router.patch("/archive/:id", auth, clientController.archiveClient);
router.patch("/restore/:id", auth, clientController.restoreClient);
router.delete("/:id", auth, clientController.deleteClient);

module.exports = router;