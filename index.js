const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const sequelize = require('./config/database');
const db = require('./models');
const authRoutes = require('./routes/authRoutes');
const friendRoutes = require('./routes/friendRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const path = require('path');
const courseRoutes = require('./routes/courseRoutes');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json()); // Parse JSON request bodies

// Serve static files from the "public" directory
app.use('/courses', express.static(path.join(__dirname, '../public/courses')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/courses', courseRoutes);

// Socket.IO middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  // Join user's personal room
  socket.join(`user_${socket.userId}`);

  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.userId, 'Reason:', reason);
  });

  // Handle reconnection attempts
  socket.on('reconnect_attempt', () => {
    console.log('Reconnection attempt by user:', socket.userId);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Make io accessible to our router
app.io = io;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // First authenticate the database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync models without forcing recreation of tables
    await sequelize.sync({ 
      force: false,
      alter: false
    });
    console.log('Database synchronized successfully');
    
    // Start the server
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();

module.exports = { app, io };