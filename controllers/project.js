// controllers/project.js
const Project = require("../models/project");

exports.createProject = async (req, res) => {
  const { name, description, client } = req.body;
  const userId = req.user.id;
  const companyId = req.user.company;

  try {
    const existing = await Project.findOne({ name, createdBy: userId });
    if (existing) return res.status(400).json({ message: "Ya existe un proyecto con ese nombre." });

    const project = new Project({ name, description, client, createdBy: userId, company: companyId });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: "Error al crear proyecto" });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ message: "Proyecto no encontrado" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar proyecto" });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      archived: false,
      $or: [{ createdBy: req.user.id }, { company: req.user.company }]
    }).populate("client");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener proyectos" });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [{ createdBy: req.user.id }, { company: req.user.company }]
    }).populate("client");

    if (!project) return res.status(404).json({ message: "Proyecto no encontrado" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener proyecto" });
  }
};

// controllers/project.js

exports.archiveProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id  // Asegura que solo el creador pueda archivarlo
      },
      { archived: true },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado o no autorizado" });
    }

    res.json({ message: "Proyecto archivado", project });
  } catch (err) {
    res.status(500).json({ message: "Error al archivar proyecto" });
  }
};

exports.restoreProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id  // Igual que archivar
      },
      { archived: false },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado o no autorizado" });
    }

    res.json({ message: "Proyecto restaurado", project });
  } catch (err) {
    res.status(500).json({ message: "Error al restaurar proyecto" });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Proyecto no encontrado" });
    res.json({ message: "Proyecto eliminado definitivamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar proyecto" });
  }
};