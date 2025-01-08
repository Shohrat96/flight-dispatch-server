const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Your Sequelize instance or connection

const Remark = sequelize.define('Remark', {
    flight_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    flight_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false, // Must match the email of a User
    },
    remark: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ['flight_number', 'flight_date'],
        },
    ],
});

module.exports = Remark;

