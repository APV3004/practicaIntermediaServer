const jwt = require('jsonwebtoken');

// Middleware para proteger las rutas
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  // El token es de tipo 'Bearer <token>', por lo que lo dividimos
  const bearerToken = token.split(' ')[1];

  // Verificar el token JWT
  jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido' });
    }

    // Si el token es válido, guardamos los datos del usuario decodificado
    req.user = decoded;
    next();
  });
};

module.exports = authenticate;