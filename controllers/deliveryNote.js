// controllers/deliveryNote.js
const DeliveryNote = require('../models/deliveryNote');
const Project = require('../models/project');
const Client = require('../models/client');
const User = require('../models/user');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
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

exports.generatePDF = async (req, res, filenameOverride) => {
  try {
    const note = await DeliveryNote.findById(req.params.id || req.body.noteId)
      .populate('project client createdBy');

    if (!note) throw new Error('Albarán no encontrado');

    const filename = filenameOverride || `albaran-${note._id}.pdf`;
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
    const filepath = path.join(publicDir, filename);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(filepath));

    doc.fontSize(20).text(`Albarán de Proyecto`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12)
      .text(`Fecha: ${new Date(note.date).toLocaleDateString()}`)
      .text(`Proyecto: ${note.project?.name || 'Proyecto desconocido'}`)
      .text(`Cliente: ${note.client?.name || 'Cliente desconocido'}`)
      .text(`Creado por: ${note.createdBy?.email || 'Usuario desconocido'}`)
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
      const signaturePath = path.join(__dirname, `../public/sign-${note._id}.png`);
      const writer = fs.createWriteStream(signaturePath);
      const response = await axios({ url: note.signatureUrl, responseType: 'stream' });
      await new Promise((resolve, reject) => {
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      doc.addPage().fontSize(16).text('FIRMA DIGITAL:', { align: 'center' });
      doc.image(signaturePath, { fit: [250, 250], align: 'center' });
      fs.unlinkSync(signaturePath);
    }

    doc.end();
    await new Promise((resolve) => doc.on('finish', resolve));

    return filepath;
  } catch (err) {
    throw err;
  }
};

exports.getPDF = async (req, res) => {
  try {
    const note = await DeliveryNote.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Albarán no encontrado' });

    if (note.pdfUrl) {
      return res.redirect(note.pdfUrl);
    }

    const filePath = await exports.generatePDF({ params: { id: req.params.id }, user: req.user });
    res.download(filePath, (err) => {
      if (!err) fs.unlinkSync(filePath);
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al generar o descargar PDF', error: err.message });
  }
};

exports.signNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const note = await DeliveryNote.findById(noteId);
    if (!note) return res.status(404).json({ message: 'Albarán no encontrado' });
    if (note.signed) return res.status(400).json({ message: 'El albarán ya está firmado' });

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No se adjuntó la firma' });
    }

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const pdfPath = path.join(tempDir, `${noteId}.pdf`);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    doc.fontSize(16).text(`Albarán #${noteId}`, { align: 'center' });
    doc.text(`Tipo: ${note.type}`);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`);
    doc.text('---');
    doc.text('Datos:');
    note.data.forEach(item => {
      doc.text(`- ${item.person || item.material}: ${item.hours || item.quantity}`);
    });
    doc.moveDown();
    doc.text('Firma del cliente:');
    doc.image(req.file.buffer, { fit: [150, 150] });

    doc.end();

    stream.on('finish', async () => {
      const fileBuffer = fs.readFileSync(pdfPath);
      const { url } = await uploadToIPFS(fileBuffer, `${noteId}.pdf`);
      fs.unlinkSync(pdfPath);

      note.signed = true;
      note.signatureUrl = url;
      note.pdfUrl = url;
      await note.save();

      res.status(200).json({ message: 'Albarán firmado correctamente', note });
    });

  } catch (err) {
    console.error("Error al firmar albarán:", err);
    res.status(500).json({ message: 'Error al firmar albarán', error: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await DeliveryNote.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'No encontrado' });
    if (note.signed) return res.status(400).json({ message: 'No se puede eliminar un albarán ya firmado' });
    await DeliveryNote.findByIdAndDelete(req.params.id);
    res.json({ message: 'Albarán eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar albarán' });
  }
};