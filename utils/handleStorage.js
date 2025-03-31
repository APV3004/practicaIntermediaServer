const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const uploadFileToIPFS = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype
    });

    console.log('Enviando a Pinata con JWT:', process.env.PINATA_JWT?.slice(0, 10)); // corto por seguridad

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.PINATA_JWT}`
        }
      }
    );

    console.log('Respuesta de Pinata:', response.data);

    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Error al subir a IPFS:', error.response?.data || error.message);
    throw new Error('Fallo al subir a IPFS');
  }
};

module.exports = { uploadFileToIPFS };