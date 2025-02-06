const { Course, CourseVideo, StudentProgress, User, CourseEnrollment } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

const courseController = {
  // Get all available courses
  getAllCourses: async (req, res) => {
    try {
      const courses = await Course.findAll({
        include: [{
          model: CourseVideo,
          as: 'videos',
          attributes: ['id']
        }],
        attributes: [
          'id',
          'title',
          'description',
          'thumbnail',
          'totalVideos',
          'totalDuration'
        ]
      });

      // Transform the data to include video count
      const transformedCourses = courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        totalVideos: course.totalVideos,
        totalDuration: course.totalDuration
      }));

      res.json(transformedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ message: 'Error fetching courses' });
    }
  },

  // Get enrolled courses for current user
  getEnrolledCourses: async (req, res) => {
    try {
      const userId = req.user.id;
      const enrolledCourses = await CourseEnrollment.findAll({
        where: { userId },
        include: [{
          model: Course,
          as: 'course', // Specify the alias
          include: [{
            model: CourseVideo,
            as: 'videos',
            attributes: ['id']
          }]
        }]
      });

      res.json(enrolledCourses);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      res.status(500).json({ message: 'Error fetching enrolled courses' });
    }
  },

  // Enroll in a course
  enrollInCourse: async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      // Check if already enrolled
      const existingEnrollment = await CourseEnrollment.findOne({
        where: { userId, courseId }
      });

      if (existingEnrollment) {
        return res.status(400).json({ message: 'Already enrolled in this course' });
      }

      // Create enrollment
      await CourseEnrollment.create({
        userId,
        courseId,
        progress: 0,
        startedAt: new Date()
      });

      res.status(201).json({ message: 'Successfully enrolled in course' });
    } catch (error) {
      console.error('Error enrolling in course:', error);
      res.status(500).json({ message: 'Error enrolling in course' });
    }
  },

  // Get course details
  getCourseDetails: async (req, res) => {
    try {
      const { courseId } = req.params;
      const course = await Course.findByPk(courseId, {
        include: [{
          model: CourseVideo,
          as: 'videos',
          attributes: ['id', 'title', 'description', 'videoUrl', 'duration', 'orderIndex']
        }]
      });

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      res.json(course);
    } catch (error) {
      console.error('Error fetching course details:', error);
      res.status(500).json({ message: 'Error fetching course details' });
    }
  },

  // Update video progress
  updateProgress: async (req, res) => {
    try {
      const { videoId } = req.params;
      const { watchedSeconds, completed } = req.body;
      const userId = req.user.id;

      const video = await CourseVideo.findByPk(videoId);
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      const [progress] = await StudentProgress.findOrCreate({
        where: {
          userId,
          videoId,
          courseId: video.courseId
        },
        defaults: {
          watchedSeconds: 0,
          completed: false
        }
      });

      await progress.update({
        watchedSeconds,
        completed,
        lastWatchedAt: new Date()
      });

      res.json(progress);
    } catch (error) {
      console.error('Error updating progress:', error);
      res.status(500).json({ message: 'Error updating progress' });
    }
  },

  // Get student's course progress
  getStudentProgress: async (req, res) => {
    try {
      const userId = req.user.id;
      const { courseId } = req.params;

      const progress = await StudentProgress.findAll({
        where: { userId, courseId },
        include: [{
          model: CourseVideo,
          as: 'video',
          attributes: ['id', 'title', 'duration']
        }]
      });

      const totalVideos = await CourseVideo.count({ where: { courseId } });
      const completedVideos = progress.filter(p => p.completed).length;
      const progressPercentage = (completedVideos / totalVideos) * 100;

      res.json({
        progress,
        totalVideos,
        completedVideos,
        progressPercentage
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
      res.status(500).json({ message: 'Error fetching progress' });
    }
  },

  // Get course analytics
  getAnalytics: async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      // Get overall progress
      const progress = await StudentProgress.findAll({
        where: { userId, courseId },
        include: [{
          model: CourseVideo,
          as: 'video',
          attributes: ['id', 'title', 'duration']
        }]
      });

      const totalVideos = await CourseVideo.count({ where: { courseId } });
      const completedVideos = progress.filter(p => p.completed).length;
      const overallProgress = (completedVideos / totalVideos) * 100;

      // Calculate watch time per day
      const watchTimeData = await StudentProgress.findAll({
        where: { userId, courseId },
        attributes: [
          [sequelize.fn('date', sequelize.col('lastWatchedAt')), 'date'],
          [sequelize.fn('sum', sequelize.col('watchedSeconds')), 'minutes']
        ],
        group: [sequelize.fn('date', sequelize.col('lastWatchedAt'))],
        raw: true
      });

      // Format video progress details
      const videoProgress = progress.map(p => ({
        title: p.video.title,
        progress: (p.watchedSeconds / p.video.duration) * 100,
        watchTime: Math.round(p.watchedSeconds / 60),
        completed: p.completed
      }));

      res.json({
        overallProgress,
        completedVideos,
        totalVideos,
        totalWatchTime: progress.reduce((sum, p) => sum + p.watchedSeconds, 0),
        watchTimeData: watchTimeData.map(d => ({
          date: d.date,
          minutes: Math.round(d.minutes / 60)
        })),
        videoProgress
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Error fetching analytics' });
    }
  }
};

// Export the controller
module.exports = courseController;