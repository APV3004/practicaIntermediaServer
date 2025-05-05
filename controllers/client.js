// controllers/client.js
const Client = require("../models/client");

// Crear cliente
exports.createClient = async (req, res) => {
  const { name, email, phone, address, contactPerson } = req.body;
  const userId = req.user.id;
  const companyId = req.user.company;

  try {
    const existing = await Client.findOne({ name, createdBy: userId });
    if (existing) {
      return res.status(400).json({ message: "Cliente ya creado por este usuario" });
    }

    const client = new Client({
      name,
      email,
      phone,
      address,
      contactPerson,
      createdBy: userId,
      company: companyId,
    });

    await client.save();
    res.status(201).json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear cliente" });
  }
};

// Actualizar cliente
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id
      },
      req.body,
      { new: true }
    );
    if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar cliente" });
  }
};

// Obtener todos los clientes
exports.getAllClients = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.company;

    const clients = await Client.find({
      archived: false,
      $or: [
        { createdBy: userId },
        { company: companyId }
      ]
    });

    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener clientes" });
  }
};

// Obtener cliente por ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user.id },
        { company: req.user.company }
      ]
    });

    if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener cliente" });
  }
};

// Archivar cliente (soft delete)
exports.archiveClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id,
        archived: false
      },
      { archived: true },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado o ya archivado" });
    }

    res.status(200).json({
      message: "Cliente archivado correctamente",
      client
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al archivar cliente" });
  }
};

// Restaurar cliente
exports.restoreClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id,
        archived: true
      },
      { archived: false },
      { new: true }
    );
    if (!client) return res.status(404).json({ message: "Cliente no encontrado o no archivado" });
    res.json({ message: "Cliente restaurado", client });
  } catch (err) {
    res.status(500).json({ message: "Error al restaurar cliente" });
  }
};

// Borrado definitivo
exports.deleteClient = async (req, res) => {
  try {
    const deleted = await Client.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });
    if (!deleted) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json({ message: "Cliente eliminado definitivamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar cliente" });
  }
};