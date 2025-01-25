const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const authenticate = require('../middlewares/authMiddleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Search users route
router.get('/search', friendController.searchUsers);

// Friend request routes
router.post('/send-request', friendController.sendFriendRequest);
router.get('/requests', friendController.getFriendRequests);
router.get('/list', friendController.getFriendsList);
router.post('/accept-request/:requestId', friendController.acceptFriendRequest);

module.exports = router; 