// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./docs/swagger");

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Rutas
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const storageRoutes = require('./routes/storage');

app.use('/api/user', userRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/storage', storageRoutes);

module.exports = app;