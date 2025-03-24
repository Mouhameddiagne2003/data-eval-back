// services/correctionService.js

const Exam = require("../exam/schema")
const Correction = require("../correction/schema")
const Grade = require("../grade/schema")
const deepSeekAI = require('../../utils/deepseek');
const { extractTextFromFile } = require('../../services/fileExtractor/fileExtractor');


const processSubmissionCorrection = async (submission, fileUrl, format) => {
    try {
        // Extraire le texte du fichier PDF
        const extractedText = await extractTextFromFile(fileUrl, format);
        console.log(`Texte extrait pour la soumission ${submission.id}`);

        // Récupérer l'examen associé
        const exam = await Exam.findByPk(submission.examId);
        if (!exam) {
            console.error(`Examen associé non trouvé pour la soumission ${submission.id}`);
            return false;
        }

        // Récupérer la correction associée à l'examen
        const correction = await Correction.findOne({ where: { examId: submission.examId } });
        if (!correction) {
            console.error(`Correction de référence non trouvée pour l'examen ${submission.examId}`);
            return false;
        }

        console.log(`Envoi à DeepSeek pour la soumission ${submission.id}`);

        // DeepSeek compare la soumission avec la correction de l'examen
        const { score, feedback, is_correct, suggestions } = await deepSeekAI.gradeSubmission(
            extractedText,
            correction.content
        );

        console.log(`Résultats de DeepSeek reçus pour la soumission ${submission.id}. Score: ${score}`);

        // Mettre à jour le statut pour indiquer que la soumission a été corrigée
        submission.status = 'graded';
        await submission.save();

        // Enregistrer la note dans `Grades`
        await Grade.create({
            submissionId: submission.id,
            professorId: exam.professorId,
            score,
            feedback,
            is_correct,
            suggestions
        });

        console.log(`Correction enregistrée pour la soumission ${submission.id}`);

        // Si vous avez configuré socket.io, vous pourriez envoyer une notification ici

        return true;
    } catch (error) {
        console.error(`Erreur dans processSubmissionCorrection pour ${submission.id}:`, error);
        return false;
    }
};

module.exports = {
    processSubmissionCorrection
};