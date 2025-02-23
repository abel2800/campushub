module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    thumbnail: {
      type: DataTypes.STRING,
      defaultValue: '/courses/java/thumbnail.jpg'
    },
    totalVideos: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalDuration: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    instructorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'Courses'
  });

  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      foreignKey: 'instructorId',
      as: 'instructor'
    });
    Course.hasMany(models.CourseVideo, {
      foreignKey: 'courseId',
      as: 'videos'
    });
    Course.hasMany(models.CourseEnrollment, {
      foreignKey: 'courseId',
      as: 'enrollments'
    });
  };

  return Course;
}; 