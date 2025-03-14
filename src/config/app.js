const express = require('express');
const app = express();
app.use(express.json()); // Pour analyser les requêtes avec des corps JSON
module.exports = app;
