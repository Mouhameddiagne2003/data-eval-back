const { Sequelize } = require('sequelize');
require('dotenv').config(); // Charge les variables d'environnement du fichier .env

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,     // 127.0.0.1
  port: process.env.DB_PORT || 5433,  // Utilise 5433 par défaut si DB_PORT n'est pas défini
  dialect: 'postgres'
});

module.exports = sequelize;
