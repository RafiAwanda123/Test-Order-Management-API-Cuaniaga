require('dotenv').config();
const express = require('express');
const app = express();
const { sequelize } = require('./models');
const errorHandler = require('./middleware/error.middleware');

// Middleware dasar
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes');

// Fungsi inisialisasi database
async function initializeDatabase() {
  try {
    // 1. Test koneksi
    await sequelize.authenticate();
    console.log('Database connected!');

    // 2. Sync model (hanya di development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database synced!');

      const createInitialAdmin = require('./seeders/initialAdmin');
      await createInitialAdmin();
    }

    // 3. Seed data awal (jika diperlukan)
    // await seedDatabase();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1); // Exit dengan code error
  }
}

// Setup routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

// Error handling middleware (harus di akhir)
app.use(errorHandler);

// Start server setelah database ready
const PORT = process.env.PORT || 3000;

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  try {
    await sequelize.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Failed to close database:', err);
    process.exit(1);
  }
});

module.exports = app; // Untuk testing