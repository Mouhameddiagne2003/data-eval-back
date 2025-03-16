const Correction = require("../correction/schema");
const deepSeekAI = require("../../utils/deepseek");
const {errorHandler} = require("../../utils/errorHandler");
const {Submission} = require("./schema")
const {Exam} = require("../exam/schema")
const {Grade} = require("../grade/schema")

const createSubmission = async (req, res, next) => {
    try {
        const { examId, content } = req.body;
        const studentId = req.user.id;

        const exam = await Exam.findByPk(examId);
        if (!exam) return next(errorHandler(404, "Examen non trouvé"));

        const correction = await Correction.findOne({ where: { examId } });
        if (!correction) return next(errorHandler(500, "Correction non trouvée"));

        // 🔥 DeepSeek compare la soumission avec la correction de l'examen
        const { score, feedback, is_correct, suggestions } = await deepSeekAI.gradeSubmission(content, correction.content);

        const submission = await Submission.create({
            studentId,
            examId,
            content,
        });

        // 🔥 Enregistrer la note dans `Grades`
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

//L’étudiant peut modifier sa soumission uniquement si l examen concerne est tjrs en cours
const updateSubmission = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const submission = await Submission.findByPk(id);
        if (!submission) return next(errorHandler(404, "Soumission non trouvée"));

        await submission.update({ content });

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






module.exports = { createSubmission, updateSubmission, deleteSubmission, getStudentSubmissions, getSubmissionById, getExamSubmissions};


