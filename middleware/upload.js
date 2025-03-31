const multer = require('multer');

const storage = multer.memoryStorage(); // usa memoria para enviar a IPFS
const upload = multer({ storage });

module.exports = upload;