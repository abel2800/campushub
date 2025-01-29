module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    chat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Chats',
        key: 'id'
      }
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'Messages',
    underscored: true
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Chat, { foreignKey: 'chat_id' });
    Message.belongsTo(models.User, { as: 'sender', foreignKey: 'sender_id' });
  };

  return Message;
}; 