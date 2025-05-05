const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morganBody = require('morgan-body');
const loggerStream = require('./utils/handleLogger');

const userRoutes = require('./routes/user');
const projectRoutes = require('./routes/project');
const mailRoutes = require('./routes/mail');
const deliveryNoteRoutes = require('./routes/deliveryNote');
const clientRoutes = require('./routes/client');

const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./docs/swagger");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logger a Slack para errores 4XX y 5XX
morganBody(app, {
  noColors: true,
  skip: function (req, res) {
    return res.statusCode < 400;
  },
  stream: loggerStream,
});

// Documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Rutas
app.use('/api/user', userRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/deliverynote', deliveryNoteRoutes);
app.use('/api/client', clientRoutes);

// Exportar app para testing
module.exports = app;