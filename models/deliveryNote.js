const mongoose = require('mongoose');

const deliveryNoteSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  type: { type: String, enum: ['simple', 'multiple'], required: true },
  data: [{
    person: String,
    hours: Number,
    material: String,
    quantity: Number,
  }],
  date: { type: Date, default: Date.now },
  signed: { type: Boolean, default: false },
  signatureUrl: String,
  pdfUrl: String,
}, { timestamps: true });

module.exports = mongoose.model('DeliveryNote', deliveryNoteSchema);

