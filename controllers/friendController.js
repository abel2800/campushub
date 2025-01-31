const { User, Friend, FriendRequest, Notification } = require('../models');
const { Op } = require('sequelize');

const friendController = {
  // Get pending friend requests
  getPendingRequests: async (req, res) => {
    try {
      const userId = req.user.id;
      const requests = await FriendRequest.findAll({
        where: {
          receiverId: userId,
          status: 'pending'
        },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['id', 'username']
        }]
      });
      res.json(requests);
    } catch (error) {
      console.error('Get pending requests error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Accept friend request
  acceptFriendRequest: async (req, res) => {
    try {
      const userId = req.user.id;
      const { requestId } = req.params;

      const friendRequest = await Friend.findOne({
        where: {
          id: requestId,
          friendid: userId,
          status: 'pending'
        }
      });

      if (!friendRequest) {
        return res.status(404).json({ message: 'Friend request not found' });
      }

      await friendRequest.update({ status: 'accepted' });

      // Create reverse friendship
      await Friend.create({
        userid: friendRequest.friendid,
        friendid: friendRequest.userid,
        status: 'accepted'
      });

      res.json({ message: 'Friend request accepted' });
    } catch (error) {
      console.error('Accept friend request error:', error);
      res.status(500).json({ message: 'Error accepting friend request' });
    }
  },

  // Reject friend request
  rejectFriendRequest: async (req, res) => {
    try {
      const requestId = req.params.requestId;
      const userId = req.user.id;

      const request = await FriendRequest.findOne({
        where: {
          id: requestId,
          receiverId: userId,
          status: 'pending'
        }
      });

      if (!request) {
        return res.status(404).json({ message: 'Friend request not found' });
      }

      await request.update({ status: 'rejected' });
      res.json({ message: 'Friend request rejected' });
    } catch (error) {
      console.error('Reject request error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Send friend request
  sendFriendRequest: async (req, res) => {
    try {
      const senderId = req.user.id;
      const { receiverId } = req.body;

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
        return res.status(400).json({ message: 'Friendship already exists' });
      }

      // Create friend request
      const friendRequest = await Friend.create({
        userid: senderId,
        friendid: receiverId,
        status: 'pending'
      });

      res.json({ message: 'Friend request sent successfully', friendRequest });
    } catch (error) {
      console.error('Send friend request error:', error);
      res.status(500).json({ message: 'Error sending friend request' });
    }
  },

  // Get friends list
  getFriends: async (req, res) => {
    try {
      const userId = req.user.id;
      console.log('Getting friends for user:', userId);

      const friends = await Friend.findAll({
        where: {
          [Op.or]: [
            { userid: userId },
            { friendid: userId }
          ]
        },
        include: [{
          model: User,
          as: 'friend',
          attributes: ['id', 'username', 'department']
        }]
      });

      console.log('Raw friends data:', friends);

      // Transform the results to always show the other user's info
      const transformedFriends = friends.map(friendship => ({
        id: friendship.id,
        friend: {
          id: friendship.userid === userId ? friendship.friendid : friendship.userid,
          username: friendship.friend.username,
          department: friendship.friend.department
        }
      }));

      console.log('Transformed friends:', transformedFriends);
      res.json(transformedFriends);
    } catch (error) {
      console.error('Get friends error:', error);
      res.status(500).json({ 
        message: 'Error getting friends list',
        error: error.message 
      });
    }
  },

  // Remove friend
  removeFriend: async (req, res) => {
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
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Search friends
  searchFriends: async (req, res) => {
    try {
      const userId = req.user.id;
      const { query } = req.query;

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
  }
};

module.exports = friendController;