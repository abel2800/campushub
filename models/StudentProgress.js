module.exports = (sequelize, DataTypes) => {
  const StudentProgress = sequelize.define('StudentProgress', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    videoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    watchedSeconds: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastWatchedAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'StudentProgress'
  });

  StudentProgress.associate = (models) => {
    StudentProgress.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    StudentProgress.belongsTo(models.CourseVideo, {
      foreignKey: 'videoId',
      as: 'video'
    });
    StudentProgress.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course'
    });
  };

  return StudentProgress;
}; 