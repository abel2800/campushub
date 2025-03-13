const { Story, User } = require('../models');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');

// Configure multer for story upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/stories'); // Save files in the 'uploads/stories' directory
  },
  filename: (req, file, cb) => {
    cb(null, `story-${Date.now()}${path.extname(file.originalname)}`); // Unique filename
  }
});

const upload = multer({ storage });

const storyController = {
  createStory: async (req, res) => {
    try {
      const { type } = req.body;
      const userId = req.user.id;
      let mediaUrl = null;

      if (req.file) {
        // Save the file path relative to the backend directory
        mediaUrl = `/uploads/stories/${req.file.filename}`;
      }

      const story = await Story.create({
        user_id: userId,
        media_url: mediaUrl,
        type: type || 'image',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
      });

      res.status(201).json(story);
    } catch (error) {
      console.error('Create story error:', error);
      res.status(500).json({ message: 'Error creating story' });
    }
  },

  getFriendStories: async (req, res) => {
    try {
      const userId = req.user.id;

      const stories = await Story.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatarUrl']
          }
        ],
        where: {
          expires_at: { [Op.gt]: new Date() } // Only fetch stories that haven't expired
        },
        order: [['created_at', 'DESC']]
      });

      res.json(stories);
    } catch (error) {
      console.error('Get friend stories error:', error);
      res.status(500).json({ message: 'Error fetching friend stories' });
    }
  }
};

module.exports = { storyController, upload };