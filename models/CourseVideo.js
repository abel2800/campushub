module.exports = (sequelize, DataTypes) => {
    const CourseVideo = sequelize.define('CourseVideo', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      videoUrl: {
        type: DataTypes.STRING,
        allowNull: false
      },
      thumbnail: {
        type: DataTypes.STRING,
        defaultValue: '/courses/java/thumbnail.jpg' // Use the same thumbnail
      },
      duration: {
        type: DataTypes.INTEGER
      },
      orderIndex: {
        type: DataTypes.INTEGER
      }
    }, {
      tableName: 'CourseVideos'
    });
  
    CourseVideo.associate = (models) => {
      CourseVideo.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'course'
      });
      CourseVideo.hasMany(models.StudentProgress, {
        foreignKey: 'videoId',
        as: 'progress'
      });
    };
  
    return CourseVideo;
  };