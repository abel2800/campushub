module.exports = (sequelize, DataTypes) => {
  const Friend = sequelize.define('Friend', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    friendId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    tableName: 'Friends',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'friendId']
      }
    ]
  });

  Friend.associate = (models) => {
    Friend.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Friend.belongsTo(models.User, {
      foreignKey: 'friendId',
      as: 'friend'
    });
  };

  return Friend;
}; 