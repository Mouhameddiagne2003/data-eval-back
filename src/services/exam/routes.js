const express = require("express");
const { createExam, getAllExams, getExamById, updateExam, deleteExam } = require("./controller");
const { validateExam } = require("./validation");
const { verifyToken, isAdmin, isProfessor } = require("../../middleware/auth");

const router = express.Router();

// 📌 Créer un examen (Professeur uniquement)
router.post("/", verifyToken, isProfessor, validateExam, createExam);

// 📌 Voir tous les examens d'un professeur
router.get("/", verifyToken, isProfessor, getAllExams);

// 📌 Voir tous les examens (Admin uniquement)
router.get("/all", verifyToken, isAdmin, getAllExams);

// 📌 Voir un examen spécifique
router.get("/:id", verifyToken, getExamById);

// 📌 Modifier un examen (Professeur uniquement)
router.put("/:id", verifyToken, isProfessor, validateExam, updateExam);

// 📌 Supprimer un examen (Professeur uniquement)
router.delete("/:id", verifyToken, isProfessor, deleteExam);

module.exports = router;
