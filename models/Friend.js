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
      field: 'userid',
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    friendid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'friendid',
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
    timestamps: true
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

  Friend.beforeCreate(async (friendship) => {
    const { Op } = require('sequelize');
    // Check if friendship already exists
    const existingFriendship = await friendship.constructor.findOne({
      where: {
        [Op.or]: [
          { userid: friendship.userid, friendid: friendship.friendid },
          { userid: friendship.friendid, friendid: friendship.userid }
        ]
      }
    });

    if (existingFriendship) {
      throw new Error('Friendship already exists');
    }
  });

  return Friend;
};