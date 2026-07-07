"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const api_1 = __importDefault(require("./routes/api"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable CORS
app.use((0, cors_1.default)({
    origin: '*', // For development flexibility
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express_1.default.json());
// Serve static uploaded files
const uploadDir = path_1.default.join(__dirname, '../uploads');
app.use('/uploads', express_1.default.static(uploadDir));
// HTTP Server
const httpServer = (0, http_1.createServer)(app);
// Socket.IO Integration
const io = new socket_io_1.Server(httpServer, {
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
app.use('/api', api_1.default);
// Base Path check
app.get('/', (req, res) => {
    res.json({ message: 'GXA Technologies Logistics ERP Backend API is running successfully.' });
});
// Run server
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
