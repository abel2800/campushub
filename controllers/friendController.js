const { User, Friend, Notification } = require('../models');
const { Op } = require('sequelize');

const friendController = {
  // Search users to add as friends
  searchUsers: async (req, res) => {
    try {
      const { query } = req.query;
      const currentUserId = req.user.id;

      console.log('Search query:', query);
      console.log('Current user ID:', currentUserId);

      if (!query) {
        return res.json([]);
      }

      // Find users matching search query
      const users = await User.findAll({
        where: {
          [Op.and]: [
            // Search in both username and department
            {
              [Op.or]: [
                { username: { [Op.iLike]: `%${query}%` } },
                { department: { [Op.iLike]: `%${query}%` } }
              ]
            },
            // Exclude current user
            { id: { [Op.ne]: currentUserId } }
          ]
        },
        attributes: ['id', 'username', 'department', 'avatar'],
        limit: 10 // Limit results to 10 users
      });

      console.log('Found users:', users);

      // Get all friend relationships for the current user
      const friendships = await Friend.findAll({
        where: {
          [Op.or]: [
            { userid: currentUserId },
            { friendid: currentUserId }
          ]
        }
      });

      // Map users with friendship status
      const usersWithStatus = users.map(user => {
        const friendship = friendships.find(f => 
          (f.userid === user.id && f.friendid === currentUserId) ||
          (f.userid === currentUserId && f.friendid === user.id)
        );

        return {
          ...user.toJSON(),
          friendshipStatus: friendship ? friendship.status : null
        };
      });

      res.json(usersWithStatus);
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({ 
        message: 'Error searching users', 
        error: error.message 
      });
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
        return res.status(400).json({ 
          message: 'Friend request already exists or users are already friends' 
        });
      }

      // Create friend request
      const friendRequest = await Friend.create({
        userid: senderId,
        friendid: receiverId,
        status: 'pending'
      });

      // Create notification for receiver
      await Notification.create({
        userId: receiverId,
        type: 'friend_request',
        message: `You have a new friend request`,
        referenceId: friendRequest.id
      });

      res.json({ message: 'Friend request sent successfully' });
    } catch (error) {
      console.error('Send friend request error:', error);
      res.status(500).json({ message: 'Error sending friend request' });
    }
  },

  // Get pending friend requests
  getPendingRequests: async (req, res) => {
    try {
      const userId = req.user.id;
      const requests = await Friend.findAll({
        where: {
          friendid: userId,
          status: 'pending'
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'department', 'avatar']
        }]
      });
      res.json(requests);
    } catch (error) {
      console.error('Get pending requests error:', error);
      res.status(500).json({ message: 'Error fetching friend requests' });
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

      // Create notification for the sender
      await Notification.create({
        userId: friendRequest.userid,
        type: 'friend_accept',
        message: `Your friend request has been accepted`,
        referenceId: friendRequest.id
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

  // Get friends list
  getFriends: async (req, res) => {
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
          attributes: ['id', 'username', 'department', 'avatar']
        }]
      });

      const formattedFriends = friends.map(friendship => ({
        id: friendship.friend.id,
        username: friendship.friend.username,
        department: friendship.friend.department,
        avatar: friendship.friend.avatar
      }));

      res.json(formattedFriends);
    } catch (error) {
      console.error('Get friends error:', error);
      res.status(500).json({ message: 'Error fetching friends list' });
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