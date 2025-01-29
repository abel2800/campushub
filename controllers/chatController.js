const { Chat, User, Friend, Message } = require('../models');
const { Op } = require('sequelize');

const chatController = {
  getChats: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get list of friends first
      const friends = await Friend.findAll({
        where: {
          [Op.or]: [
            { userId: userId },
            { friendId: userId }
          ]
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatarUrl']
          },
          {
            model: User,
            as: 'friend',
            attributes: ['id', 'username', 'avatarUrl']
          }
        ]
      });

      // Get latest message for each friend
      const chatList = await Promise.all(
        friends.map(async (friendship) => {
          const friendId = friendship.userId === userId ? friendship.friendId : friendship.userId;
          const latestMessage = await Chat.findOne({
            where: {
              [Op.or]: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId }
              ]
            },
            order: [['createdAt', 'DESC']],
            limit: 1
          });

          const unreadCount = await Chat.count({
            where: {
              senderId: friendId,
              receiverId: userId,
              read: false
            }
          });

          return {
            friend: friendship.userId === userId ? friendship.friend : friendship.user,
            latestMessage,
            unreadCount
          };
        })
      );

      res.json(chatList);
    } catch (error) {
      console.error('Get chats error:', error);
      res.status(500).json({ message: 'Error fetching chats' });
    }
  },

  getChatHistory: async (req, res) => {
    try {
      const userId = req.user.id;
      const { friendId } = req.params;

      // Verify they are friends
      const areFriends = await Friend.findOne({
        where: {
          [Op.or]: [
            { userId: userId, friendId: friendId },
            { userId: friendId, friendId: userId }
          ]
        }
      });

      if (!areFriends) {
        return res.status(403).json({ message: 'Not authorized to view this chat' });
      }

      const messages = await Chat.findAll({
        where: {
          [Op.or]: [
            { senderId: userId, receiverId: friendId },
            { senderId: friendId, receiverId: userId }
          ]
        },
        order: [['createdAt', 'ASC']],
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'avatarUrl']
          }
        ]
      });

      res.json(messages);
    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({ message: 'Error fetching chat history' });
    }
  },

  createOrGetChat: async (req, res) => {
    try {
      const { participantId } = req.body;
      const userId = req.user.id;

      // Verify friendship
      const friendship = await Friend.findOne({
        where: {
          [Op.or]: [
            { userId, friendId: participantId },
            { userId: participantId, friendId: userId }
          ]
        }
      });

      if (!friendship) {
        return res.status(400).json({ message: 'You must be friends to start a chat' });
      }

      // Find existing chat or create new one
      let chat = await Chat.findOne({
        where: {
          [Op.or]: [
            { user1_id: userId, user2_id: participantId },
            { user1_id: participantId, user2_id: userId }
          ]
        }
      });

      if (!chat) {
        chat = await Chat.create({
          user1_id: userId,
          user2_id: participantId
        });
      }

      // Get participant details
      const participant = await User.findByPk(participantId, {
        attributes: ['id', 'username', 'department']
      });

      res.json({
        id: chat.id,
        participant
      });

    } catch (error) {
      console.error('Create chat error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getRecentChats: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const chats = await Chat.findAll({
        where: {
          [Op.or]: [
            { user1_id: userId },
            { user2_id: userId }
          ]
        },
        include: [
          {
            model: User,
            as: 'participant',
            attributes: ['id', 'username', 'department'],
            where: {
              id: {
                [Op.not]: userId
              }
            }
          },
          {
            model: Message,
            limit: 1,
            order: [['created_at', 'DESC']],
            as: 'lastMessage'
          }
        ],
        order: [[{ model: Message, as: 'lastMessage' }, 'created_at', 'DESC']]
      });

      res.json(chats);
    } catch (error) {
      console.error('Get recent chats error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getMessages: async (req, res) => {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;

      // Verify chat access
      const chat = await Chat.findOne({
        where: {
          id: chatId,
          [Op.or]: [
            { user1_id: userId },
            { user2_id: userId }
          ]
        }
      });

      if (!chat) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const messages = await Message.findAll({
        where: { chat_id: chatId },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['id', 'username']
        }],
        order: [['created_at', 'ASC']]
      });

      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  sendMessage: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      // Verify chat access
      const chat = await Chat.findOne({
        where: {
          id: chatId,
          [Op.or]: [
            { user1_id: userId },
            { user2_id: userId }
          ]
        }
      });

      if (!chat) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const message = await Message.create({
        chat_id: chatId,
        sender_id: userId,
        content
      });

      const messageWithUser = await Message.findOne({
        where: { id: message.id },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['id', 'username']
        }]
      });

      res.json(messageWithUser);
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  markAsRead: async (req, res) => {
    try {
      const userId = req.user.id;
      const { chatId } = req.params;

      await Chat.update(
        { read: true },
        {
          where: {
            id: chatId,
            receiverId: userId
          }
        }
      );

      res.json({ message: 'Messages marked as read' });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ message: 'Error marking messages as read' });
    }
  }
};

module.exports = chatController; 