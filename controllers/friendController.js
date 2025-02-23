const { User, Friend, Notification } = require('../models');
const { Op } = require('sequelize');

const friendController = {
  // Search users
  searchUsers: async (req, res) => {
    try {
      const { query } = req.query;
      const currentUserId = req.user.id;

      if (!query) {
        return res.json([]);
      }

      const users = await User.findAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { username: { [Op.iLike]: `%${query}%` } }
              ]
            },
            { id: { [Op.ne]: currentUserId } }
          ]
        },
        attributes: ['id', 'username', 'avatar'],
        limit: 10
      });

      // Get existing friendships
      const friendships = await Friend.findAll({
        where: {
          [Op.or]: [
            { userid: currentUserId },
            { friendid: currentUserId }
          ]
        },
        attributes: ['userid', 'friendid', 'status']
      });

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
      res.status(500).json({ message: 'Error searching users' });
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

  // Get pending requests
  getPendingRequests: async (req, res) => {
    try {
      const userId = req.user.id;

      const pendingRequests = await Friend.findAll({
        where: {
          friendid: userId,
          status: 'pending'
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar']
        }]
      });

      res.json(pendingRequests);
    } catch (error) {
      console.error('Get pending requests error:', error);
      res.status(500).json({ message: 'Error fetching pending requests' });
    }
  },

  // Accept friend request
  acceptFriendRequest: async (req, res) => {
    try {
      const { requestId } = req.params;
      const userId = req.user.id;

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

      // Create notification for sender
      await Notification.create({
        userId: friendRequest.userid,
        type: 'friend_request_accepted',
        message: `Your friend request has been accepted`,
        referenceId: friendRequest.id
      });

      res.json({ message: 'Friend request accepted' });
    } catch (error) {
      console.error('Accept friend request error:', error);
      res.status(500).json({ message: 'Error accepting friend request' });
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
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'department']
          },
          {
            model: User,
            as: 'friend',
            attributes: ['id', 'username', 'department']
          }
        ]
      });

      const formattedFriends = friends.map(friendship => {
        const friend = friendship.userid === userId ? friendship.friend : friendship.user;
        return {
          id: friendship.id,
          friend: {
            id: friend.id,
            username: friend.username,
            department: friend.department
          }
        };
      });

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
      const { friendId } = req.params;

      const friendship = await Friend.findOne({
        where: {
          [Op.or]: [
            { userid: userId, friendid: friendId },
            { userid: friendId, friendid: userId }
          ],
          status: 'accepted'
        }
      });

      if (!friendship) {
        return res.status(404).json({ message: 'Friendship not found' });
      }

      await friendship.destroy();

      res.json({ message: 'Friend removed successfully' });
    } catch (error) {
      console.error('Remove friend error:', error);
      res.status(500).json({ message: 'Error removing friend' });
    }
  },

  // Reject friend request
  rejectFriendRequest: async (req, res) => {
    try {
      const { requestId } = req.params;
      const userId = req.user.id;

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

      await friendRequest.destroy();

      res.json({ message: 'Friend request rejected' });
    } catch (error) {
      console.error('Reject friend request error:', error);
      res.status(500).json({ message: 'Error rejecting friend request' });
    }
  }
};

module.exports = friendController;