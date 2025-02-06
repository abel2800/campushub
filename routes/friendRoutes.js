const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { Op } = require('sequelize');
const { User, Friend } = require('../models');
const friendController = require('../controllers/friendController');

// Apply auth middleware to all routes
router.use(auth);

// Search users route (make sure this is the first route)
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user.id;

    console.log('Search endpoint hit:', { query, currentUserId });

    const users = await User.findAll({
      where: {
        [Op.and]: [
          {
            username: {
              [Op.iLike]: `%${query}%`
            }
          },
          {
            id: {
              [Op.ne]: currentUserId
            }
          }
        ]
      },
      attributes: ['id', 'username', 'department', 'avatar']
    });

    console.log('Found users:', users);
    res.json(users);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
});

// Send friend request
router.post('/request', friendController.sendFriendRequest);

// Get pending friend requests
router.get('/requests/pending', friendController.getPendingRequests);

// Accept friend request
router.post('/request/:requestId/accept', friendController.acceptFriendRequest);

// Get friends list
router.get('/list', friendController.getFriends);

// Get all friends
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const friends = await Friend.findAll({
      where: {
        [Op.or]: [
          { userid: userId },
          { friendid: userId }
        ],
        status: 'accepted'
      },
      include: [{
        model: User,
        as: 'friend',
        attributes: ['id', 'username', 'department']
      }]
    });

    const transformedFriends = friends.map(friendship => ({
      id: friendship.id,
      friend: {
        id: friendship.userid === userId ? friendship.friendid : friendship.userid,
        username: friendship.friend.username,
        department: friendship.friend.department
      }
    }));

    res.json(transformedFriends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Error getting friends list' });
  }
});

// Reject friend request
router.post('/reject/:requestId', friendController.rejectFriendRequest);

// Remove friend
router.delete('/:friendId', async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.friendId;

    await Friend.destroy({
      where: {
        [Op.or]: [
          { userid: userId, friendid: friendId },
          { userid: friendId, friendid: userId }
        ]
      }
    });

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Error removing friend' });
  }
});

module.exports = router;