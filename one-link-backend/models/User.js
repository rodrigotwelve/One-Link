const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const bcrypt = require('bcryptjs');

/**
 * User Model
 * Represents a user in the One-Link social bio system
 */
const User = sequelize.define('User', {
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
      notEmpty: true
    }
  },
  
  // Email - must be unique and not null
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true, // Validates email format
      notEmpty: true
    }
  },
  
  // Password hash - stores encrypted password
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
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
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    },
    
    // Hash password before updating if it changed
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    }
  }
});

// Instance method to compare password
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

// Instance method to get public profile (without password)
User.prototype.getPublicProfile = function() {
  const { password_hash, ...publicProfile } = this.toJSON();
  return publicProfile;
};

module.exports = User;
