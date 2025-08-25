const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

/**
 * Link Model
 * Represents a link in a user's social bio profile
 */
const Link = sequelize.define('Link', {
  // Primary key - auto-incrementing link ID
  link_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  
  // Foreign key referencing User
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  
  // Link title/display text
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100], // Title must be between 1-100 characters
      notEmpty: true
    }
  },
  
  // Link URL
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      isUrl: true, // Validates URL format
      notEmpty: true
    }
  },
  
  // Order for sorting links
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0 // Order must be non-negative
    }
  }
}, {
  // Table name
  tableName: 'links',
  
  // Indexes for better performance
  indexes: [
    {
      fields: ['user_id', 'order'] // Composite index for efficient user link queries
    }
  ]
});

// Instance method to get formatted link data
Link.prototype.getFormattedLink = function() {
  return {
    link_id: this.link_id,
    title: this.title,
    url: this.url,
    order: this.order,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

module.exports = Link;
