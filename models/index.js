const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Inisialisasi Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);


const models = {
  User: require('./user.model')(sequelize, DataTypes),
  Product: require('./product.model')(sequelize, DataTypes),
  Order: require('./order.model')(sequelize, DataTypes),
  OrderItem: require('./order-item.model')(sequelize, DataTypes)
};

const { User, Product, Order, OrderItem } = models;

Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize,
  ...models
};