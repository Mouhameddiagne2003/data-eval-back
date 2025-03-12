const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Submission = sequelize.define('Submission', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        format: {
            type: DataTypes.ENUM('text', 'pdf'),
            allowNull: false,
        },
    });

    return Submission;
};