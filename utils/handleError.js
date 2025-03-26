const handleError = (err, res) => {
    console.error(err);
    res.status(500).json({ message: 'Ocurrió un error' });
  };
  
  module.exports = handleError;