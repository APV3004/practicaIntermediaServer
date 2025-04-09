// controllers/client.js
const Client = require("../models/client");

exports.createClient = async (req, res) => {
  const { name, email, phone, address } = req.body;
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

exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar cliente" });
  }
};

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

exports.archiveClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { new: true }
    );
    if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json({ message: "Cliente archivado", client });
  } catch (err) {
    res.status(500).json({ message: "Error al archivar cliente" });
  }
};

exports.restoreClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { archived: false },
      { new: true }
    );
    if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json({ message: "Cliente restaurado", client });
  } catch (err) {
    res.status(500).json({ message: "Error al restaurar cliente" });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const deleted = await Client.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json({ message: "Cliente eliminado definitivamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar cliente" });
  }
};