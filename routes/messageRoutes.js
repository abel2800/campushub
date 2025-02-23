const express = require('express');
const router = express.Router();
const { messageController, upload } = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Message routes
router.post('/send', upload.single('attachment'), messageController.sendMessage);
router.get('/history/:friendId', messageController.getMessageHistory);
router.get('/recent', messageController.getRecentChats);

module.exports = router; 