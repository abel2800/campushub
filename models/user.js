module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
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
      set(value) {
        this.setDataValue('email', value.toLowerCase());
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
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  User.associate = function(models) {
    User.hasMany(models.Friend, { as: 'sentFriendRequests', foreignKey: 'senderId' });
    User.hasMany(models.Friend, { as: 'receivedFriendRequests', foreignKey: 'receiverId' });
    if (models.Post) {
      User.hasMany(models.Post);
    }
    if (models.Comment) {
      User.hasMany(models.Comment);
    }
  };

  return User;
};
