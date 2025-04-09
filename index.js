const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user');  // Asegúrate de que la ruta sea correcta
const swaggerUi = require("swagger-ui-express")
const swaggerSpecs = require("./docs/swagger")

dotenv.config();  // Cargar variables de entorno

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs)
 )

app.use('/api/user', userRoutes);  // Registra las rutas de usuario

// Conexión a la base de datos
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Arrancar el servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});