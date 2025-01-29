module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    receiver_id: {
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
    timestamps: true,
    underscored: true
  });

  Message.associate = (models) => {
    Message.belongsTo(models.User, {
      as: 'sender',
      foreignKey: 'sender_id'
    });
    Message.belongsTo(models.User, {
      as: 'receiver',
      foreignKey: 'receiver_id'
    });
  };

  return Message;
}; 