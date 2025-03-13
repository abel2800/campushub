const express = require('express');
const router = express.Router();
const { storyController, upload } = require('../controllers/storyController'); // Ensure this is imported correctly
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Story routes
router.post('/create', upload.single('media'), storyController.createStory);
router.get('/friends', storyController.getFriendStories);

module.exports = router;