const { Post, User, Comment, Like } = require('../models');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/posts');
  },
  filename: (req, file, cb) => {
    cb(null, `post-${Date.now()}${path.extname(file.originalname)}`);
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
        imageUrl = `/uploads/posts/${req.file.filename}`;
      }

      const post = await Post.create({
        userId,
        caption,
        imageUrl
      });

      const postWithUser = await Post.findOne({
        where: { id: post.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatarUrl']
          }
        ]
      });

      res.status(201).json(postWithUser);
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ message: 'Error creating post' });
    }
  },

  getFeed: async (req, res) => {
    try {
      const posts = await Post.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatarUrl']
          },
          {
            model: Comment,
            as: 'comments',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'avatarUrl']
              }
            ]
          },
          {
            model: Like,
            as: 'likes'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json(posts);
    } catch (error) {
      console.error('Get feed error:', error);
      res.status(500).json({ message: 'Error fetching posts' });
    }
  },

  likePost: async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      const existingLike = await Like.findOne({
        where: { postId, userId }
      });

      if (existingLike) {
        await existingLike.destroy();
        await Post.decrement('likesCount', { where: { id: postId } });
      } else {
        await Like.create({ postId, userId });
        await Post.increment('likesCount', { where: { id: postId } });
      }

      res.json({ message: 'Like updated successfully' });
    } catch (error) {
      console.error('Like post error:', error);
      res.status(500).json({ message: 'Error updating like' });
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