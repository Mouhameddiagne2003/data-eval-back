const Correction = require("../correction/schema");
const deepSeekAI = require("../../utils/deepseek");
const {errorHandler} = require("../../utils/errorHandler");
const Submission = require("./schema")
const Exam = require("../exam/schema")
const Grade = require("../grade/schema")
const {extractTextFromFile} = require("../fileExtractor/fileExtractor");
const {processSubmissionCorrection} = require("../correction/correctionService");

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
// const updateSubmission = async (req, res, next) => {
//     try {
//         const { submissionId } = req.params;
//         const { fileUrl, status } = req.body;
//
//         const submission = await Submission.findByPk(submissionId);
//         if (!submission) {
//             return next(errorHandler(404, "Soumission non trouvée"));
//         }
//
//         if (submission.status === "graded") {
//             return next(errorHandler(400, "L'examen a déjà été noté, vous ne pouvez plus soumettre."));
//         }
//
//         submission.fileUrl = fileUrl || submission.fileUrl;
//         submission.status = status || submission.status;
//         await submission.save();
//
//         res.status(200).json({ message: "Soumission mise à jour avec succès", submission });
//     } catch (error) {
//         next(errorHandler(500, "Erreur lors de la mise à jour de la soumission"));
//     }
// };

const updateSubmission = async (req, res, next) => {
    try {
        const { submissionId } = req.params;
        const { fileUrl, status } = req.body;
        const submission = await Submission.findByPk(submissionId);

        if (!submission) {
            return next(errorHandler(404, "Soumission non trouvée"));
        }

        if (submission.status === "graded") {
            return next(errorHandler(400, "L'examen a déjà été noté, vous ne pouvez plus soumettre."));
        }

        // Si un nouveau fileUrl est fourni
        if (fileUrl) {
            // Mettre à jour l'URL du fichier
            // submission.fileUrl = fileUrl;

            // Changer le statut à "completed" pour indiquer que la soumission est complète
            submission.content = fileUrl;
            submission.status = "completed";
            await submission.save();

            // Répondre immédiatement au client
            res.status(200).json({
                message: "Soumission mise à jour avec succès. La correction est en cours...",
                submission
            });

            // Lancer le processus de correction en arrière-plan (asynchrone)
            console.log(`Début de la correction pour la soumission ${submissionId}`);

            // Traitement asynchrone sans attendre
            processSubmissionCorrection(submission, fileUrl)
                .then((success) => {
                    if (success) {
                        console.log(`Correction terminée pour la soumission ${submissionId}`);
                    } else {
                        console.log(`Échec de la correction pour la soumission ${submissionId}`);
                    }
                })
                .catch(error => {
                    console.error(`Erreur lors de la correction de la soumission ${submissionId}:`, error);
                });
        } else {
            // Si seulement le status est mis à jour
            submission.status = status || submission.status;
            await submission.save();
            res.status(200).json({ message: "Statut de la soumission mis à jour avec succès", submission });
        }
    } catch (error) {
        next(errorHandler(500, "Erreur lors de la mise à jour de la soumission: " + error.message));
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

const getSubmissionForStudent = async (req, res, next) => {
    try {
        const { examId, studentId } = req.query; // On récupère les paramètres depuis la requête

        if (!examId || !studentId) {
            return next(errorHandler(400, "ExamId et StudentId sont requis"));
        }

        // 🔍 Vérifier si une soumission existe pour cet étudiant et cet examen
        const submission = await Submission.findOne({
            where: { examId, studentId }
        });

        if (!submission) {
            return next(errorHandler(404, "Aucune soumission trouvée pour cet examen et cet étudiant."));
        }

        res.status(200).json(submission);
    } catch (error) {
        next(errorHandler(500, "Erreur lors de la récupération de la soumission"));
    }
};


module.exports = { createSubmission, updateSubmission, deleteSubmission, getStudentSubmissions, getSubmissionById, getExamSubmissions, getAvailableExamsForStudent, getSubmissionForStudent};


