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
  res.json({ 
    message: 'One-Link Backend is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      links: '/api/links',
      docs: 'Check README.md for API documentation'
    }
  });
});

// API Routes
// Authentication routes (no auth required)
app.use('/api/auth', authRoutes);

// Protected routes - require authentication
// Link management routes
app.use('/api/links', authenticateToken, linkRoutes);

// Protected user profile route
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.getPublicProfile()
    }
  });
});

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
      console.log(`👤 User Profile: http://localhost:${PORT}/api/auth/me (protected)`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database or start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
