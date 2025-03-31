const { uploadFileToIPFS } = require('../utils/handleStorage');
const User = require('../models/user');

const uploadLogo = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }

    const ipfsUrl = await uploadFileToIPFS(file);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { logo: ipfsUrl },
      { new: true }
    );

    res.status(200).json({
      message: 'Logo subido correctamente',
      logo: ipfsUrl,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error al subir logo:', error.message);
    res.status(500).json({ error: 'Error al subir el logo' });
  }
};

module.exports = { uploadLogo };