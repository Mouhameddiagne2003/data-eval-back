const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Exam = sequelize.define('Exam', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        format: {
            type: DataTypes.ENUM('text', 'markdown', 'latex', 'pdf'),
            allowNull: false,
        },
        gradingCriteria: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        deadline: {
            type: DataTypes.DATE, // Ajout du champ deadline
            allowNull: false,
        },
        fileUrl: {
            type: DataTypes.STRING, // Ajout du champ fileUrl
            allowNull: false, // Permettre null si aucun fichier n'est joint
        },
    });

    return Exam;
};