const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const friendController = require('../controllers/friendController');

// Apply auth middleware to all routes
router.use(auth);

// Search users route
router.get('/search', friendController.searchUsers);

// Send friend request
router.post('/request', friendController.sendFriendRequest);

// Get pending friend requests
router.get('/requests/pending', friendController.getPendingRequests);

// Accept friend request
router.post('/request/:requestId/accept', friendController.acceptFriendRequest);

// Reject friend request
router.post('/request/:requestId/reject', friendController.rejectFriendRequest);

// Get friends list
router.get('/list', friendController.getFriends);

// Remove friend
router.delete('/:friendId', friendController.removeFriend);

module.exports = router;