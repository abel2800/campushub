module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define('Chat', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user1_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    user2_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    tableName: 'Chats',
    underscored: true
  });

  Chat.associate = (models) => {
    Chat.belongsTo(models.User, { as: 'user1', foreignKey: 'user1_id' });
    Chat.belongsTo(models.User, { as: 'user2', foreignKey: 'user2_id' });
    Chat.belongsTo(models.User, {
      as: 'participant',
      foreignKey: 'user2_id'
    });
    Chat.hasMany(models.Message, { as: 'messages', foreignKey: 'chat_id' });
    Chat.hasOne(models.Message, {
      as: 'lastMessage',
      foreignKey: 'chat_id'
    });
  };

  return Chat;
}; 