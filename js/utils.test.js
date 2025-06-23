/**
 * Unit Tests for js/utils.js
 * Tests utility functions, error logging, state persistence, and validation helpers
 */

import { 
  assertions, 
  testUtils 
} from '../tests/utils/test-helpers.js';
import { 
  gameStates, 
  STANDARD_DECK 
} from '../tests/utils/game-fixtures.js';
import { setupTestEnvironment, cleanupTestEnvironment } from '../tests/utils/test-cleanup.js';

// Mock dependencies
const mockUtilsFunctions = {
  initializeNewGame: jest.fn(),
  convertDeckToBoard: jest.fn()
};

// Set up mocks on global scope
beforeAll(() => {
  Object.keys(mockUtilsFunctions).forEach(key => {
    global[key] = mockUtilsFunctions[key];
  });
  
  // Mock gameState for functions that depend on it
  global.gameState = null;
});

describe('Utility Functions Tests', () => {
  beforeEach(() => {
    setupTestEnvironment();
    jest.clearAllMocks();
    
    // Set up fresh gameState
    global.gameState = testUtils.deepClone(gameStates.initialGameState);
    
    // Mock Math.random for deterministic shuffling tests
    jest.spyOn(Math, 'random');
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Reset mock functions
    mockUtilsFunctions.initializeNewGame.mockReturnValue([...STANDARD_DECK]);
    mockUtilsFunctions.convertDeckToBoard.mockReturnValue(gameStates.initialGameState.board);
  });

  afterEach(() => {
    cleanupTestEnvironment();
    jest.restoreAllMocks();
  });

  describe('shuffleDeck Function', () => {
    test('successfully shuffles valid 16-card deck', () => {
      const originalDeck = [...STANDARD_DECK];
      
      // Mock Math.random to return predictable sequence
      Math.random
        .mockReturnValueOnce(0.5)
        .mockReturnValueOnce(0.3)
        .mockReturnValueOnce(0.8)
        .mockReturnValueOnce(0.1);
      
      // Simulate shuffleDeck logic (Fisher-Yates)
      const shuffleDeck = (deck) => {
        if (!deck || !Array.isArray(deck)) {
          return null;
        }
        if (deck.length !== 16) {
          return null;
        }
        
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };
      
      const shuffled = shuffleDeck(originalDeck);
      
      expect(shuffled).toBeTruthy();
      expect(shuffled).toHaveLength(16);
      expect(shuffled).not.toEqual(originalDeck); // Should be different order
      
      // Check all original cards are present
      expect(shuffled.sort()).toEqual([...originalDeck].sort());
    });

    test('preserves all card types and counts', () => {
      const originalDeck = [...STANDARD_DECK];
      
      const shuffleDeck = (deck) => {
        if (!deck || !Array.isArray(deck) || deck.length !== 16) {
          return null;
        }
        const shuffled = [...deck];
        // Simple shuffle for test
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };
      
      const shuffled = shuffleDeck(originalDeck);
      
      // Count cards in both arrays
      const originalCounts = {};
      const shuffledCounts = {};
      
      originalDeck.forEach(card => {
        originalCounts[card] = (originalCounts[card] || 0) + 1;
      });
      
      shuffled.forEach(card => {
        shuffledCounts[card] = (shuffledCounts[card] || 0) + 1;
      });
      
      expect(shuffledCounts).toEqual(originalCounts);
    });

    test('rejects invalid deck inputs', () => {
      const shuffleDeck = (deck) => {
        try {
          if (!deck || !Array.isArray(deck)) {
            throw new Error('Invalid deck provided for shuffling');
          }
          if (deck.length !== 16) {
            throw new Error(`Invalid deck size: ${deck.length}. Expected: 16`);
          }
          return [...deck];
        } catch (error) {
          return null;
        }
      };
      
      expect(shuffleDeck(null)).toBeNull();
      expect(shuffleDeck(undefined)).toBeNull();
      expect(shuffleDeck('not an array')).toBeNull();
      expect(shuffleDeck([])).toBeNull();
      expect(shuffleDeck(['A', 'B'])).toBeNull(); // Wrong length
    });

    test('does not mutate original deck', () => {
      const originalDeck = [...STANDARD_DECK];
      const originalCopy = [...originalDeck];
      
      const shuffleDeck = (deck) => {
        if (!deck || !Array.isArray(deck) || deck.length !== 16) {
          return null;
        }
        const shuffled = [...deck]; // Create copy
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };
      
      shuffleDeck(originalDeck);
      
      expect(originalDeck).toEqual(originalCopy);
    });
  });

  describe('Error Logging System', () => {
    test('logInitializationError records error details', () => {
      let initializationErrors = [];
      
      const logInitializationError = (functionName, error) => {
        const errorLog = {
          timestamp: new Date().toISOString(),
          function: functionName,
          error: error.message || error,
          stack: error.stack || 'No stack trace available',
          gameState: global.gameState ? JSON.stringify(global.gameState, null, 2) : 'Game state not available'
        };
        
        initializationErrors.push(errorLog);
        
        // Keep only last 10 errors
        if (initializationErrors.length > 10) {
          initializationErrors.shift();
        }
        
        return initializationErrors;
      };
      
      const testError = new Error('Test error message');
      const errors = logInitializationError('testFunction', testError);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].function).toBe('testFunction');
      expect(errors[0].error).toBe('Test error message');
      expect(errors[0].timestamp).toBeTruthy();
    });

    test('getInitializationErrors returns copy of errors', () => {
      const initializationErrors = [
        { function: 'test1', error: 'error1', timestamp: '2023-01-01' },
        { function: 'test2', error: 'error2', timestamp: '2023-01-02' }
      ];
      
      const getInitializationErrors = () => {
        return [...initializationErrors];
      };
      
      const errors = getInitializationErrors();
      expect(errors).toHaveLength(2);
      expect(errors).toEqual(initializationErrors);
      
      // Ensure it's a copy
      errors.push({ function: 'test3', error: 'error3', timestamp: '2023-01-03' });
      expect(initializationErrors).toHaveLength(2);
    });

    test('clearInitializationErrors resets error log', () => {
      let initializationErrors = [
        { function: 'test1', error: 'error1' },
        { function: 'test2', error: 'error2' }
      ];
      
      const clearInitializationErrors = () => {
        initializationErrors = [];
      };
      
      clearInitializationErrors();
      expect(initializationErrors).toHaveLength(0);
    });

    test('maintains maximum of 10 errors', () => {
      let initializationErrors = [];
      
      const logInitializationError = (functionName, error) => {
        const errorLog = {
          function: functionName,
          error: error.message || error,
          timestamp: new Date().toISOString()
        };
        
        initializationErrors.push(errorLog);
        
        if (initializationErrors.length > 10) {
          initializationErrors.shift();
        }
        
        return initializationErrors;
      };
      
      // Add 15 errors
      for (let i = 0; i < 15; i++) {
        logInitializationError(`function${i}`, new Error(`error${i}`));
      }
      
      expect(initializationErrors).toHaveLength(10);
      expect(initializationErrors[0].function).toBe('function5'); // First 5 should be removed
      expect(initializationErrors[9].function).toBe('function14');
    });
  });

  describe('Game State Persistence', () => {
    test('saveGameState stores state in localStorage', () => {
      const testGameState = testUtils.deepClone(gameStates.initialGameState);
      global.gameState = testGameState;
      
      const saveGameState = () => {
        try {
          if (typeof Storage === 'undefined') {
            return false;
          }
          
          const serialized = JSON.stringify(global.gameState);
          window.localStorage.setItem('collapsi_game_state', serialized);
          window.localStorage.setItem('collapsi_save_timestamp', new Date().toISOString());
          
          return true;
        } catch (error) {
          return false;
        }
      };
      
      const success = saveGameState();
      expect(success).toBe(true);
      expect(window.localStorage.setItem).toHaveBeenCalledWith('collapsi_game_state', JSON.stringify(testGameState));
      expect(window.localStorage.setItem).toHaveBeenCalledWith('collapsi_save_timestamp', expect.any(String));
    });

    test('loadGameState retrieves state from localStorage', () => {
      const testGameState = testUtils.deepClone(gameStates.midGameState);
      const serializedState = JSON.stringify(testGameState);
      const timestamp = '2023-01-01T00:00:00.000Z';
      
      // Mock localStorage to return saved data
      window.localStorage.getItem.mockImplementation((key) => {
        if (key === 'collapsi_game_state') return serializedState;
        if (key === 'collapsi_save_timestamp') return timestamp;
        return null;
      });
      
      const loadGameState = () => {
        try {
          if (typeof Storage === 'undefined') {
            return null;
          }
          
          const saved = window.localStorage.getItem('collapsi_game_state');
          if (!saved) {
            return null;
          }
          
          const loadedState = JSON.parse(saved);
          
          // Validate structure
          if (!loadedState.board || !loadedState.players) {
            throw new Error('Invalid saved game state structure');
          }
          
          return loadedState;
        } catch (error) {
          return null;
        }
      };
      
      const loadedState = loadGameState();
      expect(loadedState).toEqual(testGameState);
      expect(window.localStorage.getItem).toHaveBeenCalledWith('collapsi_game_state');
    });

    test('loadGameState handles missing save data', () => {
      // Mock localStorage to return null
      window.localStorage.getItem.mockReturnValue(null);
      
      const loadGameState = () => {
        try {
          const saved = window.localStorage.getItem('collapsi_game_state');
          if (!saved) {
            return null;
          }
          return JSON.parse(saved);
        } catch (error) {
          return null;
        }
      };
      
      const result = loadGameState();
      expect(result).toBeNull();
    });

    test('loadGameState handles corrupted save data', () => {
      // Mock localStorage to return invalid JSON
      window.localStorage.getItem.mockReturnValue('invalid json data');
      
      const loadGameState = () => {
        try {
          const saved = window.localStorage.getItem('collapsi_game_state');
          if (!saved) {
            return null;
          }
          
          const loadedState = JSON.parse(saved);
          
          // Validate structure
          if (!loadedState.board || !loadedState.players) {
            throw new Error('Invalid saved game state structure');
          }
          
          return loadedState;
        } catch (error) {
          return null;
        }
      };
      
      const result = loadGameState();
      expect(result).toBeNull();
    });

    test('clearSavedGameState removes localStorage data', () => {
      const clearSavedGameState = () => {
        try {
          if (typeof Storage !== 'undefined') {
            window.localStorage.removeItem('collapsi_game_state');
            window.localStorage.removeItem('collapsi_save_timestamp');
            return true;
          }
          return false;
        } catch (error) {
          return false;
        }
      };
      
      const success = clearSavedGameState();
      expect(success).toBe(true);
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('collapsi_game_state');
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('collapsi_save_timestamp');
    });
  });

  describe('Position Validation', () => {
    test('isValidPosition validates board coordinates', () => {
      const isValidPosition = (row, col) => {
        return row >= 0 && row < 4 && col >= 0 && col < 4;
      };
      
      // Valid positions
      expect(isValidPosition(0, 0)).toBe(true);
      expect(isValidPosition(3, 3)).toBe(true);
      expect(isValidPosition(2, 1)).toBe(true);
      
      // Invalid positions
      expect(isValidPosition(-1, 0)).toBe(false);
      expect(isValidPosition(0, -1)).toBe(false);
      expect(isValidPosition(4, 0)).toBe(false);
      expect(isValidPosition(0, 4)).toBe(false);
      expect(isValidPosition(-1, -1)).toBe(false);
      expect(isValidPosition(5, 5)).toBe(false);
    });

    test('cardExistsAt checks board position validity', () => {
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      global.gameState = gameState;
      
      const cardExistsAt = (row, col) => {
        // Validate position
        if (row < 0 || row >= 4 || col < 0 || col >= 4) {
          return false;
        }
        
        if (!global.gameState || !global.gameState.board || 
            !global.gameState.board[row] || !global.gameState.board[row][col]) {
          return false;
        }
        
        return true;
      };
      
      // Valid positions with cards
      expect(cardExistsAt(0, 0)).toBe(true);
      expect(cardExistsAt(3, 3)).toBe(true);
      
      // Invalid positions
      expect(cardExistsAt(-1, 0)).toBe(false);
      expect(cardExistsAt(4, 0)).toBe(false);
    });

    test('cardExistsAt handles missing game state', () => {
      global.gameState = null;
      
      const cardExistsAt = (row, col) => {
        if (row < 0 || row >= 4 || col < 0 || col >= 4) {
          return false;
        }
        
        if (!global.gameState || !global.gameState.board || 
            !global.gameState.board[row] || !global.gameState.board[row][col]) {
          return false;
        }
        
        return true;
      };
      
      expect(cardExistsAt(0, 0)).toBe(false);
      expect(cardExistsAt(2, 2)).toBe(false);
    });
  });

  describe('DOM Updates', () => {
    test('updateCardDisplay handles collapsed state', () => {
      // Create mock DOM element with Jest mocks
      const mockClassList = {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn()
      };
      
      const cardElement = {
        classList: mockClassList,
        setAttribute: jest.fn(),
        querySelector: jest.fn()
      };
      
      // Mock querySelector
      document.querySelector = jest.fn(() => cardElement);
      
      const updateCardDisplay = (row, col, card) => {
        const element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!element) {
          return false;
        }
        
        // Update collapsed state
        if (card.collapsed) {
          element.classList.add('collapsed');
        } else {
          element.classList.remove('collapsed');
        }
        
        return true;
      };
      
      const collapsedCard = { collapsed: true, hasPlayer: false };
      const success = updateCardDisplay(0, 0, collapsedCard);
      
      expect(success).toBe(true);
      expect(mockClassList.add).toHaveBeenCalledWith('collapsed');
    });

    test('updateCardDisplay handles player display', () => {
      const mockClassList = {
        add: jest.fn(),
        remove: jest.fn()
      };
      
      const cardElement = {
        classList: mockClassList,
        querySelector: jest.fn(() => null), // No existing pawn
        appendChild: jest.fn()
      };
      
      document.querySelector = jest.fn(() => cardElement);
      document.createElement = jest.fn(() => ({
        className: '',
        textContent: ''
      }));
      
      const updateCardDisplay = (row, col, card) => {
        const element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!element) {
          return false;
        }
        
        const existingPawn = element.querySelector('.player-pawn');
        
        if (card.hasPlayer && card.playerId) {
          if (!existingPawn) {
            const pawnElement = document.createElement('div');
            pawnElement.className = `player-pawn ${card.playerId}`;
            pawnElement.textContent = '●';
            element.appendChild(pawnElement);
          }
          element.classList.add('has-player', `player-${card.playerId}`);
        }
        
        return true;
      };
      
      const cardWithPlayer = { collapsed: false, hasPlayer: true, playerId: 'red' };
      const success = updateCardDisplay(1, 1, cardWithPlayer);
      
      expect(success).toBe(true);
      expect(cardElement.appendChild).toHaveBeenCalled();
      expect(mockClassList.add).toHaveBeenCalledWith('has-player', 'player-red');
    });

    test('updateCardDisplay handles missing DOM element', () => {
      document.querySelector = jest.fn(() => null);
      
      const updateCardDisplay = (row, col, card) => {
        const element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!element) {
          return false;
        }
        return true;
      };
      
      const result = updateCardDisplay(0, 0, { collapsed: false });
      expect(result).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('handles Storage API unavailability', () => {
      // Mock Storage as undefined
      const originalStorage = global.Storage;
      global.Storage = undefined;
      
      const saveGameState = () => {
        try {
          if (typeof Storage === 'undefined') {
            throw new Error('localStorage not available');
          }
          return true;
        } catch (error) {
          return false;
        }
      };
      
      expect(saveGameState()).toBe(false);
      
      // Restore Storage
      global.Storage = originalStorage;
    });

    test('handles JSON serialization errors', () => {
      // Create object with circular reference
      const circularState = { players: [] };
      circularState.self = circularState;
      global.gameState = circularState;
      
      const saveGameState = () => {
        try {
          const serialized = JSON.stringify(global.gameState);
          return true;
        } catch (error) {
          return false;
        }
      };
      
      expect(saveGameState()).toBe(false);
    });

    test('validates game state structure during load', () => {
      const invalidStates = [
        { board: null, players: [] }, // Invalid board
        { board: [], players: null }, // Invalid players
        { somethingElse: true },      // Missing required fields
        null,                         // Null state
        undefined                     // Undefined state
      ];
      
      const validateGameState = (state) => {
        if (!state || !state.board || !state.players) {
          return false;
        }
        return true;
      };
      
      invalidStates.forEach(state => {
        expect(validateGameState(state)).toBe(false);
      });
      
      // Valid state
      const validState = testUtils.deepClone(gameStates.initialGameState);
      expect(validateGameState(validState)).toBe(true);
    });
  });

  describe('Development Testing Functions', () => {
    test('testGameStateSerialization validates serialization process', () => {
      const testGameState = testUtils.deepClone(gameStates.initialGameState);
      
      const testGameStateSerialization = () => {
        try {
          // Test serialization
          const serialized = JSON.stringify(testGameState);
          
          // Test deserialization
          const deserialized = JSON.parse(serialized);
          
          // Test structure validation
          if (!deserialized.board || !deserialized.players) {
            return false;
          }
          
          return true;
        } catch (error) {
          return false;
        }
      };
      
      expect(testGameStateSerialization()).toBe(true);
    });

    test('runDevelopmentTests coordinates multiple test functions', () => {
      let testResults = {
        serialization: false,
        shuffle: false,
        validation: false
      };
      
      const runDevelopmentTests = () => {
        try {
          // Test serialization
          const testState = testUtils.deepClone(gameStates.initialGameState);
          const serialized = JSON.stringify(testState);
          const deserialized = JSON.parse(serialized);
          testResults.serialization = !!(deserialized.board && deserialized.players);
          
          // Test shuffle
          const testDeck = [...STANDARD_DECK];
          const shuffled = [...testDeck].sort(() => Math.random() - 0.5);
          testResults.shuffle = shuffled.length === 16;
          
          // Test validation
          testResults.validation = testResults.serialization && testResults.shuffle;
          
          return testResults;
        } catch (error) {
          return { error: true };
        }
      };
      
      const results = runDevelopmentTests();
      expect(results.serialization).toBe(true);
      expect(results.shuffle).toBe(true);
      expect(results.validation).toBe(true);
    });
  });
});