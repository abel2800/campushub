const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(auth);

// Get all available courses
router.get('/', courseController.getAllCourses);

// Get enrolled courses for current user
router.get('/enrolled', courseController.getEnrolledCourses);

// Enroll in a course
router.post('/:courseId/enroll', courseController.enrollInCourse);

// Get course details
router.get('/:courseId', courseController.getCourseDetails);

router.get('/:courseId/progress', courseController.getStudentProgress);
router.post('/videos/:videoId/progress', courseController.updateProgress);
router.get('/:courseId/analytics', courseController.getAnalytics);

module.exports = router; 