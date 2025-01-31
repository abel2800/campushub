const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { Op } = require('sequelize');
const { User, Friend } = require('../models');
const friendController = require('../controllers/friendController');

// Apply auth middleware to all routes
router.use(auth);

// Search users by username or department
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
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
        where: {
          [Op.or]: [
            { username: { [Op.iLike]: `%${query}%` } },
            { department: { [Op.iLike]: `%${query}%` } }
          ]
        },
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
    console.error('Search friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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

// Send friend request
router.post('/request/:userId', async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.userId;

    // Check if friendship already exists
    const existingFriendship = await Friend.findOne({
      where: {
        [Op.or]: [
          { userid: senderId, friendid: receiverId },
          { userid: receiverId, friendid: senderId }
        ]
      }
    });

    if (existingFriendship) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    const friendship = await Friend.create({
      userid: senderId,
      friendid: receiverId,
      status: 'pending'
    });

    res.json(friendship);
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Error sending friend request' });
  }
});

// Get pending friend requests
router.get('/requests/pending', friendController.getPendingRequests);

// Accept friend request
router.post('/accept/:requestId', async (req, res) => {
  try {
    const friendship = await Friend.findByPk(req.params.requestId);
    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    await friendship.update({ status: 'accepted' });
    res.json(friendship);
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Error accepting friend request' });
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