const express = require('express');
const User = require('../models/user');
const { getAllUsers, createUser, getUserById } = require('../controllers/userController');
const router = express.Router();

// GET endpoint to fetch all users
router.get('/:id', getUserById);
router.get('/', getAllUsers);
router.post('/', createUser);
  
module.exports = router;
