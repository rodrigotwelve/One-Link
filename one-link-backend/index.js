const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const linkRoutes = require('./routes/links');

// Import middleware
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'One-Link Backend is running' });
});

// API Routes
// Authentication routes (no auth required)
app.use('/api/auth', authRoutes);

// Link management routes - require authentication
app.use('/api/links', authenticateToken, linkRoutes);

// Test database connection and start server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized successfully.');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📱 Backend API available at http://localhost:${PORT}`);
      console.log(`🔐 Auth API available at http://localhost:${PORT}/api/auth`);
      console.log(`🔗 Link API available at http://localhost:${PORT}/api/links`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database or start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
