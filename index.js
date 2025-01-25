const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const db = require('./models');
const authRoutes = require('./routes/authRoutes');
const friendRoutes = require('./routes/friendRoutes');
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  },
  // Disable socket.io logging
  logger: false
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);

// Error handling
app.use(errorHandler);

// Simplified socket connection logging
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { senderId, receiverId, content } = data;
      const message = await db.Message.create({
        senderId,
        receiverId,
        content
      });
      io.to(`user_${receiverId}`).emit('newMessage', {
        message,
        sender: await db.User.findByPk(senderId, {
          attributes: ['id', 'username', 'firstName', 'lastName']
        })
      });
    } catch (error) {
      // Silent error handling for messages
    }
  });
});

const PORT = process.env.PORT || 5000;

// Test database connection
db.sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
    return db.sequelize.sync({ alter: true }); // Use alter instead of force for safer updates
  })
  .then(() => {
    console.log('Database synced successfully');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Disable sequelize logging
db.sequelize.options.logging = false;
  