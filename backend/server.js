require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const onlineUsers = new Map();

app.use(cors());
app.use(express.json());
// Serve uploads directory for profile images
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tlsAllowInvalidCertificates: true // Only for local development!
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Basic route
app.get('/', (req, res) => {
  res.send('KraLoan Backend API is running');
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// User routes
app.use('/api/users', require('./routes/user'));
// Group routes
app.use('/api/groups', require('./routes/group'));
// Transaction routes
app.use('/api/transactions', require('./routes/transaction'));

// --- SOCKET.IO REAL-TIME CHAT ---
io.on('connection', (socket) => {
  // Join a group room
  socket.on('joinRoom', ({ roomId, userId }) => {
    socket.join(roomId);
    io.to(roomId).emit('userJoined', { userId });
  });

  // Send a message to a room
  socket.on('sendMessage', ({ roomId, message }) => {
    io.to(roomId).emit('receiveMessage', message);
  });

  // Direct message (user-to-user)
  socket.on('sendDirectMessage', ({ toUserId, message }) => {
    io.to(toUserId).emit('receiveDirectMessage', message);
  });

  // Allow users to join their own socket room for direct messages
  socket.on('registerUser', (userId) => {
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    io.emit('userOnline', userId);
  });

  socket.on('disconnect', () => {
    for (const [userId, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(userId);
        io.emit('userOffline', userId);
        break;
      }
    }
  });

  // Typing indicators for group chat
  socket.on('typing', ({ roomId, user }) => {
    socket.to(roomId).emit('typing', { user });
  });
  socket.on('stopTyping', ({ roomId, user }) => {
    socket.to(roomId).emit('stopTyping', { user });
  });
  // Typing indicators for direct chat
  socket.on('typingDirect', ({ toUserId, user }) => {
    socket.to(toUserId).emit('typingDirect', { user });
  });
  socket.on('stopTypingDirect', ({ toUserId, user }) => {
    socket.to(toUserId).emit('stopTypingDirect', { user });
  });

  // Read receipts for direct chat
  socket.on('readDirectMessages', ({ fromUserId, toUserId }) => {
    io.to(fromUserId).emit('directMessagesRead', { from: fromUserId, to: toUserId });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running with Socket.IO on port ${PORT}`);
});
