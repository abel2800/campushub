module.exports = (sequelize, DataTypes) => {
  const Story = sequelize.define('Story', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    media_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(10),
      defaultValue: 'image'
    },
    expires_at: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'Stories',
    timestamps: true,
    underscored: true
  });

  Story.associate = (models) => {
    Story.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Story;
}; 