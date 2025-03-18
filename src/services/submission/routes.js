const express = require("express");
const {
    createSubmission,
    updateSubmission,
    deleteSubmission,
    getStudentSubmissions,
    getSubmissionById,
    getExamSubmissions, getAvailableExamsForStudent
} = require("./controller");

const { verifyToken, isProfessor, isStudent } = require("../../middleware/auth");

const router = express.Router();

// 📌 Soumettre un examen (DeepSeek corrige automatiquement)
router.post("/", verifyToken, isStudent, createSubmission);

// 📌 Modifier une soumission (Avant la date limite)
router.put("/:id", verifyToken, isStudent, updateSubmission);

// 📌 Supprimer une soumission (Avant la date limite)
router.delete("/:id", verifyToken, isStudent, deleteSubmission);

// 📌 Voir ses soumissions
router.get("/", verifyToken, isStudent, getStudentSubmissions);

// 🔥 Récupérer les examens disponibles pour un étudiant
router.get("/assigned", verifyToken, isStudent, getAvailableExamsForStudent)

// 📌 Voir une soumission spécifique
router.get("/:id", verifyToken, isStudent, getSubmissionById);

// 📌 Voir toutes les soumissions d’un examen (Professeur)
router.get("/exam/:id", verifyToken, isProfessor, getExamSubmissions);


module.exports = router;
