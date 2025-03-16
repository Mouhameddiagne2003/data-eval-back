const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const marked = require('marked');
const sanitizeHtml = require("sanitize-html");

// Extraction de texte depuis un PDF
const extractTextFromPDF = async (filePath) => {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
};

// Extraction de texte depuis un fichier LaTeX
const extractTextFromLaTeX = async (filePath) => {
    const data = await fs.readFile(filePath, 'utf8');
    // Simplification basique pour extraire le texte de LaTeX
    // Cette approche est simplifiée et peut nécessiter une bibliothèque plus sophistiquée
    let text = data;

    // Supprimer les commandes LaTeX courantes
    text = text.replace(/\\[a-zA-Z]+(\{[^}]*\})?/g, ' ');

    // Supprimer les environnements
    text = text.replace(/\\begin\{[^}]*\}([\s\S]*?)\\end\{[^}]*\}/g, '$1');

    // Nettoyer les accolades restantes et autres symboles spéciaux
    text = text.replace(/\{|\}|\\|\$/g, ' ');

    // Nettoyer les espaces multiples
    text = text.replace(/\s+/g, ' ').trim();

    return text;
};

// Extraction de texte depuis un fichier Markdown
const extractTextFromMarkdown = async (filePath) => {
    try {
        // Lire le fichier Markdown
        const data = await fs.readFile(filePath, 'utf8');

        // Convertir Markdown en HTML
        const html = marked.parse(data);

        // Supprimer les balises HTML avec sanitize-html
        const text = sanitizeHtml(html, {
            allowedTags: [], // Aucune balise n'est autorisée (tout est supprimé)
            allowedAttributes: {}, // Aucun attribut n'est autorisé
        });

        return text;
    } catch (error) {
        console.error("Erreur lors de l'extraction du texte Markdown:", error);
        throw new Error("Impossible d'extraire le texte du fichier Markdown");
    }
};

module.exports = {extractTextFromPDF, extractTextFromLaTeX, extractTextFromMarkdown};