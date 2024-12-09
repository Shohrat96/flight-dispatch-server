const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WeatherData = sequelize.define('WeatherData', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  icao_code: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  taf: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  metar: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'weather_data',
  timestamps: false,
});

module.exports = WeatherData;
