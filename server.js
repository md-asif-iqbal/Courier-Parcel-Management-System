// backend/server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import parcelRoutes from './routes/parcel.js';
import adminRoutes from './routes/admin.js';

dotenv.config();
const app = express();
const server = http.createServer(app);

// Socket.IO setup
export const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', socket => {
  console.log('🔌 Socket connected:', socket.id);

  // client should emit this after login:
  socket.on('joinRoom', userId => {
    socket.join(userId);
    console.log(`🛎️ Socket ${socket.id} joined room ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error', err));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/admin', adminRoutes);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
