const { Message, User } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');

// Configure multer for message attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/messages');
  },
  filename: (req, file, cb) => {
    cb(null, `message-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

const messageController = {
  getMessages: async (req, res) => {
    try {
      const userId = req.user.id;
      const { participantId } = req.params;

      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { sender_id: userId, receiver_id: participantId },
            { sender_id: participantId, receiver_id: userId }
          ]
        },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'department']
        }],
        order: [['created_at', 'ASC']]
      });

      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  createChat: async (req, res) => {
    try {
      const userId = req.user.id;
      const { participantId } = req.body;

      // Create initial message
      const message = await Message.create({
        sender_id: userId,
        receiver_id: participantId,
        content: 'Chat started'
      });

      const messageWithUser = await Message.findOne({
        where: { id: message.id },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'department']
        }]
      });

      res.json(messageWithUser);
    } catch (error) {
      console.error('Create chat error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  sendMessage: async (req, res) => {
    try {
      const { receiverId, content } = req.body;
      const senderId = req.user.id;
      let attachmentUrl = null;
      let attachmentType = null;

      if (req.file) {
        attachmentUrl = `/uploads/messages/${req.file.filename}`;
        attachmentType = req.file.mimetype.startsWith('image/') ? 'image' : 
                        req.file.mimetype.startsWith('video/') ? 'video' : 'file';
      }

      const message = await Message.create({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType
      });

      const messageWithUser = await Message.findOne({
        where: { id: message.id },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'avatar']
          }
        ]
      });

      // Emit socket event for real-time messaging
      req.app.io.to(`user_${receiverId}`).emit('new_message', messageWithUser);

      res.status(201).json(messageWithUser);
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ message: 'Error sending message' });
    }
  },

  getMessageHistory: async (req, res) => {
    try {
      const userId = req.user.id;
      const { friendId } = req.params;

      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { sender_id: userId, receiver_id: friendId },
            { sender_id: friendId, receiver_id: userId }
          ]
        },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'avatar']
          }
        ],
        order: [['created_at', 'ASC']]
      });

      res.json(messages);
    } catch (error) {
      console.error('Get message history error:', error);
      res.status(500).json({ message: 'Error fetching message history' });
    }
  },

  getRecentChats: async (req, res) => {
    try {
      const userId = req.user.id;

      // Get the most recent message from each conversation
      const recentChats = await Message.findAll({
        where: {
          [Op.or]: [
            { sender_id: userId },
            { receiver_id: userId }
          ]
        },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'avatar']
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'username', 'avatar']
          }
        ],
        order: [['created_at', 'DESC']],
        group: ['sender_id', 'receiver_id'],
      });

      res.json(recentChats);
    } catch (error) {
      console.error('Get recent chats error:', error);
      res.status(500).json({ message: 'Error fetching recent chats' });
    }
  }
};

module.exports = { messageController, upload }; 