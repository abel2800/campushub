module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  Post.associate = function(models) {
    Post.belongsTo(models.User);
    if (models.Comment) {
      Post.hasMany(models.Comment);
    }
  };

  return Post;
}; 