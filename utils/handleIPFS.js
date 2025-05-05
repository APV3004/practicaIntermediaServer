// utils/handleIPFS.js
const axios = require('axios');
const FormData = require('form-data');

const PINATA_JWT = process.env.PINATA_JWT;

const uploadToIPFS = async (fileBuffer, originalName) => {
  const formData = new FormData();
  formData.append('file', fileBuffer, originalName);

  try {
    const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxBodyLength: 'Infinity',
      headers: {
        ...formData.getHeaders(),
        Authorization: PINATA_JWT,
      },
    });

    return {
      url: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`,
    };
  } catch (err) {
    console.error('Error subiendo a IPFS:', err.response?.data || err.message);
    throw new Error('No se pudo subir a IPFS');
  }
};

module.exports = { uploadToIPFS };