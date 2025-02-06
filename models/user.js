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
      type: DataTypes.STRING,
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Users',
    timestamps: true
  });

  User.associate = function(models) {
    User.hasMany(models.Course, { foreignKey: 'instructorId', as: 'courses' });
    User.belongsToMany(models.Course, { through: 'Enrollments', as: 'enrolledCourses' });
    User.hasMany(models.Story, { foreignKey: 'userId', as: 'stories' });
    User.hasMany(models.Chat, { foreignKey: 'user1Id', as: 'chatsInitiated' });
    User.hasMany(models.Chat, { foreignKey: 'user2Id', as: 'chatsReceived' });
    User.hasMany(models.Message, { foreignKey: 'senderId', as: 'messages' });
  };

  return User;
};