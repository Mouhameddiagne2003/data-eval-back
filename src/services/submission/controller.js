const Correction = require("../correction/schema");
const deepSeekAI = require("../../utils/deepseek");
const {errorHandler} = require("../../utils/errorHandler");
const Submission = require("./schema")
const Exam = require("../exam/schema")
const Grade = require("../grade/schema")
const {extractTextFromFile} = require("../fileExtractor/fileExtractor");

// const createSubmission = async (req, res, next) => {
//     try {
//         const { examId, content } = req.body;
//         const studentId = req.user.id;
//
//         const exam = await Exam.findByPk(examId);
//         if (!exam) return next(errorHandler(404, "Examen non trouvé"));
//
//         const correction = await Correction.findOne({ where: { examId } });
//         if (!correction) return next(errorHandler(500, "Correction non trouvée"));
//
//         // 🔥 DeepSeek compare la soumission avec la correction de l'examen
//         const { score, feedback, is_correct, suggestions } = await deepSeekAI.gradeSubmission(content, correction.content);
//
//         const submission = await Submission.create({
//             studentId,
//             examId,
//             content,
//         });
//
//         // 🔥 Enregistrer la note dans `Grades`
//         await Grade.create({
//             submissionId: submission.id,
//             professorId: exam.professorId,
//             score,
//             feedback,
//             is_correct,
//             suggestions
//         });
//
//         res.status(201).json({ message: "Soumission corrigée automatiquement", submission });
//     } catch (error) {
//         next(errorHandler(500, "Erreur lors de la soumission"));
//     }
// };
//
// //L’étudiant peut modifier sa soumission uniquement si l examen concerne est tjrs en cours
// const updateSubmission = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const { content } = req.body;
//
//         const submission = await Submission.findByPk(id);
//         if (!submission) return next(errorHandler(404, "Soumission non trouvée"));
//
//         await submission.update({ content });
//
//         res.status(200).json({ message: "Soumission mise à jour", submission });
//     } catch (error) {
//         next(errorHandler(500, "Erreur lors de la modification"));
//     }
// };


const createSubmission = async (req, res, next) => {
    try {
        const { examId, content } = req.body;
        const studentId = req.user.id;

        const exam = await Exam.findByPk(examId);
        if (!exam) return next(errorHandler(404, "Examen non trouvé"));

        // Vérifier si une soumission existe déjà pour cet étudiant et cet examen
        let submission = await Submission.findOne({
            where: {
                studentId,
                examId
            }
        });

        // Si la soumission existe, mettre à jour son contenu
        const extractedText = await extractTextFromFile(content, req.file.mimetype);
        if (submission) {
            await submission.update({
                extractedText,
                status: 'submitted'
            });
        }

        const correction = await Correction.findOne({ where: { examId } });
        if (!correction) return next(errorHandler(500, "Correction non trouvée"));

        // DeepSeek compare la soumission avec la correction de l'examen
        const { score, feedback, is_correct, suggestions } = await deepSeekAI.gradeSubmission(extractedText, correction.content);

        // Enregistrer la note dans `Grades`
        await Grade.create({
            submissionId: submission.id,
            professorId: exam.professorId,
            score,
            feedback,
            is_correct,
            suggestions
        });

        res.status(201).json({ message: "Soumission corrigée automatiquement", submission });
    } catch (error) {
        next(errorHandler(500, "Erreur lors de la soumission"));
    }
};

// L'étudiant peut modifier sa soumission uniquement si l'examen concerné est toujours en cours
const updateSubmission = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const submission = await Submission.findByPk(id, {
            include: [{ model: Exam }]
        });

        if (!submission) return next(errorHandler(404, "Soumission non trouvée"));

        // Vérifier si l'examen est toujours en cours
        const now = new Date();
        if (new Date(submission.Exam.deadline) < now) {
            return next(errorHandler(403, "Impossible de modifier la soumission, l'examen est terminé"));
        }

        await submission.update({
            content,
            status: 'submitted'  // Mise à jour du statut
        });

        res.status(200).json({ message: "Soumission mise à jour", submission });
    } catch (error) {
        next(errorHandler(500, "Erreur lors de la modification"));
    }
};

const deleteSubmission = async (req, res, next) => {
    try {
        const { id } = req.params;

        const submission = await Submission.findByPk(id);
        if (!submission) return next(errorHandler(404, "Soumission non trouvée"));

        await submission.destroy();
        res.status(200).json({ message: "Soumission supprimée" });
    } catch (error) {
        next(errorHandler(500, "Erreur lors de la suppression"));
    }
};

//L’étudiant peut voir toutes ses soumissions
const getStudentSubmissions = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const submissions = await Submission.findAll({ where: { studentId } });

        res.status(200).json(submissions);
    } catch (error) {
        next(errorHandler(500, "Erreur lors de la récupération des soumissions"));
    }
};

const getSubmissionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const submission = await Submission.findByPk(id);
        if (!submission) return next(errorHandler(404, "Soumission non trouvée"));

        res.status(200).json(submission);
    } catch (error) {
        next(errorHandler(500, "Erreur lors de la récupération de la soumission"));
    }
};

//professeur peut voir toutes les soumissions d un de ses exmanes
const getExamSubmissions = async (req, res, next) => {
    try {
        const { id } = req.params;
        const submissions = await Submission.findAll({ where: { examId: id } });

        res.status(200).json(submissions);
    } catch (error) {
        next(errorHandler(500, "Erreur lors de la récupération des soumissions"));
    }
};


const getAvailableExamsForStudent = async (req, res, next) => {
    try {
        const studentId = req.user.id; // 🔥 ID de l’étudiant connecté

        // Récupérer les soumissions "assigned" de cet étudiant
        const pendingSubmissions = await Submission.findAll({
            where: { studentId, status: "assigned" },
            include: [
                {
                    model: Exam,
                    as: "exam",
                    attributes: ["id", "title", "content", "deadline","fileUrl"], // 📌 On ne récupère que l'essentiel
                }
            ],
        });

        // Vérifier si l'étudiant a des examens assignés
        if (!pendingSubmissions.length) {
            return res.status(200).json([]); // Retourne une liste vide s’il n’a aucun examen en attente
        }

        // Extraire uniquement les examens des soumissions trouvées
        const availableExams = pendingSubmissions.map(submission => submission.exam);

        res.status(200).json(availableExams);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des examens disponibles :", error);
        next(errorHandler(500, "Erreur lors de la récupération des examens disponibles."));
    }
};








module.exports = { createSubmission, updateSubmission, deleteSubmission, getStudentSubmissions, getSubmissionById, getExamSubmissions, getAvailableExamsForStudent};


