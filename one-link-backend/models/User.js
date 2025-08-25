const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * User Model
 * Represents a user in the One-Link social bio system
 */
const User = (sequelize) => {
  return sequelize.define('User', {
    // Primary key - auto-incrementing user ID
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    
    // Username - must be unique and not null
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50], // Username must be between 3-50 characters
        notEmpty: true,
        // Custom validation for username format
        is: {
          args: /^[a-zA-Z0-9_-]+$/, // Only alphanumeric, underscore, and hyphen
          msg: 'Username can only contain letters, numbers, underscores, and hyphens'
        }
      }
    },
    
    // Email - must be unique and not null
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true, // Validates email format
        notEmpty: true,
        // Custom validation for email format
        is: {
          args: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email format validation
          msg: 'Please provide a valid email address'
        }
      }
    },
    
    // Password hash - stores encrypted password
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        // Ensure password is at least 6 characters
        len: {
          args: [6, 255],
          msg: 'Password must be at least 6 characters long'
        }
      }
    }
  }, {
    // Table name
    tableName: 'users',
    
    // Hooks for password hashing
    hooks: {
      // Hash password before saving
      beforeCreate: async (user) => {
        if (user.password_hash) {
          // Additional password strength validation
          if (user.password_hash.length < 6) {
            throw new Error('Password must be at least 6 characters long');
          }
          
          const salt = await bcrypt.genSalt(12); // Increased salt rounds for better security
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
      
      // Hash password before updating if it changed
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          // Additional password strength validation
          if (user.password_hash.length < 6) {
            throw new Error('Password must be at least 6 characters long');
          }
          
          const salt = await bcrypt.genSalt(12); // Increased salt rounds for better security
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      }
    }
  });
};

module.exports = User;