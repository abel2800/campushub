const { User, FriendRequest, Friend } = require('../models');
const { Op } = require('sequelize');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

const getUserById = async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id)
      const user = await User.findByPk(id);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching users' });
    }
  };
  

// Add a new user
const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = await User.create({ username, email, password });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user.id; // Get current user's ID from auth

    // Get list of friend IDs for the current user
    const friendships = await Friend.findAll({
      where: {
        [Op.or]: [
          { userid: currentUserId },
          { friendid: currentUserId }
        ]
      }
    });

    // Extract friend IDs from both userid and friendid columns
    const friendIds = friendships.map(f => 
      f.userid === currentUserId ? f.friendid : f.userid
    );

    // Search users excluding current user and their friends
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
              [Op.notIn]: [currentUserId, ...friendIds]
            }
          }
        ]
      },
      limit: 10
    });

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
};

const userController = { getAllUsers, createUser, getUserById, searchUsers };

module.exports = userController;
