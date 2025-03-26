const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Rutas
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const storageRoutes = require('./routes/storage');

// Usar las rutas
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/storage', storageRoutes);

module.exports = app;