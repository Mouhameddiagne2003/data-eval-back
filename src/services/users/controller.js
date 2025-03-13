const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../auth/shema');
const { errorHandler } = require("../../utils/errorHandler");


const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        res.status(200).json(users);
    } catch (error) {
        next(errorHandler(500, "Erreur lors de la récupération des utilisateurs"));
    }
};

// 📌 Récupérer un utilisateur par ID
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
        if (!user) return next(errorHandler(404, "Utilisateur non trouvé"));
        res.status(200).json(user);
    } catch (error) {
        next(errorHandler(500, "Erreur lors de la récupération de l'utilisateur"));
    }
};

// 📌 Supprimer un utilisateur
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return next(errorHandler(404, "Utilisateur non trouvé"));

        await user.destroy();
        res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        next(errorHandler(500, "Erreur lors de la suppression de l'utilisateur"));
    }
};

// 📌 Mettre à jour un utilisateur (y compris le mot de passe)
const updateUser = async (req, res, next) => {
    try {
        const { prenom, nom, email, password } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findByPk(req.params.id);
        if (!user) return next(errorHandler(404, "Utilisateur non trouvé"));

        // Préparer les données de mise à jour
        let updatedData = { prenom, nom, email };

        // Si un nouveau mot de passe est fourni, on le hache avant de l'enregistrer
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedData.password = hashedPassword;
        }

        // Mettre à jour l'utilisateur
        await user.update(updatedData);

        res.status(200).json({ message: "Utilisateur mis à jour avec succès", user });
    } catch (error) {
        next(errorHandler(500, "Erreur lors de la mise à jour de l'utilisateur"));
    }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };