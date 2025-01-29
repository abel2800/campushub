const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all chat routes
router.use(authMiddleware);

// Chat routes
router.get('/', chatController.getChats);
router.get('/:userId', chatController.getChatHistory);
router.post('/send', chatController.sendMessage);
router.put('/:chatId/read', chatController.markAsRead);
router.post('/create', chatController.createOrGetChat);
router.get('/recent', chatController.getRecentChats);
router.get('/:chatId/messages', chatController.getMessages);
router.post('/:chatId/messages', chatController.sendMessage);

module.exports = router; 