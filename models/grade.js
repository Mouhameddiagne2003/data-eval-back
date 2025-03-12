const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Grade = sequelize.define('Grade', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        score: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    });

    return Grade;
};