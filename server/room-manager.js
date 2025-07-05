// Room management system for Collapsi online multiplayer

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomCode -> room object
    this.playerRooms = new Map(); // socketId -> roomCode
    this.roomExpirationTimeouts = new Map(); // roomCode -> timeout ID
  }
  
  // Generate a 6-digit alphanumeric room code
  generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
  }
  
  // Generate a unique room code that doesn't exist yet
  generateUniqueRoomCode() {
    let code;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      code = this.generateRoomCode();
      attempts++;
      
      if (attempts > maxAttempts) {
        throw new Error('Unable to generate unique room code after maximum attempts');
      }
    } while (this.rooms.has(code));
    
    return code;
  }
  
  // Validate room code format (6 characters, alphanumeric)
  isValidRoomCode(code) {
    if (typeof code !== 'string') return false;
    if (code.length !== 6) return false;
    return /^[A-Za-z0-9]{6}$/.test(code);
  }
  
  // Create a new room
  createRoom(roomCode = null, creatorSocketId = null) {
    // Use provided code or generate new one
    const code = roomCode || this.generateUniqueRoomCode();
    
    // Validate the code format
    if (!this.isValidRoomCode(code)) {
      throw new Error('Invalid room code format');
    }
    
    // Check if room already exists
    if (this.rooms.has(code.toUpperCase())) {
      throw new Error('Room code already exists');
    }
    
    const normalizedCode = code.toUpperCase();
    
    // Create room object
    const room = {
      code: normalizedCode,
      players: [],
      createdAt: new Date(),
      lastActivity: new Date(),
      gameState: null,
      gameStarted: false,
      gameCompleted: false,
      gameCompletedAt: null,
      creatorSocketId
    };
    
    this.rooms.set(normalizedCode, room);
    
    // Set up automatic room expiration (5 minutes of inactivity)
    this.scheduleRoomExpiration(normalizedCode);
    
    console.log(`Room created: ${normalizedCode}`);
    return room;
  }
  
  // Get room by code
  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(code.toUpperCase()) || null;
  }
  
  // Check if room exists
  roomExists(code) {
    if (!code) return false;
    return this.rooms.has(code.toUpperCase());
  }
  
  // Get all active rooms (for debugging/monitoring)
  getAllRooms() {
    return Array.from(this.rooms.values());
  }
  
  // Get room count
  getRoomCount() {
    return this.rooms.size;
  }
  
  // Update room's last activity timestamp
  updateRoomActivity(code) {
    const room = this.getRoom(code);
    if (room) {
      room.lastActivity = new Date();
      
      // Reset expiration timer
      this.scheduleRoomExpiration(code.toUpperCase());
    }
  }
  
  // Schedule room expiration
  scheduleRoomExpiration(code) {
    const normalizedCode = code.toUpperCase();
    
    // Clear existing timeout
    if (this.roomExpirationTimeouts.has(normalizedCode)) {
      clearTimeout(this.roomExpirationTimeouts.get(normalizedCode));
    }
    
    const room = this.getRoom(normalizedCode);
    if (!room) return;
    
    // Calculate timeout duration
    let timeoutDuration;
    if (room.gameCompleted) {
      // 1 minute after game completion
      timeoutDuration = 60 * 1000;
    } else {
      // 5 minutes of inactivity
      timeoutDuration = 5 * 60 * 1000;
    }
    
    // Set new timeout
    const timeoutId = setTimeout(() => {
      this.expireRoom(normalizedCode);
    }, timeoutDuration);
    
    this.roomExpirationTimeouts.set(normalizedCode, timeoutId);
  }
  
  // Expire and remove a room
  expireRoom(code) {
    const normalizedCode = code.toUpperCase();
    const room = this.getRoom(normalizedCode);
    
    if (!room) return;
    
    console.log(`Room expired: ${normalizedCode}`);
    
    // Remove player-room mappings
    room.players.forEach(player => {
      this.playerRooms.delete(player.socketId);
    });
    
    // Clear timeout
    if (this.roomExpirationTimeouts.has(normalizedCode)) {
      clearTimeout(this.roomExpirationTimeouts.get(normalizedCode));
      this.roomExpirationTimeouts.delete(normalizedCode);
    }
    
    // Remove room
    this.rooms.delete(normalizedCode);
    
    return true;
  }
  
  // Get player's current room code
  getPlayerRoom(socketId) {
    return this.playerRooms.get(socketId) || null;
  }
  
  // Remove player from their current room
  removePlayerFromRoom(socketId) {
    const roomCode = this.getPlayerRoom(socketId);
    if (!roomCode) return null;
    
    const room = this.getRoom(roomCode);
    if (!room) return null;
    
    // Remove player from room
    room.players = room.players.filter(player => player.socketId !== socketId);
    this.playerRooms.delete(socketId);
    
    // Update activity
    this.updateRoomActivity(roomCode);
    
    // If room is empty, schedule faster expiration
    if (room.players.length === 0) {
      this.scheduleRoomExpiration(roomCode);
    }
    
    return room;
  }
  
  // Clean up expired rooms (manual cleanup)
  cleanupExpiredRooms() {
    const now = new Date();
    const roomsToExpire = [];
    
    for (const [code, room] of this.rooms) {
      const timeSinceActivity = now - room.lastActivity;
      
      let expirationTime;
      if (room.gameCompleted) {
        expirationTime = 60 * 1000; // 1 minute
      } else {
        expirationTime = 5 * 60 * 1000; // 5 minutes
      }
      
      if (timeSinceActivity > expirationTime) {
        roomsToExpire.push(code);
      }
    }
    
    roomsToExpire.forEach(code => this.expireRoom(code));
    
    return roomsToExpire.length;
  }
}

module.exports = RoomManager;