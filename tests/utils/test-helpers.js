/**
 * Test Helper Utilities
 * Common assertion utilities and helper functions for Collapsi game testing
 */

/**
 * Assertion helpers for common game state validations
 */
export const assertions = {
  /**
   * Assert that a board is valid (4x4 with proper card objects)
   */
  expectValidBoard(board) {
    expect(board).toBeDefined();
    expect(Array.isArray(board)).toBe(true);
    expect(board.length).toBe(4);
    
    board.forEach((row, rowIndex) => {
      expect(Array.isArray(row)).toBe(true);
      expect(row.length).toBe(4);
      
      row.forEach((card, colIndex) => {
        expect(card).toBeDefined();
        expect(card).toHaveProperty('type');
        expect(card).toHaveProperty('position');
        expect(card).toHaveProperty('collapsed');
        expect(card).toHaveProperty('hasPlayer');
        expect(card).toHaveProperty('playerId');
        expect(card.position).toEqual({ row: rowIndex, col: colIndex });
      });
    });
  },

  /**
   * Assert that a game state is valid
   */
  expectValidGameState(gameState) {
    expect(gameState).toBeDefined();
    expect(gameState).toHaveProperty('board');
    expect(gameState).toHaveProperty('players');
    expect(gameState).toHaveProperty('currentPlayer');
    expect(gameState).toHaveProperty('gameStatus');
    expect(gameState).toHaveProperty('moveHistory');
    expect(gameState).toHaveProperty('winner');
    expect(gameState).toHaveProperty('currentMovePath');
    expect(gameState).toHaveProperty('jokerMoveState');
    
    // Validate board
    this.expectValidBoard(gameState.board);
    
    // Validate players
    expect(Array.isArray(gameState.players)).toBe(true);
    expect(gameState.players.length).toBe(2);
    
    gameState.players.forEach(player => {
      expect(player).toHaveProperty('id');
      expect(player).toHaveProperty('color');
      expect(player).toHaveProperty('position');
      expect(player).toHaveProperty('startingCard');
    });
    
    // Validate current player
    expect(typeof gameState.currentPlayer).toBe('number');
    expect(gameState.currentPlayer).toBeGreaterThanOrEqual(0);
    expect(gameState.currentPlayer).toBeLessThan(gameState.players.length);
    
    // Validate game status
    expect(['setup', 'playing', 'ended']).toContain(gameState.gameStatus);
    
    // Validate arrays
    expect(Array.isArray(gameState.moveHistory)).toBe(true);
    expect(Array.isArray(gameState.currentMovePath)).toBe(true);
  },

  /**
   * Assert that a move object is valid
   */
  expectValidMove(move) {
    expect(move).toBeDefined();
    expect(move).toHaveProperty('from');
    expect(move).toHaveProperty('to');
    expect(move.from).toHaveProperty('row');
    expect(move.from).toHaveProperty('col'); 
    expect(move.to).toHaveProperty('row');
    expect(move.to).toHaveProperty('col');
    
    // Validate coordinates are within bounds
    [move.from, move.to].forEach(pos => {
      expect(pos.row).toBeGreaterThanOrEqual(0);
      expect(pos.row).toBeLessThan(4);
      expect(pos.col).toBeGreaterThanOrEqual(0);
      expect(pos.col).toBeLessThan(4);
    });
  },

  /**
   * Assert that a position is valid
   */
  expectValidPosition(position) {
    expect(position).toBeDefined();
    expect(position).toHaveProperty('row');
    expect(position).toHaveProperty('col');
    expect(typeof position.row).toBe('number');
    expect(typeof position.col).toBe('number');
    expect(position.row).toBeGreaterThanOrEqual(0);
    expect(position.row).toBeLessThan(4);
    expect(position.col).toBeGreaterThanOrEqual(0);
    expect(position.col).toBeLessThan(4);
  },

  /**
   * Assert that a path is valid
   */
  expectValidPath(path) {
    expect(Array.isArray(path)).toBe(true);
    path.forEach(position => {
      this.expectValidPosition(position);
    });
  }
};

/**
 * Utility functions for test setup and manipulation
 */
