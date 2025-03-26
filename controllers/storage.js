const fs = require('fs');
const path = require('path');

// Subir un archivo
exports.uploadFile = (req, res) => {
  const file = req.files.file;
  const uploadPath = path.join(__dirname, '../uploads', file.name);

  file.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error al cargar el archivo' });
    }
    res.status(200).json({ message: 'Archivo cargado correctamente', filePath: uploadPath });
  });
};

// Obtener los archivos cargados
exports.getFiles = (req, res) => {
  const files = fs.readdirSync(path.join(__dirname, '../uploads'));
  res.status(200).json({ files });
};