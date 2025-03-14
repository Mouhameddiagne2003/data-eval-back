const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Utilisateur = sequelize.define('Utilisateur', {
  nom_utilisateur: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  mot_de_passe: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  role: {
    type: DataTypes.ENUM('enseignant', 'etudiant'),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
});

module.exports = Utilisateur;
