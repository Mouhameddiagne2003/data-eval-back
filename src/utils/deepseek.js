const axios = require('axios');

// Configuration pour l'API Ollama
// const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api';
// const MODEL_NAME = process.env.DEEPSEEK_MODEL || 'deepseek-r1:1.5b';

// class DeepSeekAI {
//     constructor() {
//         this.apiUrl = OLLAMA_API_URL;
//         this.model = MODEL_NAME;
//     }
//
//     /**
//      * Envoie une requête à l'API Ollama
//      * @param {string} prompt - Le prompt à envoyer au modèle
//      * @returns {Promise<string>} - La réponse du modèle
//      */
//     async generateResponse(prompt) {
//         try {
//             const response = await axios.post(`${this.apiUrl}/generate`, {
//                 model: this.model,
//                 prompt,
//                 stream: false
//             });
//
//             return response.data.response;
//         } catch (error) {
//             console.error('Erreur lors de la communication avec Ollama:', error.message);
//             throw new Error('Échec de la communication avec le service d\'IA');
//         }
//     }


// Configuration pour OpenRouter
const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1";
const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL_NAME = process.env.DEEPSEEK_MODEL || "deepseek-coder";

class DeepSeekAI {
    constructor() {
        this.apiUrl = OPENROUTER_API_URL;
        this.model = MODEL_NAME;
    }

