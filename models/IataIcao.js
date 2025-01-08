const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Your Sequelize instance or connection

const IataIcao = sequelize.define('IataIcao', {
  country_code: {
    type: DataTypes.STRING,  // Country code (e.g., AE)
    allowNull: false,
  },
  region_name: {
    type: DataTypes.STRING,  // Region name (e.g., Abu Zaby)
    allowNull: false,
  },
  iata: {
    type: DataTypes.STRING,  // IATA code (e.g., AAN)
    allowNull: false,
  },
  icao: {
    type: DataTypes.STRING,  // ICAO code (e.g., OMAL)
    allowNull: false,
  },
  airport: {
    type: DataTypes.STRING,  // Airport name (e.g., Al Ain International Airport)
    allowNull: false,
  },
  latitude: {
    type: DataTypes.NUMERIC(8, 5),  // Latitude with precision (e.g., 24.2617)
    allowNull: true, // Latitude can be null
  },
  longitude: {
    type: DataTypes.NUMERIC(8, 5),  // Longitude with precision (e.g., 55.6092)
    allowNull: true, // Longitude can be null
  }
}, {
  timestamps: false, // Disable Sequelize's automatic handling of createdAt and updatedAt columns
  tableName: 'airports', // Specify the table name
});

module.exports = IataIcao;
