const { Sequelize } = require('sequelize');
require('dotenv').config();


// Initialize Sequelize
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
  logging: false, // Disable logging if unnecessary
});


module.exports = sequelize;
