const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/authMiddleware');

// Get all available courses (make this public)
router.get('/', courseController.getAllCourses);

// Protected routes
router.use(auth);  // Apply auth middleware to routes below

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