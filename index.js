const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const sequelize = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const handleChatSocket = require('./socketHandlers/chatHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for now; restrict in production
  },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);

// Socket.IO setup
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  handleChatSocket(io, socket);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Sync database and start server
const PORT = process.env.PORT || 5000;
sequelize.sync({ force: false }).then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
app.get('/test', (req, res) => {
    res.send('Server is running!');
  });
  