const jwt = require('jsonwebtoken');
const User = require('./schema'); // Modèle Sequelize des utilisateurs
require('dotenv').config(); // Charger les variables d'environnement

// Clé secrète JWT
const SECRET_KEY = process.env.JWT_SECRET || 'secret_key';

// Fonction pour générer un JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role }, // Payload
        SECRET_KEY, 
        { expiresIn: '24h' } // Expiration du token
    );
};

// Connexion d'un utilisateur (sans mot de passe)
exports.login = async (req, res) => {
    try {
        const { email } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        // Générer un token JWT
        const token = generateToken(user);
        return res.json({ token, user });
    } catch (error) {
        return res.status(500).json({ message: "Erreur serveur", error });
    }
};

exports.verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: "Accès refusé" });

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), SECRET_KEY);
        req.user = decoded; // Ajouter les infos du user à la requête
        next();
    } catch (error) {
        return res.status(400).json({ message: "Token invalide" });
    }
};
