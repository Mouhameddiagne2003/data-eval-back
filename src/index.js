require('dotenv').config({ path: '../.env' });


const app = require('./config/app');
const authRoutes = require('./services/auth/routes');
const authMiddleware = require('./middleware/auth');

app.use('/api/auth', authRoutes);

// Routes protégées
app.use('/api/protected', authMiddleware, (req, res) => {
  res.send('Contenu protégé, accès autorisé');
});

app.listen(4000, () => {
    console.log('Serveur en écoute sur http://localhost:4000');
  });
  


const sequelize = require('./config/database');
const Utilisateur = require('./services/auth/schema');

async function init() {
  await sequelize.sync({ force: true }); // Cela va créer toutes les tables
  console.log('La base de données a été synchronisée');
}

init();

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_NAME:", process.env.DB_NAME);
