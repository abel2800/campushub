const db = require('../models');
const { Op } = require('sequelize');

const searchUsers = async (req, res) => {
  try {
    const { username } = req.query;
    console.log('Search request received:', { 
      searchTerm: username,
      currentUserId: req.user?.id 
    });

    if (!username || username.trim().length < 1) {
      console.log('Empty search term, returning empty array');
      return res.json([]);
    }

    // Log the query we're about to execute
    console.log('Executing search query with parameters:', {
      searchTerm: username,
      excludeUserId: req.user?.id
    });

    const users = await db.User.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { username: { [Op.iLike]: `%${username}%` } },
              { firstName: { [Op.iLike]: `%${username}%` } },
              { lastName: { [Op.iLike]: `%${username}%` } }
            ]
          },
          {
            id: { [Op.ne]: req.user?.id }
          }
        ]
      },
      attributes: ['id', 'username', 'firstName', 'lastName'],
      raw: true
    });

    console.log('Search results:', {
      count: users.length,
      users: users
    });

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    // Check if request already exists
    const existingRequest = await db.Friend.findOne({
      where: {
        [Op.or]: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    // Create friend request
    const friendRequest = await db.Friend.create({
      senderId,
      receiverId,
      status: 'pending'
    });

    res.json(friendRequest);
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Error sending friend request' });
  }
};

const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await db.Friend.findAll({
      where: {
        receiverId: userId,
        status: 'pending'
      },
      include: [{
        model: db.User,
        as: 'sender',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }]
    });

    res.json(requests);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Error fetching friend requests' });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await db.Friend.findOne({
      where: {
        id: requestId,
        receiverId: userId,
        status: 'pending'
      }
    });

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    await request.update({ status: 'accepted' });
    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Error accepting friend request' });
  }
};

const getFriendsList = async (req, res) => {
  try {
    const userId = req.user.id;

    const friends = await db.Friend.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: [{
        model: db.User,
        as: 'sender',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }, {
        model: db.User,
        as: 'receiver',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }]
    });

    const formattedFriends = friends.map(friend => {
      const otherUser = friend.senderId === userId ? friend.receiver : friend.sender;
      return {
        id: friend.id,
        friendId: otherUser.id,
        username: otherUser.username,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName
      };
    });

    res.json(formattedFriends);
  } catch (error) {
    console.error('Get friends list error:', error);
    res.status(500).json({ message: 'Error fetching friends list' });
  }
};

module.exports = {
  searchUsers,
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  getFriendsList
}; 