const express = require('express');
const { getAllUsers, getUserById, updateUser, deleteUser, validateProfessor, getUserByEmail} = require('./controller');
const { verifyToken, isAdmin } = require('../../middleware/auth');

const router = express.Router();

// 📌 Récupérer tous les utilisateurs (ADMIN uniquement)
router.get('/', verifyToken, isAdmin, getAllUsers);

// 📌 Récupérer un utilisateur par ID
router.get('/:id', verifyToken, getUserById);

// 📌 Mettre à jour un utilisateur
router.put('/:id', verifyToken, updateUser);

// 📌 Supprimer un utilisateur (ADMIN uniquement)
router.delete('/:id', verifyToken, isAdmin, deleteUser);

router.put("/validate/:id", verifyToken, isAdmin, validateProfessor);


module.exports = router;
