const { Post, User, Comment, Like } = require('../models');
const multer = require('multer');
const path = require('path');

// Configure multer for post upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/posts'); // Save files in the 'uploads/posts' directory
  },
  filename: (req, file, cb) => {
    cb(null, `post-${Date.now()}${path.extname(file.originalname)}`); // Unique filename
  }
});

const upload = multer({ storage });

const postController = {
  createPost: async (req, res) => {
    try {
      const { caption } = req.body;
      const userId = req.user.id;
      let imageUrl = null;

      if (req.file) {
        // Save the file path relative to the backend directory
        imageUrl = `/uploads/posts/${req.file.filename}`;
      }

      const post = await Post.create({
        user_id: userId,
        caption,
        image_url: imageUrl
      });

      res.status(201).json(post);
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ message: 'Error creating post' });
    }
  },

  getFeed: async (req, res) => {
    try {
      const userId = req.user.id;

      const posts = await Post.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username']
          },
          {
            model: Like,
            as: 'likes'
          },
          {
            model: Comment,
            as: 'comments',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json(posts);
    } catch (error) {
      console.error('Get feed error:', error);
      res.status(500).json({ message: 'Error fetching feed' });
    }
  },

  likePost: async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      await Like.create({
        user_id: userId,
        post_id: postId
      });

      res.json({ message: 'Post liked successfully' });
    } catch (error) {
      console.error('Like post error:', error);
      res.status(500).json({ message: 'Error liking post' });
    }
  },

  addComment: async (req, res) => {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      const comment = await Comment.create({
        content,
        postId,
        userId
      });

      await Post.increment('commentsCount', { where: { id: postId } });

      const commentWithUser = await Comment.findOne({
        where: { id: comment.id },
        include: [
          {
            model: User,
            attributes: ['username', 'avatarUrl']
          }
        ]
      });

      res.status(201).json(commentWithUser);
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ message: 'Error adding comment' });
    }
  }
};

module.exports = { postController, upload };