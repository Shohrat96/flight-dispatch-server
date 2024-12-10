const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define the Flight model
const Flight = sequelize.define('Flight', {
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  flight_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  aircraft_type: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  reg_number: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  origin: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  destination: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  ETD: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  ETA: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: false, // Disable createdAt and updatedAt
  tableName: "flight_list_shift"
});

module.exports = Flight;
