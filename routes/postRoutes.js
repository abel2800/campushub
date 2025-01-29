const express = require('express');
const router = express.Router();
const { postController, upload } = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Post routes
router.post('/create', upload.single('image'), postController.createPost);
router.get('/feed', postController.getFeed);
router.post('/:postId/like', postController.likePost);
router.post('/:postId/comment', postController.addComment);

module.exports = router; 