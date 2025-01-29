const { Notification } = require('../models');

const notificationController = {
  getNotifications: async (req, res) => {
    try {
      const userId = req.user.id;

      const notifications = await Notification.findAll({
        where: {
          userId,
          read: false
        },
        order: [['createdAt', 'DESC']]
      });

      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  markAsRead: async (req, res) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      await Notification.update(
        { read: true },
        {
          where: {
            id: notificationId,
            userId
          }
        }
      );

      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Mark notification error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = notificationController; 