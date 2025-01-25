module.exports = (sequelize, DataTypes) => {
  const Friend = sequelize.define('Friend', {
    status: {
      type: DataTypes.ENUM('pending', 'accepted'),
      defaultValue: 'pending',
      allowNull: false
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
    }
  });

  Friend.associate = function(models) {
    Friend.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });
    Friend.belongsTo(models.User, { as: 'receiver', foreignKey: 'receiverId' });
  };

  return Friend;
}; 