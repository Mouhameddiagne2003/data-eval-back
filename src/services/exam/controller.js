const { validationResult } = require("express-validator");
const Exam = require("./schema");
const { errorHandler } = require("../../utils/errorHandler");
// const { createEdgeStoreClient } = require("@edgestore/server");
// const edgeStoreClient = createEdgeStoreClient();
const edgeStoreClient = require("../../config/edgestore");

const Correction = require("./schema");
const deepSeekAI = require("../../utils/deepseek"); // Simule l'API DeepSeek
const {extractTextFromFile} = require("../../utils/file_utils")


// 📌 Créer un examen avec un fichier (PDF, Markdown, LaTeX)
const createExam = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return next(errorHandler(400, errors.array()));

        const { title, content, deadline, format, gradingCriteria } = req.body;
        const professorId = req.user.id;

        // Vérifier si un fichier est joint
        const fileUrl = req.file ? `/uploads/exams/${req.file.filename}` : null;
        const filePath = req.file ? `./uploads/exams/${req.file.filename}` : null;
        const exam = await Exam.create({ title, content, deadline, professorId, fileUrl, format, gradingCriteria });

        if(fileUrl !== null) {
            // Extraire le texte du fichier selon son format
            const extractedText = await extractTextFromFile(filePath, req.file.mimetype);
            const correctionContent = await deepSeekAI.generateCorrection(extractedText, gradingCriteria);
            // 🔥 Stocker la correction en base
            await Correction.create({
                examId: exam.id,
                content: correctionContent,
            });

        }



        res.status(201).json({ message: "Examen créé avec succès", exam });
    } catch (error) {
        next(errorHandler(500, "Erreur lors de la création de l'examen"));
    }
};

// 📌 Voir tous les examens d’un professeur
const getAllExams = async (req, res, next) => {
    try {
        const exams = await Exam.findAll({ where: { professorId: req.user.id } });
        res.status(200).json(exams);
    } catch (error) {
        next(errorHandler(500, "Erreur lors de la récupération des examens"));
    }
};

// 📌 Voir tous les examens d’un professeur
const getAllExamsByAdmin = async (req, res, next) => {
    try {
        const exams = await Exam.findAll();
        res.status(200).json(exams);
    } catch (error) {
        next(errorHandler(500, "Erreur lors de la récupération des examens"));
    }
};

// 📌 Récupérer un examen spécifique
const getExamById = async (req, res, next) => {
    try {
        const exam = await Exam.findByPk(req.params.id);
        if (!exam) return next(errorHandler(404, "Examen non trouvé"));

        res.status(200).json(exam);
    } catch (error) {
        next(errorHandler(500, "Erreur lors de la récupération de l'examen"));
    }
};

// 📌 Mettre à jour un examen
const updateExam = async (req, res, next) => {
    try {
        const { title, content, deadline, format, gradingCriteria, fileUrl } = req.body;
        const exam = await Exam.findByPk(req.params.id);

        // Vérifier si l'examen existe
        if (!exam) return next(errorHandler(404, "Examen non trouvé"));

        // Vérifier si un fichier est joint
        //const fileUrl = req.file ? `/uploads/exams/${req.file.filename}` : exam.fileUrl;
        // 🔥 Si un fichier est uploadé, supprimer l'ancien fichier sur Edge Store
        if (req.file) {
            if (exam.fileUrl) {
                await edgeStoreClient.publicFiles.delete({ url: exam.fileUrl });
            }
            const uploadedFile = await edgeStoreClient.publicFiles.upload({ file: req.file });
            exam.fileUrl = uploadedFile.url;
        }

        // Mettre à jour l'examen avec les nouvelles données
        await exam.update({ title, content, deadline, format, gradingCriteria, fileUrl });

        res.status(200).json({ message: "Examen mis à jour avec succès", exam });
    } catch (error) {
        next(errorHandler(500, "Erreur lors de la mise à jour de l'examen"));
    }
};

// 📌 Supprimer un examen
const deleteExam = async (req, res, next) => {
    try {
        const exam = await Exam.findByPk(req.params.id);
        if (!exam) return next(errorHandler(404, "Examen non trouvé"));
        // 🔥 Supprimer le fichier Edge Store si présent
        if (exam.fileUrl) await edgeStoreClient.publicFiles.delete({ url: exam.fileUrl });

            await exam.destroy();
        res.status(200).json({ message: "Examen supprimé avec succès" });
    } catch (error) {
        next(errorHandler(500, "Erreur lors de la suppression de l'examen"));
    }
};

module.exports = { createExam, getAllExams, getExamById, updateExam, deleteExam, getAllExamsByAdmin };
