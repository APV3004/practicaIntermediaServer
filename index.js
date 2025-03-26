const dotenv = require('dotenv');
dotenv.config();  // Carga las variables desde el archivo .env

const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');  // Rutas de usuarios

const app = express();

// Middleware para analizar el cuerpo de la solicitud como JSON
app.use(express.json());

// Usar las rutas definidas en routes/user.js
app.use('/api/user', userRoutes);

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Iniciar el servidor en el puerto definido
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});