export const testUtils = {
  /**
   * Create a deep copy of an object (for isolating test data)
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Compare two positions for equality
   */
  positionsEqual(pos1, pos2) {
    return pos1.row === pos2.row && pos1.col === pos2.col;
  },

  /**
   * Find a card in the board by type
   */
  findCardByType(board, cardType) {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (board[row][col].type === cardType) {
          return { row, col };
        }
      }
    }
    return null;
  },

  /**
   * Find all cards of a specific type in the board
   */
  findAllCardsByType(board, cardType) {
    const positions = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (board[row][col].type === cardType) {
          positions.push({ row, col });
        }
      }
    }
    return positions;
  },

  /**
   * Count collapsed cards on the board
   */
  countCollapsedCards(board) {
    let count = 0;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (board[row][col].collapsed) {
          count++;
        }
      }
    }
    return count;
  },

  /**
   * Count available (non-collapsed) cards on the board
   */
  countAvailableCards(board) {
    let count = 0;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (!board[row][col].collapsed) {
          count++;
        }
      }
    }
    return count;
  },

  /**
   * Get all valid positions on the board
   */
  getAllPositions() {
    const positions = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        positions.push({ row, col });
      }
    }
    return positions;
  },

  /**
   * Create a move object from two positions
   */
  createMove(from, to) {
    return { from, to };
  },

  /**
   * Calculate distance between two positions (Manhattan distance)
   */
  calculateDistance(pos1, pos2) {
    return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
  },

  /**
   * Check if a position is on the board edge
   */
  isEdgePosition(position) {
    return position.row === 0 || position.row === 3 || 
           position.col === 0 || position.col === 3;
  },

  /**
   * Check if a position is a corner
   */
  isCornerPosition(position) {
    return (position.row === 0 || position.row === 3) && 
           (position.col === 0 || position.col === 3);
  },

  /**
   * Generate all possible moves from a position
   */
  getAllPossibleMoves(from) {
    const moves = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (row !== from.row || col !== from.col) {
          moves.push(this.createMove(from, { row, col }));
        }
      }
    }
    return moves;
  },

  /**
   * Sleep for a given number of milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

/**
 * Mock helpers for testing
 */
export const mockHelpers = {
  /**
   * Create a mock DOM element with basic properties
   */
  createMockElement(tagName = 'div', id = null, classes = []) {
    const element = {
      tagName: tagName.toUpperCase(),
      id: id || '',
      className: classes.join(' '),
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        toggle: jest.fn(),
        contains: jest.fn(() => false)
      },
      style: {},
      innerHTML: '',
      textContent: '',
      dataset: {},
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      hasAttribute: jest.fn(() => false),
      click: jest.fn(),
      focus: jest.fn(),
      blur: jest.fn()
    };
    
    return element;
  },

  /**
   * Create a mock event object
   */
  createMockEvent(type = 'click', target = null, options = {}) {
    return {
      type,
      target: target || this.createMockElement(),
      currentTarget: target || this.createMockElement(),
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      stopImmediatePropagation: jest.fn(),
      ...options
    };
  },

  /**
   * Create a mock touch event
   */
  createMockTouchEvent(type = 'touchstart', touches = [], options = {}) {
    return {
      type,
      touches,
      changedTouches: touches,
      targetTouches: touches,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      ...options
    };
  }
};

/**
 * Performance testing helpers
 */
export const performanceHelpers = {
  /**
   * Measure execution time of a function
   */
  async measureTime(fn) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    return end - start;
  },

  /**
   * Assert that a function executes within a time limit
   */
  async expectTimingUnder(fn, maxTime = 100) {
    const executionTime = await this.measureTime(fn);
    expect(executionTime).toBeLessThan(maxTime);
    return executionTime;
  },

  /**
   * Run a function multiple times and return average execution time
   */
  async benchmarkFunction(fn, iterations = 100) {
    const times = [];
    for (let i = 0; i < iterations; i++) {
      const time = await this.measureTime(fn);
      times.push(time);
    }
    
    const average = times.reduce((sum, time) => sum + time, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    return { average, min, max, times };
  }
};