// emailService.js
require("dotenv").config();
const nodemailer = require('nodemailer');

// Configuration du transporteur
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWD,
    }
});

// Fonction pour envoyer un email de confirmation de création de compte
const sendAccountApprovalEmail = async (teacherEmail, Prenom, Nom) => {
    try {
        const mailOptions = {
            from: 'votre-application@ecole.com',
            to: teacherEmail,
            subject: 'Votre compte a été approuvé',
            html: `
        <h1>Félicitations ${Prenom} ${Nom}!</h1>
        <p>Votre demande de création de compte professeur a été approuvée par l'administrateur.</p>
        <p>Vous pouvez maintenant vous connecter à l'application Data Eval avec vos identifiants.</p>
        <p>Cordialement,<br>L'équipe administrative</p>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé: ' + info.response);
        return { success: true, message: 'Email envoyé avec succès' };
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        return { success: false, message: 'Erreur lors de l\'envoi de l\'email', error };
    }
};

module.exports = {
    sendAccountApprovalEmail,
    // Vous pouvez ajouter d'autres fonctions d'envoi d'emails ici
};