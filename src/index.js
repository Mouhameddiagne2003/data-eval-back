require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require('../models');
const authRoutes = require('./services/auth/routes');
const userRoutes = require('./services/users/routes');
const examRoutes = require('./services/exam/routes');
const submissionRoutes = require('./services/submission/routes');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { initEdgeStore } = require('@edgestore/server');
const { createEdgeStoreExpressHandler } = require('@edgestore/server/adapters/express');
//const morgan = require("morgan");
//const pool = require("./config/db");

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // À ajuster selon le domaine du front
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
// Par ceci:
app.use(cors({
    origin: 'http://localhost:5173', // L'URL exacte de votre frontend
    credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.json());
//app.use(morgan("dev"));

// Initialisation d'Edge Store
const es = initEdgeStore.create();
const edgeStoreRouter = es.router({
    publicFiles: es.fileBucket(),
});




app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/submission', submissionRoutes);



// Route de test
app.get("/", (req, res) => {
    res.send("🚀 Hello Boyyy --- API en ligne !");
});

// Synchronisation avec la base de données
sequelize.sync() // Utiliser `alter: true` en dev pour ajuster sans perdre les données
    .then(() => console.log('Base de données synchronisée'))
    .catch((err) => console.error('Erreur de synchronisation:', err));



// Lancer le serveur
// app.listen(PORT, () => {
//     console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
// });

io.on("connection", (socket) => {
    console.log("Nouvelle connexion WebSocket :", socket.id);

    socket.on("disconnect", () => {
        console.log("Un utilisateur s'est déconnecté");
    });
});

global.io = io; // Rendre io accessible globalement pour l'utiliser dans l'API

server.listen(PORT, () => {
    console.log("Serveur démarré sur le port 5000");
});

module.exports.io = io;


