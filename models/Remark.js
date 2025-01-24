const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Your Sequelize instance or connection

const Remark = sequelize.define('Remark', {
    flight_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    flight_date: {
        type: DataTypes.STRING,
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
    flight_data: {
        type: DataTypes.JSONB,
        allowNull: false,
    }
});

module.exports = Remark;

