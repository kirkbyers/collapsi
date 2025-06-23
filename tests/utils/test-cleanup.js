/**
 * Test Cleanup Utilities
 * Shared beforeEach/afterEach cleanup utilities for consistent test environment
 */

import { setupDOMMocks, cleanupDOMMocks } from './dom-mocks.js';

/**
 * Global test state for cleanup tracking
 */
let testState = {
  domMocks: null,
  timers: [],
  eventListeners: [],
  intervals: [],
  animationFrames: []
};

/**
 * Set up test environment before each test
 */
export const setupTestEnvironment = () => {
  // Set up DOM mocks
  testState.domMocks = setupDOMMocks();
  
  // Mock timers if needed (uncomment for timer-based tests)
  // jest.useFakeTimers();
  
  // Clear any existing state
  testState.timers = [];
  testState.eventListeners = [];
  testState.intervals = [];
  testState.animationFrames = [];
  
  // Mock console to reduce noise (uncomment to suppress console output)
  // jest.spyOn(console, 'log').mockImplementation(() => {});
  // jest.spyOn(console, 'warn').mockImplementation(() => {});
  // jest.spyOn(console, 'error').mockImplementation(() => {});
  
  // Performance.now mock for consistent timing
  if (typeof performance !== 'undefined' && performance.now) {
    jest.spyOn(performance, 'now').mockReturnValue(0);
  }
  
  // Date.now mock for consistent timing (uncomment if needed)
  // jest.spyOn(Date, 'now').mockReturnValue(1609459200000); // 2021-01-01
};

/**
 * Clean up test environment after each test
 */
export const cleanupTestEnvironment = () => {
  // Clear all mocks
  jest.clearAllMocks();
  jest.restoreAllMocks();
  
  // Clean up DOM mocks
  if (testState.domMocks) {
    cleanupDOMMocks();
    testState.domMocks = null;
  }
  
  // Clear timers
  testState.timers.forEach(id => clearTimeout(id));
  testState.intervals.forEach(id => clearInterval(id));
  testState.animationFrames.forEach(id => cancelAnimationFrame(id));
  
  // Reset test state
  testState.timers = [];
  testState.eventListeners = [];
  testState.intervals = [];
  testState.animationFrames = [];
  
  // Restore fake timers if they were used
  // jest.useRealTimers();
};

/**
 * Game-specific setup utilities
 */
export const gameTestSetup = {
  /**
   * Set up a clean game environment
   */
  setupCleanGame() {
    // Clear any existing game state from global scope
    if (typeof window !== 'undefined') {
      // Clear localStorage
      window.localStorage.clear();
      
      // Clear any game-related global variables (if they exist)
      delete window.gameState;
      delete window.gameBoard;
      delete window.currentPlayer;
    }
    
    // Reset any module-level state (this would depend on how modules are structured)
    // This is a placeholder - actual implementation would depend on the game's architecture
  },

  /**
   * Set up DOM elements that the game expects
   */
  setupGameDOM() {
    if (typeof document !== 'undefined') {
      // Create basic DOM structure that the game might expect
      const gameBoard = document.createElement('div');
      gameBoard.id = 'game-board';
      gameBoard.className = 'board';
      document.body.appendChild(gameBoard);
      
      // Create player indicators
      const playerIndicator = document.createElement('div');
      playerIndicator.id = 'current-player';
      document.body.appendChild(playerIndicator);
      
      // Create winner modal container
      const winnerModal = document.createElement('div');
      winnerModal.id = 'winner-modal';
      winnerModal.style.display = 'none';
      document.body.appendChild(winnerModal);
      
      // Store references for cleanup
      testState.createdElements = [gameBoard, playerIndicator, winnerModal];
    }
  },

  /**
   * Clean up game-specific DOM elements
   */
  cleanupGameDOM() {
    if (testState.createdElements && typeof document !== 'undefined') {
      testState.createdElements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      testState.createdElements = [];
    }
  }
};

/**
 * Async test utilities
 */
export const asyncTestUtils = {
  /**
   * Wait for a condition to be true
   */
  async waitFor(condition, timeout = 1000, interval = 10) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true;
      }
      await this.sleep(interval);
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  },

  /**
   * Sleep for a given number of milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Wait for the next animation frame
   */
  waitForAnimationFrame() {
    return new Promise(resolve => requestAnimationFrame(resolve));
  },

  /**
   * Wait for multiple animation frames
   */
  async waitForAnimationFrames(count = 1) {
    for (let i = 0; i < count; i++) {
      await this.waitForAnimationFrame();
    }
  }
};

/**
 * Error testing utilities
 */
export const errorTestUtils = {
  /**
   * Expect a function to throw with a specific message
   */
  expectToThrowWithMessage(fn, expectedMessage) {
    let error;
    try {
      fn();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.message).toContain(expectedMessage);
  },

  /**
   * Expect an async function to throw with a specific message
   */
  async expectAsyncToThrowWithMessage(asyncFn, expectedMessage) {
    let error;
    try {
      await asyncFn();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.message).toContain(expectedMessage);
  },

  /**
   * Suppress console errors during test (useful for testing error conditions)
   */
  suppressConsoleErrors() {
    const originalError = console.error;
    console.error = jest.fn();
    return () => {
      console.error = originalError;
    };
  }
};

/**
 * Convenience function to set up common test patterns
 */
export const withTestEnvironment = (testSuite) => {
  describe(testSuite.name || 'Test Suite', () => {
    beforeEach(() => {
      setupTestEnvironment();
      if (testSuite.setup) {
        testSuite.setup();
      }
    });

    afterEach(() => {
      if (testSuite.cleanup) {
        testSuite.cleanup();
      }
      cleanupTestEnvironment();
    });

    testSuite.tests();
  });
};

/**
 * Convenience function for game-specific test setup
 */
export const withGameTestEnvironment = (testSuite) => {
  describe(testSuite.name || 'Game Test Suite', () => {
    beforeEach(() => {
      setupTestEnvironment();
      gameTestSetup.setupCleanGame();
      gameTestSetup.setupGameDOM();
      if (testSuite.setup) {
        testSuite.setup();
      }
    });

    afterEach(() => {
      if (testSuite.cleanup) {
        testSuite.cleanup();
      }
      gameTestSetup.cleanupGameDOM();
      cleanupTestEnvironment();
    });

    testSuite.tests();
  });
};