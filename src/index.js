require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require('../models');
const authRoutes = require('./services/auth/routes');
const userRoutes = require('./services/users/routes');
const examRoutes = require('./services/exam/routes');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { initEdgeStore } = require('@edgestore/server');
const { createEdgeStoreExpressHandler } = require('@edgestore/server/adapters/express');
//const morgan = require("morgan");
//const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(bodyParser.json());
//app.use(morgan("dev"));

// Initialisation d'Edge Store
const es = initEdgeStore.create();
const edgeStoreRouter = es.router({
    publicFiles: es.fileBucket(),
});
// export type EdgeStoreRouter = typeof edgeStoreRouter;
const handler = createEdgeStoreExpressHandler({ router: edgeStoreRouter });



app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exam', examRoutes);



// Route de test
app.get("/", (req, res) => {
    res.send("🚀 Hello Boyyy --- API en ligne !");
});

// Synchronisation avec la base de données
sequelize.sync() // Utiliser `alter: true` en dev pour ajuster sans perdre les données
    .then(() => console.log('Base de données synchronisée'))
    .catch((err) => console.error('Erreur de synchronisation:', err));

// Routes Edge Store
app.get("/edgestore/*", handler);
app.post("/edgestore/*", handler);

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});


