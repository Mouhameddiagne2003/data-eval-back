require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require('../models');
const authRoutes = require('./services/auth/routes');
const userRoutes = require('./services/users/routes');
//const morgan = require("morgan");
//const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
//app.use(morgan("dev"));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);



// Route de test
app.get("/", (req, res) => {
    res.send("🚀 Hello Boyyy --- API en ligne !");
});

// Synchronisation avec la base de données
sequelize.sync() // Utiliser `alter: true` en dev pour ajuster sans perdre les données
    .then(() => console.log('Base de données synchronisée'))
    .catch((err) => console.error('Erreur de synchronisation:', err));



// Lancer le serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});


