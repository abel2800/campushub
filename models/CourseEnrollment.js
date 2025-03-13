module.exports = (sequelize, DataTypes) => {
    const CourseEnrollment = sequelize.define('CourseEnrollment', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      startedAt: {
        type: DataTypes.DATE
      },
      completedAt: {
        type: DataTypes.DATE
      }
    }, {
      tableName: 'CourseEnrollments'
    });
  
    CourseEnrollment.associate = (models) => {
      CourseEnrollment.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      CourseEnrollment.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'course' // Specify the alias
      });
    };
  
    return CourseEnrollment;
  };