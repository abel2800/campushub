// Inside friendRoutes.js or userRoutes.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Friend } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const friendController = require('../controllers/friendController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Search users by username or department
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;

    const friends = await Friend.findAll({
      where: { userId },
      include: [{
        model: User,
        as: 'friend',
        where: {
          [Op.or]: [
            { username: { [Op.iLike]: `%${query}%` } },
            { department: { [Op.iLike]: `%${query}%` } }
          ]
        },
        attributes: ['id', 'username', 'department']
      }]
    });

    res.json(friends.map(f => f.friend));
  } catch (error) {
    console.error('Search friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Friend requests routes
router.get('/requests/pending', friendController.getPendingRequests);
router.post('/requests', friendController.sendRequest);
router.post('/requests/:requestId/accept', friendController.acceptRequest);
router.post('/requests/:requestId/reject', friendController.rejectRequest);

// Friends management routes
router.get('/', friendController.getFriends);
router.delete('/:friendId', friendController.removeFriend);

// Add this route to your existing friendRoutes
router.get('/search', friendController.searchFriends);

module.exports = router;