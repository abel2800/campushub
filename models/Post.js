module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
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
    caption: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    commentsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'posts',
    timestamps: true
  });

  Post.associate = (models) => {
    Post.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Post.hasMany(models.Comment, {
      foreignKey: 'postId',
      as: 'comments'
    });
    Post.hasMany(models.Like, {
      foreignKey: 'postId',
      as: 'likes'
    });
  };

  return Post;
}; 