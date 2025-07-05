const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const RoomManager = require('./room-manager');
const { createErrorResponse, createSuccessResponse } = require('./utils');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Enable CORS for all routes
app.use(cors());

// Serve static files from the project root
app.use(express.static(path.join(__dirname, '..')));

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// WebSocket connection handling
const activeConnections = new Map();
const roomManager = new RoomManager();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Store connection info
  activeConnections.set(socket.id, {
    id: socket.id,
    connectedAt: new Date(),
    roomCode: null,
    playerColor: null
  });
  
  // Send connection confirmation
  socket.emit('connected', {
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });
  
  // Handle room-related events (will be implemented in next subtasks)
  socket.on('create-room', (data) => {
    console.log(`Room creation request from ${socket.id}:`, data);
    // Implementation coming in subtask 1.4
  });
  
  socket.on('join-room', (data) => {
    console.log(`Room join request from ${socket.id}:`, data);
    // Implementation coming in subtask 1.7
  });
  
  socket.on('leave-room', () => {
    console.log(`Room leave request from ${socket.id}`);
    // Implementation coming in subtask 1.7
  });
  
  // Handle game moves (will be implemented in later tasks)
  socket.on('player-move', (data) => {
    console.log(`Move from ${socket.id}:`, data);
    // Implementation coming in task 4.0
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    
    const connectionInfo = activeConnections.get(socket.id);
    if (connectionInfo && connectionInfo.roomCode) {
      // Handle room cleanup when player disconnects
      console.log(`Player ${socket.id} disconnected from room ${connectionInfo.roomCode}`);
      // Room cleanup implementation coming in subtask 1.10
    }
    
    activeConnections.delete(socket.id);
  });
  
  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Collapsi server running on port ${PORT}`);
  console.log(`Game available at: http://localhost:${PORT}`);
});

module.exports = { app, server, io };