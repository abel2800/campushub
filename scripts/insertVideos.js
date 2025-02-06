const { Course, CourseVideo } = require('../models');
const { sequelize } = require('../models');

async function insertCourseAndVideos() {
  try {
    // Create a new course
    const course = await Course.create({
      title: "Java Programming Course",
      description: "Learn Java programming from scratch",
      thumbnail: "/courses/java/thumbnail.jpg",
      totalVideos: 6,
      totalDuration: 360 // 6 videos * 60 minutes average
    });

    // Create videos for the course
    const videos = [
      {
        courseId: course.id,
        title: "Introduction to Java",
        description: "Basic introduction to Java programming concepts",
        videoUrl: "video1.mp4",
        duration: 60,
        orderIndex: 1
      },
      {
        courseId: course.id,
        title: "Variables and Data Types",
        description: "Understanding variables and data types in Java",
        videoUrl: "video2.mp4",
        duration: 60,
        orderIndex: 2
      },
      {
        courseId: course.id,
        title: "Control Flow",
        description: "Learn about control flow statements in Java",
        videoUrl: "video3.mp4",
        duration: 60,
        orderIndex: 3
      },
      {
        courseId: course.id,
        title: "Object-Oriented Programming",
        description: "Introduction to OOP concepts in Java",
        videoUrl: "video4.mp4",
        duration: 60,
        orderIndex: 4
      },
      {
        courseId: course.id,
        title: "Exception Handling",
        description: "Learn how to handle exceptions in Java",
        videoUrl: "video5.mp4",
        duration: 60,
        orderIndex: 5
      },
      {
        courseId: course.id,
        title: "Collections Framework",
        description: "Understanding Java Collections Framework",
        videoUrl: "video6.mp4",
        duration: 60,
        orderIndex: 6
      }
    ];

    await CourseVideo.bulkCreate(videos);
    console.log('Course and videos created successfully!');
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    await sequelize.close();
  }
}

insertCourseAndVideos(); 