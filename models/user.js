'use strict';

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
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    department: {
      type: DataTypes.STRING
    },
    avatar: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'Users'
  });

  User.associate = function(models) {
    // Courses created by the user (as instructor)
    User.hasMany(models.Course, {
      foreignKey: 'instructorId',
      as: 'coursesCreated'
    });

    // Courses enrolled in (as student)
    User.hasMany(models.CourseEnrollment, {
      foreignKey: 'userId',
      as: 'enrollments'
    });

    // Posts created by the user
    User.hasMany(models.Post, {
      foreignKey: 'userId',
      as: 'posts'
    });

    // Comments made by the user
    User.hasMany(models.Comment, {
      foreignKey: 'userId',
      as: 'comments'
    });

    // Friends relationships
    User.belongsToMany(models.User, {
      through: models.Friend,
      as: 'friends',
      foreignKey: 'userId',
      otherKey: 'friendId'
    });

    // Messages sent by the user
    User.hasMany(models.Message, {
      foreignKey: 'senderId',
      as: 'messagesSent'
    });

    // Messages received by the user
    User.hasMany(models.Message, {
      foreignKey: 'receiverId',
      as: 'messagesReceived'
    });
  };

  return User;
};