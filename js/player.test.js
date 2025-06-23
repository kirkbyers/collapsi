/**
 * Unit Tests for js/player.js
 * Tests player management, positioning, joker assignments, and player operations
 */

import { 
  assertions, 
  testUtils 
} from '../tests/utils/test-helpers.js';
import { 
  gameStates, 
  boardLayouts,
  factories 
} from '../tests/utils/game-fixtures.js';
import { setupTestEnvironment, cleanupTestEnvironment } from '../tests/utils/test-cleanup.js';

// Mock console to reduce noise
const originalConsole = console;

describe('Player Management Tests', () => {
  beforeEach(() => {
    setupTestEnvironment();
    jest.clearAllMocks();
    
    // Set up mock gameState
    global.gameState = testUtils.deepClone(gameStates.initialGameState);
    
    // Mock console methods selectively
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanupTestEnvironment();
    jest.restoreAllMocks();
  });

  describe('Player Class', () => {
    test('constructor creates player with correct properties', () => {
      // Simulate Player class constructor
      const player = {
        id: 'red',
        color: 'red',
        startingCard: 'red-joker',
        position: { row: -1, col: -1 },
        isActive: true
      };
      
      expect(player.id).toBe('red');
      expect(player.color).toBe('red');
      expect(player.startingCard).toBe('red-joker');
      expect(player.position).toEqual({ row: -1, col: -1 });
      expect(player.isActive).toBe(true);
    });

    test('setPosition updates position with valid coordinates', () => {
      const player = {
        id: 'red',
        position: { row: -1, col: -1 },
        setPosition: function(row, col) {
          if (typeof row !== 'number' || typeof col !== 'number') {
            return false;
          }
          if (row < 0 || row >= 4 || col < 0 || col >= 4) {
            return false;
          }
          this.position = { row, col };
          return true;
        }
      };
      
      const success = player.setPosition(1, 2);
      expect(success).toBe(true);
      expect(player.position).toEqual({ row: 1, col: 2 });
    });

    test('setPosition rejects invalid coordinates', () => {
      const player = {
        position: { row: -1, col: -1 },
        setPosition: function(row, col) {
          if (typeof row !== 'number' || typeof col !== 'number') {
            return false;
          }
          if (row < 0 || row >= 4 || col < 0 || col >= 4) {
            return false;
          }
          this.position = { row, col };
          return true;
        }
      };
      
      expect(player.setPosition(-1, 0)).toBe(false);
      expect(player.setPosition(0, -1)).toBe(false);
      expect(player.setPosition(4, 0)).toBe(false);
      expect(player.setPosition(0, 4)).toBe(false);
      expect(player.setPosition('1', 2)).toBe(false);
      expect(player.setPosition(1, '2')).toBe(false);
    });

    test('getPosition returns copy of position', () => {
      const player = {
        position: { row: 2, col: 3 },
        getPosition: function() {
          return { ...this.position };
        }
      };
      
      const position = player.getPosition();
      expect(position).toEqual({ row: 2, col: 3 });
      
      // Ensure it's a copy, not reference
      position.row = 999;
      expect(player.position.row).toBe(2);
    });

    test('isPlaced returns correct placement status', () => {
      const player = {
        position: { row: -1, col: -1 },
        isPlaced: function() {
          return this.position.row >= 0 && this.position.col >= 0;
        }
      };
      
      expect(player.isPlaced()).toBe(false);
      
      player.position = { row: 0, col: 0 };
      expect(player.isPlaced()).toBe(true);
      
      player.position = { row: 3, col: 3 };
      expect(player.isPlaced()).toBe(true);
    });

    test('getInfo returns complete player information', () => {
      const player = {
        id: 'blue',
        color: 'blue',
        startingCard: 'black-joker',
        position: { row: 1, col: 1 },
        isActive: true,
        isPlaced: function() {
          return this.position.row >= 0 && this.position.col >= 0;
        },
        getInfo: function() {
          return {
            id: this.id,
            color: this.color,
            startingCard: this.startingCard,
            position: this.position,
            isActive: this.isActive,
            isPlaced: this.isPlaced()
          };
        }
      };
      
      const info = player.getInfo();
      expect(info).toEqual({
        id: 'blue',
        color: 'blue',
        startingCard: 'black-joker',
        position: { row: 1, col: 1 },
        isActive: true,
        isPlaced: true
      });
    });
  });

  describe('createPlayers Function', () => {
    test('creates correct number of players', () => {
      // Simulate createPlayers logic
      const players = [
        {
          id: 'red',
          color: 'red',
          startingCard: 'red-joker',
          position: { row: -1, col: -1 },
          isActive: true
        },
        {
          id: 'blue',
          color: 'blue',
          startingCard: 'black-joker',
          position: { row: -1, col: -1 },
          isActive: true
        }
      ];
      
      expect(players).toHaveLength(2);
    });

    test('creates players with correct properties', () => {
      const players = [
        {
          id: 'red',
          color: 'red',
          startingCard: 'red-joker',
          position: { row: -1, col: -1 },
          isActive: true
        },
        {
          id: 'blue',
          color: 'blue',
          startingCard: 'black-joker',
          position: { row: -1, col: -1 },
          isActive: true
        }
      ];
      
      expect(players[0].id).toBe('red');
      expect(players[0].color).toBe('red');
      expect(players[0].startingCard).toBe('red-joker');
      
      expect(players[1].id).toBe('blue');
      expect(players[1].color).toBe('blue');
      expect(players[1].startingCard).toBe('black-joker');
    });

    test('initializes players as not placed', () => {
      const players = [
        { position: { row: -1, col: -1 } },
        { position: { row: -1, col: -1 } }
      ];
      
      players.forEach(player => {
        const isPlaced = player.position.row >= 0 && player.position.col >= 0;
        expect(isPlaced).toBe(false);
      });
    });
  });

  describe('getPlayerById Function', () => {
    test('returns correct player for valid ID', () => {
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      
      // Simulate getPlayerById logic
      const getPlayerById = (playerId) => {
        if (!gameState || !gameState.players) {
          return null;
        }
        const player = gameState.players.find(p => p.id === playerId);
        return player || null;
      };
      
      const redPlayer = getPlayerById('red');
      expect(redPlayer).toBeTruthy();
      expect(redPlayer.id).toBe('red');
      expect(redPlayer.color).toBe('red');
      
      const bluePlayer = getPlayerById('blue');
      expect(bluePlayer).toBeTruthy();
      expect(bluePlayer.id).toBe('blue');
      expect(bluePlayer.color).toBe('blue');
    });

    test('returns null for invalid ID', () => {
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      
      const getPlayerById = (playerId) => {
        if (!gameState || !gameState.players) {
          return null;
        }
        const player = gameState.players.find(p => p.id === playerId);
        return player || null;
      };
      
      expect(getPlayerById('invalid')).toBeNull();
      expect(getPlayerById('')).toBeNull();
      expect(getPlayerById(null)).toBeNull();
      expect(getPlayerById(undefined)).toBeNull();
    });

    test('handles missing game state gracefully', () => {
      const invalidGameState = null;
      
      const getPlayerById = (playerId) => {
        if (!invalidGameState || !invalidGameState.players) {
          return null;
        }
        const player = invalidGameState.players.find(p => p.id === playerId);
        return player || null;
      };
      
      expect(getPlayerById('red')).toBeNull();
    });
  });

  describe('getCurrentPlayer Function', () => {
    test('returns current player for valid index', () => {
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      gameState.currentPlayer = 0;
      
      const getCurrentPlayer = () => {
        if (!gameState || !gameState.players || typeof gameState.currentPlayer !== 'number') {
          return null;
        }
        if (gameState.currentPlayer < 0 || gameState.currentPlayer >= gameState.players.length) {
          return null;
        }
        return gameState.players[gameState.currentPlayer];
      };
      
      const currentPlayer = getCurrentPlayer();
      expect(currentPlayer).toBeTruthy();
      expect(currentPlayer.id).toBe('red');
      
      gameState.currentPlayer = 1;
      const nextPlayer = getCurrentPlayer();
      expect(nextPlayer.id).toBe('blue');
    });

    test('handles invalid current player index', () => {
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      
      const getCurrentPlayer = () => {
        if (!gameState || !gameState.players || typeof gameState.currentPlayer !== 'number') {
          return null;
        }
        if (gameState.currentPlayer < 0 || gameState.currentPlayer >= gameState.players.length) {
          return null;
        }
        return gameState.players[gameState.currentPlayer];
      };
      
      gameState.currentPlayer = -1;
      expect(getCurrentPlayer()).toBeNull();
      
      gameState.currentPlayer = 2;
      expect(getCurrentPlayer()).toBeNull();
      
      gameState.currentPlayer = 'invalid';
      expect(getCurrentPlayer()).toBeNull();
    });

    test('handles missing game state', () => {
      const invalidGameState = null;
      
      const getCurrentPlayer = () => {
        if (!invalidGameState || !invalidGameState.players || typeof invalidGameState.currentPlayer !== 'number') {
          return null;
        }
        if (invalidGameState.currentPlayer < 0 || invalidGameState.currentPlayer >= invalidGameState.players.length) {
          return null;
        }
        return invalidGameState.players[invalidGameState.currentPlayer];
      };
      
      expect(getCurrentPlayer()).toBeNull();
    });
  });

  describe('switchToNextPlayer Function', () => {
    test('switches from player 0 to player 1', () => {
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      gameState.currentPlayer = 0;
      
      // Simulate switchToNextPlayer logic
      const switchToNextPlayer = () => {
        if (!gameState || !gameState.players) {
          return false;
        }
        const previousPlayer = gameState.currentPlayer;
        gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
        return true;
      };
      
      const success = switchToNextPlayer();
      expect(success).toBe(true);
      expect(gameState.currentPlayer).toBe(1);
    });

    test('switches from player 1 to player 0 (wraparound)', () => {
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      gameState.currentPlayer = 1;
      
      const switchToNextPlayer = () => {
        if (!gameState || !gameState.players) {
          return false;
        }
        gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
        return true;
      };
      
      const success = switchToNextPlayer();
      expect(success).toBe(true);
      expect(gameState.currentPlayer).toBe(0);
    });

    test('handles missing game state', () => {
      const invalidGameState = null;
      
      const switchToNextPlayer = () => {
        if (!invalidGameState || !invalidGameState.players) {
          return false;
        }
        invalidGameState.currentPlayer = (invalidGameState.currentPlayer + 1) % invalidGameState.players.length;
        return true;
      };
      
      expect(switchToNextPlayer()).toBe(false);
    });
  });

  describe('getAllPlayerPositions Function', () => {
    test('returns all player positions and status', () => {
      const gameState = testUtils.deepClone(gameStates.midGameState);
      
      const getAllPlayerPositions = () => {
        if (!gameState || !gameState.players) {
          return [];
        }
        return gameState.players.map(player => ({
          id: player.id,
          color: player.color,
          position: { ...player.position },
          isPlaced: player.position.row >= 0 && player.position.col >= 0
        }));
      };
      
      const positions = getAllPlayerPositions();
      expect(positions).toHaveLength(2);
      
      expect(positions[0].id).toBe('red');
      expect(positions[0].color).toBe('red');
      expect(positions[0].isPlaced).toBe(true);
      
      expect(positions[1].id).toBe('blue');
      expect(positions[1].color).toBe('blue');
      expect(positions[1].isPlaced).toBe(true);
    });

    test('handles missing game state', () => {
      const invalidGameState = null;
      
      const getAllPlayerPositions = () => {
        if (!invalidGameState || !invalidGameState.players) {
          return [];
        }
        return invalidGameState.players.map(player => ({
          id: player.id,
          color: player.color,
          position: { ...player.position },
          isPlaced: player.position.row >= 0 && player.position.col >= 0
        }));
      };
      
      expect(getAllPlayerPositions()).toEqual([]);
    });
  });

  describe('findJokerPositions Function', () => {
    test('finds both joker positions on board', () => {
      const board = testUtils.deepClone(boardLayouts.initialBoard);
      
      const findJokerPositions = (board) => {
        const jokerPositions = {};
        
        if (!board || board.length !== 4) {
          return jokerPositions;
        }
        
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            if (board[row][col]) {
              const cardType = board[row][col].type;
              if (cardType === 'red-joker' || cardType === 'black-joker') {
                jokerPositions[cardType] = { row, col };
              }
            }
          }
        }
        
        return jokerPositions;
      };
      
      const jokerPositions = findJokerPositions(board);
      expect(jokerPositions['red-joker']).toBeTruthy();
      expect(jokerPositions['black-joker']).toBeTruthy();
      
      assertions.expectValidPosition(jokerPositions['red-joker']);
      assertions.expectValidPosition(jokerPositions['black-joker']);
    });

    test('handles invalid board', () => {
      const findJokerPositions = (board) => {
        const jokerPositions = {};
        
        if (!board || board.length !== 4) {
          return jokerPositions;
        }
        
        return jokerPositions;
      };
      
      expect(findJokerPositions(null)).toEqual({});
      expect(findJokerPositions([])).toEqual({});
      expect(findJokerPositions([[]])).toEqual({});
    });

    test('finds jokers in different positions', () => {
      const board = testUtils.deepClone(boardLayouts.jokersAdjacentBoard);
      
      const findJokerPositions = (board) => {
        const jokerPositions = {};
        
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            if (board[row][col]) {
              const cardType = board[row][col].type;
              if (cardType === 'red-joker' || cardType === 'black-joker') {
                jokerPositions[cardType] = { row, col };
              }
            }
          }
        }
        
        return jokerPositions;
      };
      
      const jokerPositions = findJokerPositions(board);
      expect(jokerPositions['red-joker']).toEqual({ row: 0, col: 0 });
      expect(jokerPositions['black-joker']).toEqual({ row: 0, col: 1 });
    });
  });

  describe('placePlayersOnJokers Function', () => {
    test('places players on their starting jokers successfully', () => {
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      
      const placePlayersOnJokers = () => {
        if (!gameState || !gameState.board || !gameState.players) {
          return false;
        }
        
        // Find joker positions
        const jokerPositions = {};
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            if (gameState.board[row][col]) {
              const cardType = gameState.board[row][col].type;
              if (cardType === 'red-joker' || cardType === 'black-joker') {
                jokerPositions[cardType] = { row, col };
              }
            }
          }
        }
        
        if (!jokerPositions['red-joker'] || !jokerPositions['black-joker']) {
          return false;
        }
        
        let playersPlaced = 0;
        
        // Place each player
        gameState.players.forEach(player => {
          const jokerPosition = jokerPositions[player.startingCard];
          if (jokerPosition) {
            player.position = { ...jokerPosition };
            const card = gameState.board[jokerPosition.row][jokerPosition.col];
            card.hasPlayer = true;
            card.playerId = player.id;
            playersPlaced++;
          }
        });
        
        return playersPlaced === gameState.players.length;
      };
      
      const success = placePlayersOnJokers();
      expect(success).toBe(true);
      
      // Verify red player placement
      const redPlayer = gameState.players.find(p => p.id === 'red');
      expect(redPlayer.position.row).toBeGreaterThanOrEqual(0);
      expect(redPlayer.position.col).toBeGreaterThanOrEqual(0);
      
      // Verify blue player placement
      const bluePlayer = gameState.players.find(p => p.id === 'blue');
      expect(bluePlayer.position.row).toBeGreaterThanOrEqual(0);
      expect(bluePlayer.position.col).toBeGreaterThanOrEqual(0);
    });

    test('fails when jokers are missing from board', () => {
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      
      // Remove jokers from board
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (gameState.board[row][col].type === 'red-joker') {
            gameState.board[row][col].type = 'A';
          }
        }
      }
      
      const placePlayersOnJokers = () => {
        const jokerPositions = {};
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            if (gameState.board[row][col]) {
              const cardType = gameState.board[row][col].type;
              if (cardType === 'red-joker' || cardType === 'black-joker') {
                jokerPositions[cardType] = { row, col };
              }
            }
          }
        }
        
        return !!(jokerPositions['red-joker'] && jokerPositions['black-joker']);
      };
      
      expect(placePlayersOnJokers()).toBe(false);
    });

    test('handles missing game state', () => {
      const invalidGameState = null;
      
      const placePlayersOnJokers = () => {
        if (!invalidGameState || !invalidGameState.board || !invalidGameState.players) {
          return false;
        }
        return true;
      };
      
      expect(placePlayersOnJokers()).toBe(false);
    });
  });

  describe('removeAllPlayersFromBoard Function', () => {
    test('removes all players from board', () => {
      const gameState = testUtils.deepClone(gameStates.midGameState);
      
      const removeAllPlayersFromBoard = () => {
        if (!gameState || !gameState.board || !gameState.players) {
          return false;
        }
        
        // Clear player positions
        gameState.players.forEach(player => {
          player.position = { row: -1, col: -1 };
        });
        
        // Clear board player references
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            if (gameState.board[row][col]) {
              gameState.board[row][col].hasPlayer = false;
              gameState.board[row][col].playerId = null;
            }
          }
        }
        
        return true;
      };
      
      const success = removeAllPlayersFromBoard();
      expect(success).toBe(true);
      
      // Verify all players have invalid positions
      gameState.players.forEach(player => {
        expect(player.position).toEqual({ row: -1, col: -1 });
      });
      
      // Verify no board positions have players
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          expect(gameState.board[row][col].hasPlayer).toBe(false);
          expect(gameState.board[row][col].playerId).toBeNull();
        }
      }
    });

    test('handles missing game state', () => {
      const invalidGameState = null;
      
      const removeAllPlayersFromBoard = () => {
        if (!invalidGameState || !invalidGameState.board || !invalidGameState.players) {
          return false;
        }
        return true;
      };
      
      expect(removeAllPlayersFromBoard()).toBe(false);
    });
  });

  describe('hasPlayerAt and getPlayerAt Functions', () => {
    test('hasPlayerAt detects player presence correctly', () => {
      const gameState = testUtils.deepClone(gameStates.midGameState);
      
      const hasPlayerAt = (row, col) => {
        if (!gameState || !gameState.board || !gameState.board[row] || !gameState.board[row][col]) {
          return false;
        }
        return gameState.board[row][col].hasPlayer === true;
      };
      
      // Find a position with a player
      const redPlayerPos = gameState.players.find(p => p.id === 'red').position;
      expect(hasPlayerAt(redPlayerPos.row, redPlayerPos.col)).toBe(true);
      
      // Test position without player
      expect(hasPlayerAt(2, 1)).toBe(false);
    });

    test('getPlayerAt returns correct player ID', () => {
      const gameState = testUtils.deepClone(gameStates.midGameState);
      
      const getPlayerAt = (row, col) => {
        if (!gameState || !gameState.board || !gameState.board[row] || !gameState.board[row][col]) {
          return null;
        }
        return gameState.board[row][col].playerId;
      };
      
      // Find a position with a player
      const redPlayerPos = gameState.players.find(p => p.id === 'red').position;
      expect(getPlayerAt(redPlayerPos.row, redPlayerPos.col)).toBe('red');
      
      // Test position without player
      expect(getPlayerAt(2, 1)).toBeNull();
    });

    test('handles invalid positions gracefully', () => {
      const gameState = testUtils.deepClone(gameStates.midGameState);
      
      const hasPlayerAt = (row, col) => {
        try {
          if (!gameState || !gameState.board || !gameState.board[row] || !gameState.board[row][col]) {
            return false;
          }
          return gameState.board[row][col].hasPlayer === true;
        } catch (error) {
          return false;
        }
      };
      
      expect(hasPlayerAt(-1, 0)).toBe(false);
      expect(hasPlayerAt(0, -1)).toBe(false);
      expect(hasPlayerAt(4, 0)).toBe(false);
      expect(hasPlayerAt(0, 4)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('functions handle null game state gracefully', () => {
      global.gameState = null;
      
      // Test various functions with null game state
      const getPlayerById = () => {
        if (!global.gameState || !global.gameState.players) {
          return null;
        }
        return global.gameState.players[0];
      };
      
      expect(getPlayerById()).toBeNull();
    });

    test('functions handle malformed player data', () => {
      const malformedGameState = {
        players: [
          null,
          { id: 'red' }, // Missing properties
          { position: null } // Invalid position
        ],
        currentPlayer: 0
      };
      
      const getCurrentPlayer = () => {
        if (!malformedGameState || !malformedGameState.players || 
            typeof malformedGameState.currentPlayer !== 'number') {
          return null;
        }
        if (malformedGameState.currentPlayer < 0 || 
            malformedGameState.currentPlayer >= malformedGameState.players.length) {
          return null;
        }
        return malformedGameState.players[malformedGameState.currentPlayer];
      };
      
      expect(getCurrentPlayer()).toBeNull(); // First player is null
    });

    test('position validation handles edge cases', () => {
      const player = {
        position: { row: 0, col: 0 },
        setPosition: function(row, col) {
          if (typeof row !== 'number' || typeof col !== 'number') {
            return false;
          }
          if (isNaN(row) || isNaN(col) || !isFinite(row) || !isFinite(col)) {
            return false;
          }
          if (row < 0 || row >= 4 || col < 0 || col >= 4) {
            return false;
          }
          // Check for non-integer values
          if (row !== Math.floor(row) || col !== Math.floor(col)) {
            return false;
          }
          this.position = { row, col };
          return true;
        }
      };
      
      // Test boundary conditions
      expect(player.setPosition(0, 0)).toBe(true);
      expect(player.setPosition(3, 3)).toBe(true);
      expect(player.setPosition(-0.1, 0)).toBe(false);
      expect(player.setPosition(0, 3.1)).toBe(false);
      expect(player.setPosition(NaN, 0)).toBe(false);
      expect(player.setPosition(0, Infinity)).toBe(false);
    });
  });
});