require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const onlineUsers = new Map();
const groupController = require('./controllers/groupController');
groupController.setIO(io);

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

console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Basic route
app.get('/', (req, res) => {
  res.send('KraLoan Backend API is running');
});

// Paystack Webhook for automatic transaction syncing
app.post('/api/webhook/paystack', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Verify webhook signature
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (hash !== req.headers['x-paystack-signature']) {
      console.log('Invalid webhook signature');
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;
    console.log('Paystack webhook received:', event.event);

    if (event.event === 'charge.success') {
      const transaction = event.data;
      const reference = transaction.reference;
      const amount = transaction.amount / 100; // Convert from kobo to cedis
      const status = transaction.status;
      const metadata = transaction.metadata;

      console.log('Processing successful payment:', {
        reference,
        amount,
        status,
        metadata
      });

      // Find and update the corresponding contribution
      const Group = require('./models/Group');
      const Transaction = require('./models/Transaction');
      
      // Look for the contribution in all groups
      const groups = await Group.find({
        'contributions.paystackReference': reference
      });

      if (groups.length > 0) {
        const group = groups[0];
        const contribution = group.contributions.find(c => c.paystackReference === reference);
        
        if (contribution && status === 'success') {
          // Update contribution status
          contribution.status = 'completed';
          contribution.verifiedAt = new Date();
          await group.save();

          // Create or update transaction record
          const existingTransaction = await Transaction.findOne({
            'paystackReference': reference
          });

          if (!existingTransaction) {
            const newTransaction = new Transaction({
              user: contribution.user,
              group: group._id,
              type: 'contribution',
              amount: amount,
              status: 'completed',
              method: 'paystack',
              paystackReference: reference,
              date: new Date(),
              reason: 'Group contribution'
            });
            await newTransaction.save();
          } else {
            existingTransaction.status = 'completed';
            existingTransaction.amount = amount;
            await existingTransaction.save();
          }

          // Emit real-time update to group members
          io.to(group._id.toString()).emit('contributionUpdated', {
            groupId: group._id,
            contribution: {
              ...contribution.toObject(),
              amount: amount,
              status: 'completed'
            }
          });

          console.log('Successfully processed Paystack webhook for contribution');
        }
      } else {
        console.log('No group found with this Paystack reference:', reference);
      }
    }

    res.status(200).send('Webhook processed successfully');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Webhook processing failed');
  }
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
