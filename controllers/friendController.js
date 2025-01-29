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
  acceptRequest: async (req, res) => {
    try {
      const requestId = req.params.requestId;
      const userId = req.user.id;

      // Find and update the request
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

      // Update request status
      await request.update({ status: 'accepted' });

      // Create two-way friendship
      await Friend.create({
        userId: request.receiverId,
        friendId: request.senderId
      });

      await Friend.create({
        userId: request.senderId,
        friendId: request.receiverId
      });

      // Get sender's username for notification
      const sender = await User.findByPk(request.senderId);
      const receiver = await User.findByPk(request.receiverId);

      // Create notification
      await Notification.create({
        userId: request.senderId,
        type: 'FRIEND_REQUEST_ACCEPTED',
        content: `${receiver.username} accepted your friend request`,
        read: false
      });

      res.json({ 
        message: 'Friend request accepted',
        friend: {
          id: sender.id,
          username: sender.username
        }
      });

    } catch (error) {
      console.error('Accept request error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Reject friend request
  rejectRequest: async (req, res) => {
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
  sendRequest: async (req, res) => {
    try {
      const { receiverId } = req.body;
      const senderId = req.user.id;

      if (senderId === receiverId) {
        return res.status(400).json({ message: 'Cannot send friend request to yourself' });
      }

      // Check if request already exists
      const existingRequest = await FriendRequest.findOne({
        where: {
          [Op.or]: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
          ],
          status: 'pending'
        }
      });

      if (existingRequest) {
        return res.status(400).json({ message: 'Friend request already exists' });
      }

      // Check if they're already friends
      const existingFriendship = await Friend.findOne({
        where: {
          [Op.or]: [
            { userId: senderId, friendId: receiverId },
            { userId: receiverId, friendId: senderId }
          ]
        }
      });

      if (existingFriendship) {
        return res.status(400).json({ message: 'Already friends' });
      }

      const request = await FriendRequest.create({
        senderId,
        receiverId,
        status: 'pending'
      });

      res.json({ message: 'Friend request sent', request });
    } catch (error) {
      console.error('Send request error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get friends list
  getFriends: async (req, res) => {
    try {
      const userId = req.user.id;

      const friends = await Friend.findAll({
        where: { userId },
        include: [{
          model: User,
          as: 'friend',
          attributes: ['id', 'username', 'department']
        }]
      });

      // Log the response for debugging
      console.log('Friends response:', JSON.stringify(friends, null, 2));

      res.json(friends);
    } catch (error) {
      console.error('Get friends error:', error);
      res.status(500).json({ message: 'Server error' });
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
            { userId, friendId },
            { userId: friendId, friendId: userId }
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