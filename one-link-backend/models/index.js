const { Sequelize } = require('sequelize');
const path = require('path');

// Create Sequelize instance with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false, // Set to console.log to see SQL queries
  define: {
    timestamps: true, // Adds createdAt and updatedAt fields
    underscored: true, // Use snake_case for column names
  }
});

// Import models
const User = require('./User');
const Link = require('./Link');

// Define associations/relationships
User.hasMany(Link, {
  foreignKey: 'user_id',
  as: 'links',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Link.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Sequelize connection established successfully.');
  })
  .catch(err => {
    console.error('❌ Sequelize connection error:', err);
  });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Link
};
