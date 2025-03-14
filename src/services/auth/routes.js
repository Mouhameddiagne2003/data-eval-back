const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Utilisateur = require('./schema');
const router = express.Router();

router.post('/inscription', async (req, res) => {
  const { nom_utilisateur, email, mot_de_passe, role, description } = req.body;

  // Validation des données
  if (!nom_utilisateur || !email || !mot_de_passe || !role) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    // Hachage du mot de passe
    const motDePasseHache = await bcrypt.hash(mot_de_passe, 10);
    
    // Création de l'utilisateur
    const utilisateur = await Utilisateur.create({
      nom_utilisateur,
      email,
      mot_de_passe: motDePasseHache,
      role,
      description,
    });

    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error });
  }
});

// Connexion de l'utilisateur
router.post('/connexion', async (req, res) => {
    const { email, mot_de_passe } = req.body;
  
    if (!email || !mot_de_passe) {
      return res.status(400).json({ message: 'Email et mot de passe sont requis' });
    }
  
    try {
      const utilisateur = await Utilisateur.findOne({ where: { email } });
  
      if (!utilisateur) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
  
      const estValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
      if (!estValide) {
        return res.status(401).json({ message: 'Mot de passe incorrect' });
      }
  
      // Génération du token JWT
      const token = jwt.sign({ id: utilisateur.id, role: utilisateur.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la connexion', error });
    }
  });

// Mise à jour des informations de l'utilisateur
router.put('/profil', async (req, res) => {
    const { id_utilisateur, description } = req.body;
  
    try {
      const utilisateur = await Utilisateur.findByPk(id_utilisateur);
      if (!utilisateur) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
  
      utilisateur.description = description || utilisateur.description;
      await utilisateur.save();
  
      res.json({ message: 'Profil mis à jour avec succès' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour du profil', error });
    }
});

// Suppression d'un utilisateur
router.delete('/utilisateur/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const utilisateur = await Utilisateur.findByPk(id);
      if (!utilisateur) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
  
      await utilisateur.destroy();
      res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error });
    }
});

module.exports = router;
