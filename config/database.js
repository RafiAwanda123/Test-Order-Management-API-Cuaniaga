const { Sequelize, Op } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  dialectOptions: {
    connectTimeout: 30000
  },
  logging: console.log, 
  operatorsAliases: 0, 
  define: {
    timestamps: true, 
    paranoid: true, 
    underscored: true,
    freezeTableName: true 
  }
});

// const sequelize = new Sequelize(
//   `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
// );

module.exports = sequelize;