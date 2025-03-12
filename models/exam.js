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
    });

    return Exam;
};