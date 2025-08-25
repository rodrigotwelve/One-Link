const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Authentication Middleware
 * Verifies JWT token and provides user information in req.user
 * This middleware should be used before protected routes
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user in database
    const user = await User.findByPk(decoded.user_id, {
      attributes: ['user_id', 'username', 'email', 'created_at', 'updated_at']
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    // Add user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Optional Authentication Middleware
 * Similar to authenticateToken but doesn't require a valid token
 * Useful for routes that can work with or without authentication
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.user_id, {
          attributes: ['user_id', 'username', 'email', 'created_at', 'updated_at']
        });
        
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we continue without authentication
        console.log('Optional auth: Invalid token provided');
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next(); // Continue without authentication
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
