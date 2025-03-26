const fs = require('fs');
const path = require('path');

const saveFile = (file) => {
  const filePath = path.join(__dirname, '../uploads', file.name);
  file.mv(filePath, (err) => {
    if (err) {
      throw new Error('Error al guardar el archivo');
    }
  });
  return filePath;
};

module.exports = { saveFile };