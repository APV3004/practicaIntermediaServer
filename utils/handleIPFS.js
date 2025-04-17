// utils/handleIPFS.js
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

const uploadToIPFS = async (file) => {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(file.path));

  try {
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxBodyLength: 'Infinity',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY
      },
    });

    return {
      url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
    };
  } catch (err) {
    console.error('Error subiendo a IPFS:', err.response?.data || err.message);
    throw new Error('No se pudo subir a IPFS');
  }
};

module.exports = { uploadToIPFS };