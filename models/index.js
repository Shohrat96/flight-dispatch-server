const sequelize = require('../config/database');
const Flight = require('./Flight');
const WeatherData = require('./WeatherData');
const IataIcao = require('./IataIcao');
const User = require('./User');
const Remark = require('./Remark');

// Sync all models
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};


// Relationship between models

Remark.belongsTo(User, {
  foreignKey: 'author',
  targetKey: 'email',
  as: 'user',
});

User.hasMany(Remark, {
  foreignKey: 'author',
  sourceKey: 'email',
  as: 'remarks',
});

module.exports = {
  sequelize,
  Flight,
  IataIcao,
  WeatherData,
  User,
  Remark,
  syncDatabase,
};
