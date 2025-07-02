const sequelize = require('../config/database');

async function checkDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');
    
    // Sync model dengan database (hati-hati di production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('🔄 Database synced');
    }
  } catch (error) {
    console.error('Database connection failed:', error.message);
    
    // Beri petunjuk troubleshooting
    console.log('\n Troubleshooting:');
    console.log('1. Pastikan MySQL server running');
    console.log('2. Cek credential database di .env');
    console.log('3. Verifikasi database sudah dibuat');
    
    process.exit(1); // Exit dengan error code
  }
}

module.exports = { checkDatabaseConnection };