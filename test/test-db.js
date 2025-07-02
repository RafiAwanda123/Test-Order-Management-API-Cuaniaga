require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: console.log
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connected!');
    
    // Test query
    const [result] = await sequelize.query('SELECT 1 + 1 AS result');
    console.log('Database test result:', result[0].result);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testConnection();