    /**
     * Envoie une requête à l'API OpenRouter
     * @param {string} prompt - Le prompt à envoyer au modèle
     * @returns {Promise<string>} - La réponse du modèle
     */
    async generateResponse(prompt) {
        try {
            const response = await axios.post(
                `${this.apiUrl}/chat/completions`,
                {
                    model: this.model,
                    messages: [{ role: "system", content: "Tu es un assistant intelligent pour l'évaluation d'examens SQL." },
                        { role: "user", content: prompt }]
                },
                {
                    headers: {
                        Authorization: `Bearer ${API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error("Erreur lors de la communication avec OpenRouter:", error.message);
            throw new Error("Échec de la communication avec OpenRouter.");
        }
    }

    /**
     * Génère une correction pour un examen de base de données à partir du texte extrait
     * @param {string} extractedText - Texte extrait du fichier d'examen
     * @param {string|object} gradingCriteria - Critères d'évaluation et barème fournis par le professeur
     * @returns {Promise<string>} - Contenu de la correction générée
     */
    async generateCorrection(extractedText, gradingCriteria) {
        // Transformer les critères en format string s'ils sont fournis en tant qu'objet
        let criteriaText = gradingCriteria;
        if (typeof gradingCriteria === 'object') {
            criteriaText = JSON.stringify(gradingCriteria, null, 2);
        }

        const prompt = `
Tu es un expert en bases de données chargé de générer une correction détaillée pour cet examen.
Analyse le contenu suivant qui a été extrait d'un document d'examen de base de données (SQL, modélisation, etc.), 
puis génère une correction complète et précise en respectant scrupuleusement les critères d'évaluation fournis.

CONTENU DE L'EXAMEN:
${extractedText}

CRITÈRES D'ÉVALUATION ET BARÈME:
${criteriaText}

Pour chaque exercice ou question SQL:
1. Fournis la requête SQL correcte
2. Explique la logique derrière la construction de la requête
3. Commente les points importants (jointures, groupements, conditions, etc.)
4. Si pertinent, suggère des optimisations possibles
5. Attribue des points selon le barème fourni, en justifiant l'attribution

Pour les questions de modélisation:
1. Propose un schéma relationnel correct
2. Explique les choix de conception (clés primaires, étrangères, etc.)
3. Justifie la normalisation choisie
4. Attribue des points selon le barème fourni

Ta correction doit être structurée et formatée pour être facilement compréhensible par des étudiants.
Assure-toi de respecter rigoureusement les critères d'évaluation fournis par le professeur.
`;

        try {
            const correctionContent = await this.generateResponse(prompt);
            return correctionContent;
        } catch (error) {
            console.error('Erreur lors de la génération de la correction:', error.message);
            return "Une erreur est survenue lors de la génération de la correction automatique. Veuillez réessayer ou contacter un administrateur.";
        }
    }

    /**
     * Évalue une soumission SQL par rapport à une correction
     * @param {string} studentQuery - La requête SQL soumise par l'étudiant
     * @param {string} correctSolution - La solution correcte fournie par le professeur
     * @returns {Promise<{score: number, feedback: string}>} - Score et feedback
     */
//     async gradeSubmission(studentQuery, correctSolution) {
//         const prompt = `
// Tu es un évaluateur expert en SQL. Compare la requête de l'étudiant avec la solution correcte et évalue-la selon les critères suivants:
// 1. Syntaxe correcte
// 2. Résultat fonctionnellement équivalent
// 3. Efficacité et optimisation
// 4. Bonnes pratiques
//
// Requête de l'étudiant:
// \`\`\`sql
// ${studentQuery}
// \`\`\`
//
// Solution correcte:
// \`\`\`sql
// ${correctSolution}
// \`\`\`
//
// IMPORTANT: Ta réponse doit être UNIQUEMENT un objet JSON valide, sans texte avant ou après.
// Format exact de la réponse:
// {
//   "score": <nombre décimal entre 0 et 20>,
//   "feedback": "<texte détaillé expliquant l'évaluation>",
//   "is_correct": <true ou false>,
//   "suggestions": ["suggestion1", "suggestion2", ...]
// }
// `;
//
//         try {
//             console.log('Envoi de la requête à DeepSeek...');
//             const responseText = await this.generateResponse(prompt);
//             console.log('Réponse reçue de DeepSeek:', responseText.substring(0, 100) + '...');
//
//             try {
//                 // Tentative de parse du JSON complet
//                 const cleanedResponse = responseText.trim();
//                 console.log('Tentative de parse JSON sur:', cleanedResponse.substring(0, 100) + '...');
//
//                 const evaluation = JSON.parse(cleanedResponse);
//                 console.log('Parsing JSON réussi:', evaluation);
//
//                 // Vérification des types et valeurs
//                 if (typeof evaluation.score !== 'number') {
//                     console.error('Le score n\'est pas un nombre:', evaluation.score);
//                     evaluation.score = 0;
//                 }
//
//                 if (typeof evaluation.feedback !== 'string') {
//                     console.error('Le feedback n\'est pas une chaîne:', evaluation.feedback);
//                     evaluation.feedback = String(evaluation.feedback);
//                 }
//
//                 // Création d'un objet résultat propre
//                 const result = {
//                     score: evaluation.score,
//                     feedback: evaluation.feedback,
//                     is_correct: Boolean(evaluation.is_correct),
//                     suggestions: Array.isArray(evaluation.suggestions) ? evaluation.suggestions : []
//                 };
//
//                 console.log('Résultat final:', result);
//                 return result;
//             } catch (parseError) {
//                 console.error('Erreur de parsing JSON:', parseError.message);
//                 console.error('Réponse brute complète:', responseText);
//
//                 // Tentative d'extraction avec regex comme fallback
//                 let jsonMatch = responseText.match(/(\{[\s\S]*\})/);
//                 if (jsonMatch) {
//                     console.log('Tentative d\'extraction avec regex:', jsonMatch[0]);
//                     try {
//                         const extractedEvaluation = JSON.parse(jsonMatch[0]);
//                         console.log('Extraction réussie:', extractedEvaluation);
//
//                         return {
//                             score: typeof extractedEvaluation.score === 'number' ? extractedEvaluation.score : 0,
//                             feedback: typeof extractedEvaluation.feedback === 'string' ?
//                                 extractedEvaluation.feedback :
//                                 "Feedback extrait avec méthode alternative: " + String(extractedEvaluation.feedback),
//                             is_correct: Boolean(extractedEvaluation.is_correct),
//                             suggestions: Array.isArray(extractedEvaluation.suggestions) ?
//                                 extractedEvaluation.suggestions : []
//                         };
//                     } catch (secondParseError) {
//                         console.error('Échec de l\'extraction secondaire:', secondParseError.message);
//                     }
//                 }
//
//                 // Fallback en cas d'échec complet
//                 return {
//                     score: 0,
//                     feedback: "Erreur lors du traitement de l'évaluation. La réponse du modèle n'était pas au format attendu.",
//                     is_correct: false,
//                     suggestions: []
//                 };
//             }
//         } catch (error) {
//             console.error('Erreur lors de l\'évaluation avec DeepSeek:', error);
//             return {
//                 score: 0,
//                 feedback: "Erreur lors de l'évaluation automatique: " + error.message,
//                 is_correct: false,
//                 suggestions: []
//             };
//         }
//     }


    async gradeSubmission(studentQuery, correctSolution) {
        const prompt = `
Tu es un évaluateur expert en SQL. Compare la requête de l'étudiant avec la solution correcte et évalue-la selon les critères suivants:
1. Syntaxe correcte
2. Résultat fonctionnellement équivalent
3. Efficacité et optimisation
4. Bonnes pratiques

Requête de l'étudiant:
\`\`\`sql
${studentQuery}
\`\`\`

Solution correcte:
\`\`\`sql
${correctSolution}
\`\`\`

IMPORTANT: Ta réponse doit être UNIQUEMENT un objet JSON valide, sans texte avant ou après, sans balises <think> ou autres.
Format exact de la réponse:
{
  "score": <nombre décimal entre 0 et 20>,
  "feedback": "<texte détaillé expliquant l'évaluation>",
  "is_correct": <true ou false>,
  "suggestions": ["suggestion1", "suggestion2", ...]
}
`;

        try {
            console.log('Envoi de la requête à DeepSeek...');
            const responseText = await this.generateResponse(prompt);
            console.log('Réponse reçue de DeepSeek:', responseText.substring(0, 100) + '...');

            // Nettoyage des balises <think> et autres contenus non JSON
            const cleanResponse = responseText
                .replace(/<think>[\s\S]*?<\/think>/g, '') // Supprime les balises <think> et leur contenu
                .replace(/```json|```/g, '')             // Supprime les marqueurs de code JSON
                .trim();                                 // Supprime les espaces inutiles

            console.log('Réponse nettoyée:', cleanResponse.substring(0, 100) + '...');

            try {
                // Tentative de parse du JSON nettoyé
                const evaluation = JSON.parse(cleanResponse);
                console.log('Parsing JSON réussi:', evaluation);

                // Vérification et normalisation des données
                const result = {
                    score: typeof evaluation.score === 'number' ? evaluation.score : 0,
                    feedback: typeof evaluation.feedback === 'string' ?
                        evaluation.feedback : String(evaluation.feedback),
                    is_correct: Boolean(evaluation.is_correct),
                    suggestions: Array.isArray(evaluation.suggestions) ? evaluation.suggestions : []
                };

                console.log('Résultat final:', result);
                return result;
            } catch (parseError) {
                console.error('Erreur de parsing JSON après nettoyage:', parseError.message);

                // Extraction avec regex comme fallback
                const jsonRegexPatterns = [
                    /(\{[\s\S]*\})/,           // Regex standard pour capturer le JSON complet
                    /```json([\s\S]*?)```/,     // Capture le JSON entre les backticks markdown
                    /\{[\s\S]*?"score"[\s\S]*?\}/  // Capture un objet JSON contenant "score"
                ];

                for (const pattern of jsonRegexPatterns) {
                    const match = responseText.match(pattern);
                    if (match) {
                        const potentialJson = match[1] || match[0];
                        console.log('Tentative d\'extraction avec regex:', potentialJson.substring(0, 100) + '...');

                        try {
                            const extractedEvaluation = JSON.parse(potentialJson.trim());
                            console.log('Extraction réussie:', extractedEvaluation);

                            return {
                                score: typeof extractedEvaluation.score === 'number' ? extractedEvaluation.score : 0,
                                feedback: typeof extractedEvaluation.feedback === 'string' ?
                                    extractedEvaluation.feedback : String(extractedEvaluation.feedback),
                                is_correct: Boolean(extractedEvaluation.is_correct),
                                suggestions: Array.isArray(extractedEvaluation.suggestions) ?
                                    extractedEvaluation.suggestions : []
                            };
                        } catch (secondParseError) {
                            console.error('Échec de l\'extraction avec pattern:', secondParseError.message);
                            // Continue avec le prochain pattern
                        }
                    }
                }

                // Dernier recours : recherche de structure JSON partielle
                const scoreMatch = responseText.match(/"score"\s*:\s*(\d+\.?\d*)/);
                const feedbackMatch = responseText.match(/"feedback"\s*:\s*"([^"]+)"/);
                const isCorrectMatch = responseText.match(/"is_correct"\s*:\s*(true|false)/);

                if (scoreMatch) {
                    console.log('Extraction partielle réussie avec score:', scoreMatch[1]);
                    return {
                        score: parseFloat(scoreMatch[1]),
                        feedback: feedbackMatch ? feedbackMatch[1] : "Feedback extrait partiellement",
                        is_correct: isCorrectMatch ? isCorrectMatch[1] === 'true' : false,
                        suggestions: []
                    };
                }

                // Fallback en cas d'échec complet
                console.error('Tous les essais de parsing ont échoué');
                return {
                    score: 0,
                    feedback: "Erreur lors du traitement de l'évaluation. La réponse du modèle n'était pas au format JSON attendu.",
                    is_correct: false,
                    suggestions: []
                };
            }
        } catch (error) {
            console.error('Erreur lors de l\'évaluation avec DeepSeek:', error);
            return {
                score: 0,
                feedback: "Erreur lors de l'évaluation automatique: " + error.message,
                is_correct: false,
                suggestions: []
            };
        }
    }

    /**
     * Compare les résultats d'exécution de deux requêtes SQL
     * @param {object} studentResult - Le résultat de l'exécution de la requête de l'étudiant
     * @param {object} expectedResult - Le résultat attendu
     * @returns {Promise<{similarity: number, analysis: string}>} - Analyse de similarité
     */
    async compareExecutionResults(studentResult, expectedResult) {
        const prompt = `
Tu es un expert en SQL chargé de comparer les résultats d'exécution de deux requêtes.

Résultat de l'étudiant:
${JSON.stringify(studentResult, null, 2)}

Résultat attendu:
${JSON.stringify(expectedResult, null, 2)}

Compare les deux résultats et fournit:
1. Un pourcentage de similarité entre 0 et 100
2. Une analyse des différences 
3. Pourquoi ces différences sont importantes ou non

Format de réponse:
{
  "similarity": <nombre entre 0 et 100>,
  "analysis": "<analyse détaillée>",
  "key_differences": ["différence1", "différence2", ...]
}
`;

        try {
            const responseText = await this.generateResponse(prompt);

            // Extraction du JSON de la réponse
            let jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                return {
                    similarity: 0,
                    analysis: "Erreur d'analyse. Format de réponse incorrect.",
                    key_differences: []
                };
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Erreur lors de la comparaison des résultats:', error.message);
            return {
                similarity: 0,
                analysis: "Erreur lors de la comparaison des résultats d'exécution.",
                key_differences: []
            };
        }
    }

    /**
     * Génère des indices pour aider l'étudiant lorsqu'il est bloqué
     * @param {string} exerciseDescription - Description de l'exercice
     * @param {string} studentAttempt - Tentative actuelle de l'étudiant (peut être vide)
     * @returns {Promise<{hints: string[]}>} - Liste d'indices
     */
    async generateHints(exerciseDescription, studentAttempt = "") {
        const prompt = `
En tant que professeur de SQL, génère 3 indices progressifs pour aider un étudiant bloqué sur cet exercice:

Description de l'exercice:
${exerciseDescription}

${studentAttempt ? `Tentative actuelle de l'étudiant:
\`\`\`sql
${studentAttempt}
\`\`\`
` : 'L\'étudiant n\'a pas encore fait de tentative.'}

Fournit 3 indices:
- Un premier indice subtil qui oriente vers la bonne direction
- Un deuxième indice plus explicite sur l'approche à prendre
- Un troisième indice très spécifique qui donne presque la solution

Format de réponse:
{
  "hints": [
    "<indice1>",
    "<indice2>",
    "<indice3>"
  ]
}
`;

        try {
            const responseText = await this.generateResponse(prompt);

            // Extraction du JSON de la réponse
            let jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                return {
                    hints: ["Désolé, impossible de générer des indices pour le moment."]
                };
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Erreur lors de la génération d\'indices:', error.message);
            return {
                hints: ["Désolé, une erreur est survenue lors de la génération d'indices."]
            };
        }
    }

    /**
     * Explique une erreur SQL spécifique à l'étudiant
     * @param {string} sqlQuery - La requête avec erreur
     * @param {string} errorMessage - Le message d'erreur retourné
     * @returns {Promise<{explanation: string, fix_suggestion: string}>} - Explication et suggestion
     */
    async explainError(sqlQuery, errorMessage) {
        const prompt = `
Explique cette erreur SQL à un étudiant de manière pédagogique:

Requête SQL:
\`\`\`sql
${sqlQuery}
\`\`\`

Message d'erreur:
${errorMessage}

Fournit:
1. Une explication claire de l'erreur pour un débutant
2. La raison probable de cette erreur
3. Une suggestion concrète pour corriger le problème

Format de réponse:
{
  "explanation": "<explication détaillée>",
  "reason": "<raison de l'erreur>",
  "fix_suggestion": "<suggestion de correction>"
}
`;

        try {
            const responseText = await this.generateResponse(prompt);

            // Extraction du JSON de la réponse
            let jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                return {
                    explanation: "Désolé, impossible d'analyser cette erreur pour le moment.",
                    reason: "Erreur inconnue",
                    fix_suggestion: "Vérifiez la syntaxe de votre requête."
                };
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Erreur lors de l\'explication de l\'erreur SQL:', error.message);
            return {
                explanation: "Une erreur est survenue lors de l'analyse.",
                reason: "Service temporairement indisponible",
                fix_suggestion: "Veuillez réessayer plus tard."
            };
        }
    }
}

module.exports = new DeepSeekAI();