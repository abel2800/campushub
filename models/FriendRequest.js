module.exports = (sequelize, DataTypes) => {
  const FriendRequest = sequelize.define('FriendRequest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending'
    }
  });

  FriendRequest.associate = (models) => {
    FriendRequest.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });
    FriendRequest.belongsTo(models.User, { as: 'receiver', foreignKey: 'receiverId' });
  };

  return FriendRequest;
};