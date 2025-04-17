const DeliveryNote = require('../models/deliveryNote');
const Project = require('../models/project');
const Client = require('../models/client');
const User = require('../models/user');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { uploadToIPFS } = require('../utils/handleIPFS');

exports.createNote = async (req, res) => {
  try {
    const note = await DeliveryNote.create({
      ...req.body,
      createdBy: req.user.id,
      company: req.user.company
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear albarán' });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const notes = await DeliveryNote.find({
      $or: [{ createdBy: req.user.id }, { company: req.user.company }],
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener albaranes' });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const note = await DeliveryNote.findOne({ _id: req.params.id })
      .populate('createdBy')
      .populate('client')
      .populate('project');
    if (!note) return res.status(404).json({ message: 'No encontrado' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener albarán' });
  }
};

exports.generatePDF = async (req, res) => {
  try {
    const note = await DeliveryNote.findById(req.params.id)
      .populate('project client createdBy');

    if (!note) return res.status(404).json({ message: 'No encontrado' });

    // Verificación de permisos
    if (note.createdBy._id.toString() !== req.user.id) {
      const user = await User.findById(req.user.id);
      if (user.role !== 'guest' || user.invitedBy?.toString() !== note.createdBy._id.toString()) {
        return res.status(403).json({ message: 'No autorizado' });
      }
    }

    const filename = `albaran-${note._id}.pdf`;
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
    const filepath = path.join(publicDir, filename);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(filepath));

    // Estilo encabezado
    doc.fontSize(20).text(`Albarán de Proyecto`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12)
      .text(`Fecha: ${new Date(note.date).toLocaleDateString()}`)
      .text(`Proyecto: ${note.project.name}`)
      .text(`Cliente: ${note.client.name}`)
      .text(`Creado por: ${note.createdBy.email}`)
      .moveDown();

    doc.fontSize(14).text(`Detalle:`).moveDown(0.5);
    note.data.forEach((item, i) => {
      doc.fontSize(12).text(`${i + 1}.`);
      if (item.person) doc.text(`   - Persona: ${item.person}`);
      if (item.hours) doc.text(`   - Horas: ${item.hours}`);
      if (item.material) doc.text(`   - Material: ${item.material}`);
      if (item.quantity) doc.text(`   - Cantidad: ${item.quantity}`);
      doc.moveDown(0.5);
    });

    if (note.signed && note.signatureUrl) {
      doc.moveDown().text(`Firmado ✓`, { continued: true });
      doc.text(` (ver firma: ${note.signatureUrl})`, {
        link: note.signatureUrl,
        underline: true
      });
    }

    doc.end();
    doc.on('finish', () => {
      res.download(filepath, (err) => {
        if (!err) fs.unlinkSync(filepath);
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al generar PDF' });
  }
};

exports.signNote = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Firma requerida' });
    const image = await uploadToIPFS(req.file);

    const note = await DeliveryNote.findByIdAndUpdate(
      req.params.id,
      {
        signed: true,
        signatureUrl: image.url,
      },
      { new: true }
    );

    res.json({ message: 'Firmado', note });
  } catch (err) {
    res.status(500).json({ message: 'Error al firmar albarán' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await DeliveryNote.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'No encontrado' });
    if (note.signed) return res.status(400).json({ message: 'No se puede eliminar firmado' });
    await DeliveryNote.findByIdAndDelete(req.params.id);
    res.json({ message: 'Albarán eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar albarán' });
  }
};