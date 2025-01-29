const express = require('express');
const router = express.Router();
const { searchUsers } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Search users route
router.get('/search', authMiddleware, (req, res, next) => {
  console.log('Search route hit with query:', req.query);
  console.log('Authenticated user:', req.user);
  searchUsers(req, res).catch(next);
});

module.exports = router;
