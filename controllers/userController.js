const User = require('../models/user');

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

module.exports = { getAllUsers, createUser, getUserById };
