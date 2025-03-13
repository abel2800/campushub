const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Friend } = require('../models');
const auth = require('../middleware/authMiddleware');

// Search users route
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;

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
              [Op.ne]: userId
            }
          }
        ]
      },
      attributes: ['id', 'username', 'department']
    });

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
});

module.exports = router;
