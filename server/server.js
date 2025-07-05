const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const RoomManager = require('./room-manager');
const { createErrorResponse, createSuccessResponse, assignPlayerColors } = require('./utils');

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

// Room statistics endpoint for monitoring
app.get('/stats', (req, res) => {
  const rooms = roomManager.getAllRooms();
  const activeConnections_ = Array.from(activeConnections.values());
  
  res.json({
    timestamp: new Date().toISOString(),
    rooms: {
      total: rooms.length,
      active: rooms.filter(r => !r.gameCompleted).length,
      completed: rooms.filter(r => r.gameCompleted).length,
      full: rooms.filter(r => r.players.length === 2).length
    },
    connections: {
      total: activeConnections_.length,
      inRooms: activeConnections_.filter(c => c.roomCode).length
    },
    memory: {
      roomCount: roomManager.getRoomCount(),
      playerRoomMappings: roomManager.playerRooms.size,
      expirationTimeouts: roomManager.roomExpirationTimeouts.size
    }
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
  
  // Handle room creation
  socket.on('create-room', (data) => {
    console.log(`Room creation request from ${socket.id}:`, data);
    
    try {
      // Check if player is already in a room
      const existingRoom = roomManager.getPlayerRoom(socket.id);
      if (existingRoom) {
        socket.emit('room-error', createErrorResponse(
          'You are already in a room. Leave current room first.',
          'ALREADY_IN_ROOM'
        ));
        return;
      }
      
      // Extract optional room code from data
      const requestedCode = data && data.roomCode ? data.roomCode.trim() : null;
      
      // Create room with optional user-specified code
      const room = roomManager.createRoom(requestedCode, socket.id);
      
      // Add player to room
      room.players.push({
        socketId: socket.id,
        playerId: socket.id,
        color: null, // Will be assigned when second player joins
        isCreator: true,
        joinedAt: new Date()
      });
      
      // Update player room mapping
      roomManager.playerRooms.set(socket.id, room.code);
      
      // Update connection info
      const connectionInfo = activeConnections.get(socket.id);
      if (connectionInfo) {
        connectionInfo.roomCode = room.code;
      }
      
      // Join socket to room for easy broadcasting
      socket.join(room.code);
      
      // Send success response
      socket.emit('room-created', createSuccessResponse({
        roomCode: room.code,
        isCreator: true,
        playerCount: room.players.length,
        maxPlayers: 2
      }, 'Room created successfully'));
      
      console.log(`Room ${room.code} created by ${socket.id}`);
      
    } catch (error) {
      console.error(`Room creation error for ${socket.id}:`, error.message);
      
      let errorCode = 'ROOM_CREATION_FAILED';
      if (error.message.includes('already exists')) {
        errorCode = 'ROOM_CODE_EXISTS';
      } else if (error.message.includes('Invalid room code')) {
        errorCode = 'INVALID_ROOM_CODE';
      }
      
      socket.emit('room-error', createErrorResponse(
        error.message,
        errorCode
      ));
    }
  });
  
  socket.on('join-room', (data) => {
    console.log(`Room join request from ${socket.id}:`, data);
    
    try {
      // Validate request data
      if (!data || !data.roomCode) {
        socket.emit('room-error', createErrorResponse(
          'Room code is required',
          'MISSING_ROOM_CODE'
        ));
        return;
      }
      
      const roomCode = data.roomCode.trim().toUpperCase();
      
      // Check if player is already in a room
      const existingRoom = roomManager.getPlayerRoom(socket.id);
      if (existingRoom) {
        socket.emit('room-error', createErrorResponse(
          'You are already in a room. Leave current room first.',
          'ALREADY_IN_ROOM'
        ));
        return;
      }
      
      // Get room
      const room = roomManager.getRoom(roomCode);
      if (!room) {
        socket.emit('room-error', createErrorResponse(
          'Room not found or expired',
          'ROOM_NOT_FOUND'
        ));
        return;
      }
      
      // Check room capacity (max 2 players)
      if (room.players.length >= 2) {
        socket.emit('room-error', createErrorResponse(
          'Room is full. Maximum 2 players allowed.',
          'ROOM_FULL'
        ));
        return;
      }
      
      // Check if player is already in this room (by current socket ID)
      const alreadyInRoom = room.players.some(player => player.socketId === socket.id);
      if (alreadyInRoom) {
        socket.emit('room-error', createErrorResponse(
          'You are already in this room',
          'ALREADY_IN_THIS_ROOM'
        ));
        return;
      }
      
      // Check if this is a rejoin attempt (room has a disconnected player)
      const disconnectedPlayerIndex = room.players.findIndex(player => 
        player.disconnected === true
      );
      
      let isRejoin = false;
      let rejoinedPlayer = null;
      
      if (disconnectedPlayerIndex !== -1 && room.players.length === 2) {
        // This is a rejoin attempt - restore the disconnected player
        isRejoin = true;
        rejoinedPlayer = room.players[disconnectedPlayerIndex];
        
        // Update the player's socket ID and clear disconnected status
        rejoinedPlayer.socketId = socket.id;
        rejoinedPlayer.disconnected = false;
        rejoinedPlayer.rejoinedAt = new Date();
        delete rejoinedPlayer.disconnectedAt;
        
        console.log(`Player rejoined room ${room.code} with color ${rejoinedPlayer.color}`);
      } else {
        // Normal join - add new player
        const newPlayer = {
          socketId: socket.id,
          playerId: socket.id,
          color: null, // Will be assigned when room becomes full
          isCreator: false,
          joinedAt: new Date(),
          disconnected: false
        };
        
        room.players.push(newPlayer);
      }
      
      // Update player room mapping
      roomManager.playerRooms.set(socket.id, room.code);
      
      // Update connection info
      const connectionInfo = activeConnections.get(socket.id);
      if (connectionInfo) {
        connectionInfo.roomCode = room.code;
      }
      
      // Join socket to room for easy broadcasting
      socket.join(room.code);
      
      // Update room activity
      roomManager.updateRoomActivity(room.code);
      
      // Send success response to joining/rejoining player
      const activePlayerCount = room.players.filter(p => !p.disconnected).length;
      
      if (isRejoin) {
        socket.emit('room-rejoined', createSuccessResponse({
          roomCode: room.code,
          isCreator: rejoinedPlayer.isCreator,
          playerCount: room.players.length,
          activePlayerCount,
          maxPlayers: 2,
          roomFull: room.players.length === 2,
          color: rejoinedPlayer.color,
          gameInProgress: room.gameStarted && !room.gameCompleted
        }, 'Successfully rejoined room'));
        
        // Notify other players about rejoin
        socket.to(room.code).emit('player-rejoined', {
          playerId: rejoinedPlayer.playerId,
          color: rejoinedPlayer.color,
          playerCount: room.players.length,
          activePlayerCount,
          timestamp: new Date().toISOString()
        });
      } else {
        socket.emit('room-joined', createSuccessResponse({
          roomCode: room.code,
          isCreator: false,
          playerCount: room.players.length,
          maxPlayers: 2,
          roomFull: room.players.length === 2
        }, 'Successfully joined room'));
        
        // Notify other players in room
        socket.to(room.code).emit('player-joined', {
          playerId: socket.id,
          playerCount: room.players.length,
          maxPlayers: 2,
          roomFull: room.players.length === 2,
          timestamp: new Date().toISOString()
        });
      }
      
      console.log(`Player ${socket.id} ${isRejoin ? 'rejoined' : 'joined'} room ${room.code} (${room.players.length}/2)`);
      
      // If room is full and colors haven't been assigned yet, assign colors and notify all players
      if (room.players.length === 2 && !isRejoin && room.players.some(p => !p.color)) {
        // Assign random colors to both players (only for new joins, not rejoins)
        const playersWithColors = assignPlayerColors(room.players);
        room.players = playersWithColors;
        
        // Update connection info with colors
        room.players.forEach(player => {
          const conn = activeConnections.get(player.socketId);
          if (conn) {
            conn.playerColor = player.color;
          }
        });
        
        // Notify all players about room being full and color assignments
        const playerData = room.players.map(player => ({
          playerId: player.playerId,
          color: player.color,
          isCreator: player.isCreator
        }));
        
        io.to(room.code).emit('room-full', {
          playerCount: 2,
          message: 'Room is now full. Game can start!',
          players: playerData,
          timestamp: new Date().toISOString()
        });
        
        // Send individual color assignments
        room.players.forEach(player => {
          io.to(player.socketId).emit('color-assigned', {
            color: player.color,
            isYourTurn: player.color === 'red', // Red player starts first
            timestamp: new Date().toISOString()
          });
        });
        
        console.log(`Room ${room.code} is now full. Colors assigned:`, 
          room.players.map(p => `${p.socketId}=${p.color}`).join(', '));
      }
      
    } catch (error) {
      console.error(`Room join error for ${socket.id}:`, error.message);
      socket.emit('room-error', createErrorResponse(
        error.message,
        'ROOM_JOIN_FAILED'
      ));
    }
  });
  
  socket.on('leave-room', () => {
    console.log(`Room leave request from ${socket.id}`);
    
    try {
      const roomCode = roomManager.getPlayerRoom(socket.id);
      if (!roomCode) {
        socket.emit('room-error', createErrorResponse(
          'You are not in any room',
          'NOT_IN_ROOM'
        ));
        return;
      }
      
      const room = roomManager.removePlayerFromRoom(socket.id);
      if (!room) {
        socket.emit('room-error', createErrorResponse(
          'Failed to leave room',
          'LEAVE_ROOM_FAILED'
        ));
        return;
      }
      
      // Update connection info
      const connectionInfo = activeConnections.get(socket.id);
      if (connectionInfo) {
        connectionInfo.roomCode = null;
      }
      
      // Leave socket room
      socket.leave(roomCode);
      
      // Send success response
      socket.emit('room-left', createSuccessResponse({
        roomCode: roomCode,
        playerCount: room.players.length
      }, 'Successfully left room'));
      
      // Notify remaining players
      socket.to(roomCode).emit('player-left', {
        playerId: socket.id,
        playerCount: room.players.length,
        maxPlayers: 2,
        roomFull: false,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Player ${socket.id} left room ${roomCode} (${room.players.length}/2 remaining)`);
      
    } catch (error) {
      console.error(`Room leave error for ${socket.id}:`, error.message);
      socket.emit('room-error', createErrorResponse(
        error.message,
        'LEAVE_ROOM_FAILED'
      ));
    }
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
      const room = roomManager.getRoom(connectionInfo.roomCode);
      if (room) {
        // Mark player as disconnected instead of removing them
        const player = room.players.find(p => p.socketId === socket.id);
        if (player) {
          player.disconnected = true;
          player.disconnectedAt = new Date();
          
          // Update room activity
          roomManager.updateRoomActivity(room.code);
          
          // Notify other players
          socket.to(room.code).emit('player-disconnected', {
            playerId: player.playerId,
            color: player.color,
            canRejoin: true,
            timestamp: new Date().toISOString()
          });
          
          console.log(`Player ${socket.id} (${player.color}) disconnected from room ${room.code}, can rejoin`);
        }
      }
    }
    
    activeConnections.delete(socket.id);
  });
  
  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

const PORT = process.env.PORT || 3000;

// Periodic room cleanup (every 30 seconds)
setInterval(() => {
  const expiredCount = roomManager.cleanupExpiredRooms();
  if (expiredCount > 0) {
    console.log(`Cleaned up ${expiredCount} expired rooms`);
  }
}, 30 * 1000);

server.listen(PORT, () => {
  console.log(`Collapsi server running on port ${PORT}`);
  console.log(`Game available at: http://localhost:${PORT}`);
  console.log(`Room cleanup running every 30 seconds`);
});

module.exports = { app, server, io };