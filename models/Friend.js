module.exports = (sequelize, DataTypes) => {
  const Friend = sequelize.define('Friend', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    friendid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING(10),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'accepted']]
      }
    }
  }, {
    tableName: 'Friends',
    timestamps: true // This will add createdAt and updatedAt columns
  });

  Friend.associate = (models) => {
    Friend.belongsTo(models.User, {
      foreignKey: 'userid',
      as: 'user'
    });
    Friend.belongsTo(models.User, {
      foreignKey: 'friendid',
      as: 'friend'
    });
  };

  return Friend;
};