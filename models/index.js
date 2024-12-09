const sequelize = require('../config/database');
const Flight = require('./Flight');
const WeatherData = require('./WeatherData');
const IataIcao = require('./IataIcao');

// Sync all models
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

module.exports = {
  sequelize,
  Flight,
  IataIcao,
  WeatherData,
  syncDatabase,
};
