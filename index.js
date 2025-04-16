const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user');
const projectRoutes = require('./routes/project'); // ⬅️ AÑADIDO AQUÍ
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./docs/swagger");

dotenv.config();  // Cargar variables de entorno

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Rutas
app.use('/api/user', userRoutes);  // Registra las rutas de usuario
app.use('/api/project', projectRoutes);  // ⬅️ AÑADIDO AQUÍ

// Conexión a la base de datos
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Arrancar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});