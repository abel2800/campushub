const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust based on your setup

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'user', // Matches the table name in your database
  timestamps: true,  // Automatically manages createdAt and updatedAt
});

module.exports = User;
