const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const PINATA_JWT = process.env.PINATA_JWT;

const uploadToIPFS = async (file) => {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(file.path));

  try {
    const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxBodyLength: 'Infinity',
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${PINATA_JWT}`
      },
    });

    return {
      url: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
    };
  } catch (err) {
    console.error('Error subiendo a IPFS:', err.response?.data || err.message);
    throw new Error('No se pudo subir a IPFS');
  }
};

module.exports = { uploadToIPFS };