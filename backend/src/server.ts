import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import apiRoutes from './routes/api';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // For development flexibility
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

// Serve static uploaded files
const uploadDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

// HTTP Server
const httpServer = createServer(app);

// Socket.IO Integration
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('joinShipment', (shipmentNumber) => {
    socket.join(shipmentNumber);
    console.log(`Client ${socket.id} joined tracking room: ${shipmentNumber}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Bind socket instance globally
app.set('io', io);

// API Routing
app.use('/api', apiRoutes);

// Base Path check
app.get('/', (req, res) => {
  res.json({ message: 'GXA Technologies Logistics ERP Backend API is running successfully.' });
});

// Run server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
