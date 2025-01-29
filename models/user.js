const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Users'  // Make sure this matches your actual table name
  });

  User.associate = (models) => {
    User.hasMany(models.FriendRequest, {
      foreignKey: 'receiverId',
      as: 'receivedRequests'
    });
    User.hasMany(models.FriendRequest, {
      foreignKey: 'senderId',
      as: 'sentRequests'
    });
  };

  return User;
};