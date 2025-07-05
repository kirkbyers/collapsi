// Server utility functions for Collapsi online multiplayer

// Basic profanity word list for filtering auto-generated room codes
const PROFANITY_WORDS = [
  'DAMN', 'HELL', 'CRAP', 'SHIT', 'FUCK', 'BITCH', 'ASS', 'DICK',
  'HATE', 'KILL', 'DIE', 'DEAD', 'NAZI', 'RAPE', 'SEX', 'PORN',
  'DRUG', 'WEED', 'BEER', 'WINE', 'VODKA', 'METH', 'COCK', 'TITS',
  'SLUT', 'WHORE', 'FART', 'PISS', 'SUCK', 'BLOW', 'MOAN', 'NUDE'
];

// Check if a string contains profanity
function containsProfanity(text) {
  if (!text || typeof text !== 'string') return false;
  
  const upperText = text.toUpperCase();
  
  return PROFANITY_WORDS.some(word => upperText.includes(word));
}

// Generate a random color assignment
function getRandomPlayerColor() {
  return Math.random() < 0.5 ? 'red' : 'blue';
}

// Assign colors to players (ensuring they get different colors)
function assignPlayerColors(players) {
  if (players.length === 0) return [];
  if (players.length === 1) {
    const color = getRandomPlayerColor();
    return [{ ...players[0], color }];
  }
  
  // For 2 players, randomly assign one red and one blue
  const colors = ['red', 'blue'];
  const shuffledColors = colors.sort(() => Math.random() - 0.5);
  
  return players.map((player, index) => ({
    ...player,
    color: shuffledColors[index]
  }));
}

// Validate player move data structure
function isValidMoveData(moveData) {
  if (!moveData || typeof moveData !== 'object') return false;
  
  // Check required fields
  const requiredFields = ['fromRow', 'fromCol', 'toRow', 'toCol', 'playerId'];
  for (const field of requiredFields) {
    if (!(field in moveData)) return false;
  }
  
  // Check field types and ranges
  const { fromRow, fromCol, toRow, toCol, playerId } = moveData;
  
  if (typeof fromRow !== 'number' || fromRow < 0 || fromRow > 3) return false;
  if (typeof fromCol !== 'number' || fromCol < 0 || fromCol > 3) return false;
  if (typeof toRow !== 'number' || toRow < 0 || toRow > 3) return false;
  if (typeof toCol !== 'number' || toCol < 0 || toCol > 3) return false;
  if (typeof playerId !== 'string' || playerId.length === 0) return false;
  
  return true;
}

// Generate a timestamp string
function getTimestamp() {
  return new Date().toISOString();
}

// Calculate time difference in milliseconds
function getTimeDiff(startTime, endTime = new Date()) {
  return endTime.getTime() - startTime.getTime();
}

// Format time duration for logging
function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// Sanitize input strings
function sanitizeInput(input, maxLength = 100) {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

// Create error response object
function createErrorResponse(message, code = 'UNKNOWN_ERROR', details = null) {
  return {
    error: true,
    message: sanitizeInput(message),
    code,
    details,
    timestamp: getTimestamp()
  };
}

// Create success response object
function createSuccessResponse(data = null, message = 'Success') {
  return {
    success: true,
    message,
    data,
    timestamp: getTimestamp()
  };
}

module.exports = {
  containsProfanity,
  getRandomPlayerColor,
  assignPlayerColors,
  isValidMoveData,
  getTimestamp,
  getTimeDiff,
  formatDuration,
  sanitizeInput,
  createErrorResponse,
  createSuccessResponse
};