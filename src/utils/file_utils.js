const {extractTextFromPDF, extractTextFromLaTeX, extractTextFromMarkdown} = require("../services/fileExtractor/fileExtractor")

// Fonction pour extraire le texte selon le type de fichier
const extractTextFromFile = async (filePath, mimeType) => {
    try {
        // Pour les fichiers PDF
        if (mimeType === 'application/pdf') {
            return await extractTextFromPDF(filePath);
        }
        // Pour les fichiers LaTeX
        else if (mimeType === 'application/x-tex' ||
            filePath.endsWith('.tex') ||
            filePath.endsWith('.latex')) {
            return await extractTextFromLaTeX(filePath);
        }
        // Pour les fichiers Markdown
        else if (mimeType === 'text/markdown' ||
            filePath.endsWith('.md') ||
            filePath.endsWith('.markdown')) {
            return await extractTextFromMarkdown(filePath);
        }
        else {
            throw new Error('Format de fichier non supporté');
        }
    } catch (error) {
        console.error('Erreur lors de l\'extraction du texte:', error);
        throw error;
    }
};

module.exports = {extractTextFromFile};