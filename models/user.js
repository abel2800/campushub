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
    // User can have many friends (users who sent friend requests)
    User.hasMany(models.Friend, {
      foreignKey: 'userid',
      as: 'sentFriendRequests'
    });

    // User can have many friends (users who received friend requests)
    User.hasMany(models.Friend, {
      foreignKey: 'friendid',
      as: 'receivedFriendRequests'
    });
  };

  return User;
};