/**
 * Game Fixtures
 * Pre-built game states and board scenarios for testing
 */

/**
 * Standard card deck as defined in the game
 */
export const STANDARD_DECK = [
    'red-joker',
    'black-joker', 
    'A', 'A', 'A', 'A',
    '2', '2', '2', '2', 
    '3', '3', '3', '3',
    '4', '4'
];

/**
 * Pre-defined board layouts for testing specific scenarios
 */
export const boardLayouts = {
  /**
   * Initial game board with jokers in corners
   */
  initialBoard: [
    [
      { type: 'red-joker', position: { row: 0, col: 0 }, collapsed: false, hasPlayer: true, playerId: 'red' },
      { type: 'A', position: { row: 0, col: 1 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '2', position: { row: 0, col: 2 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '3', position: { row: 0, col: 3 }, collapsed: false, hasPlayer: false, playerId: null }
    ],
    [
      { type: 'A', position: { row: 1, col: 0 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '4', position: { row: 1, col: 1 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: 'A', position: { row: 1, col: 2 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '2', position: { row: 1, col: 3 }, collapsed: false, hasPlayer: false, playerId: null }
    ],
    [
      { type: '3', position: { row: 2, col: 0 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '2', position: { row: 2, col: 1 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '4', position: { row: 2, col: 2 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: 'A', position: { row: 2, col: 3 }, collapsed: false, hasPlayer: false, playerId: null }
    ],
    [
      { type: '3', position: { row: 3, col: 0 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '2', position: { row: 3, col: 1 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '3', position: { row: 3, col: 2 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: 'black-joker', position: { row: 3, col: 3 }, collapsed: false, hasPlayer: true, playerId: 'blue' }
    ]
  ],

  /**
   * Mid-game board with some collapsed cards
   */
  midGameBoard: [
    [
      { type: 'red-joker', position: { row: 0, col: 0 }, collapsed: true, hasPlayer: false, playerId: null },
      { type: 'A', position: { row: 0, col: 1 }, collapsed: false, hasPlayer: true, playerId: 'red' },
      { type: '2', position: { row: 0, col: 2 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '3', position: { row: 0, col: 3 }, collapsed: true, hasPlayer: false, playerId: null }
    ],
    [
      { type: 'A', position: { row: 1, col: 0 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '4', position: { row: 1, col: 1 }, collapsed: true, hasPlayer: false, playerId: null },
      { type: 'A', position: { row: 1, col: 2 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '2', position: { row: 1, col: 3 }, collapsed: false, hasPlayer: false, playerId: null }
    ],
    [
      { type: '3', position: { row: 2, col: 0 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '2', position: { row: 2, col: 1 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '4', position: { row: 2, col: 2 }, collapsed: false, hasPlayer: true, playerId: 'blue' },
      { type: 'A', position: { row: 2, col: 3 }, collapsed: false, hasPlayer: false, playerId: null }
    ],
    [
      { type: '3', position: { row: 3, col: 0 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '2', position: { row: 3, col: 1 }, collapsed: true, hasPlayer: false, playerId: null },
      { type: '3', position: { row: 3, col: 2 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: 'black-joker', position: { row: 3, col: 3 }, collapsed: true, hasPlayer: false, playerId: null }
    ]
  ],

  /**
   * End-game board with many collapsed cards
   */
  endGameBoard: [
    [
      { type: 'red-joker', position: { row: 0, col: 0 }, collapsed: true, hasPlayer: false, playerId: null },
      { type: 'A', position: { row: 0, col: 1 }, collapsed: true, hasPlayer: false, playerId: null },
      { type: '2', position: { row: 0, col: 2 }, collapsed: true, hasPlayer: false, playerId: null },
      { type: '3', position: { row: 0, col: 3 }, collapsed: true, hasPlayer: false, playerId: null }
    ],
    [
      { type: 'A', position: { row: 1, col: 0 }, collapsed: true, hasPlayer: false, playerId: null },
      { type: '4', position: { row: 1, col: 1 }, collapsed: false, hasPlayer: true, playerId: 'red' },
      { type: 'A', position: { row: 1, col: 2 }, collapsed: true, hasPlayer: false, playerId: null },
      { type: '2', position: { row: 1, col: 3 }, collapsed: true, hasPlayer: false, playerId: null }
    ],
    [
      { type: '3', position: { row: 2, col: 0 }, collapsed: true, hasPlayer: false, playerId: null },
      { type: '2', position: { row: 2, col: 1 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '4', position: { row: 2, col: 2 }, collapsed: true, hasPlayer: false, playerId: null },
      { type: 'A', position: { row: 2, col: 3 }, collapsed: false, hasPlayer: true, playerId: 'blue' }
    ],
    [
      { type: '3', position: { row: 3, col: 0 }, collapsed: true, hasPlayer: false, playerId: null },
      { type: '2', position: { row: 3, col: 1 }, collapsed: true, hasPlayer: false, playerId: null },
      { type: '3', position: { row: 3, col: 2 }, collapsed: true, hasPlayer: false, playerId: null },
      { type: 'black-joker', position: { row: 3, col: 3 }, collapsed: true, hasPlayer: false, playerId: null }
    ]
  ],

  /**
   * Board with jokers adjacent for testing joker mechanics
   */
  jokersAdjacentBoard: [
    [
      { type: 'red-joker', position: { row: 0, col: 0 }, collapsed: false, hasPlayer: true, playerId: 'red' },
      { type: 'black-joker', position: { row: 0, col: 1 }, collapsed: false, hasPlayer: true, playerId: 'blue' },
      { type: '2', position: { row: 0, col: 2 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '3', position: { row: 0, col: 3 }, collapsed: false, hasPlayer: false, playerId: null }
    ],
    [
      { type: 'A', position: { row: 1, col: 0 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '4', position: { row: 1, col: 1 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: 'A', position: { row: 1, col: 2 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '2', position: { row: 1, col: 3 }, collapsed: false, hasPlayer: false, playerId: null }
    ],
    [
      { type: '3', position: { row: 2, col: 0 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '2', position: { row: 2, col: 1 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '4', position: { row: 2, col: 2 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: 'A', position: { row: 2, col: 3 }, collapsed: false, hasPlayer: false, playerId: null }
    ],
    [
      { type: '3', position: { row: 3, col: 0 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '2', position: { row: 3, col: 1 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: '3', position: { row: 3, col: 2 }, collapsed: false, hasPlayer: false, playerId: null },
      { type: 'A', position: { row: 3, col: 3 }, collapsed: false, hasPlayer: false, playerId: null }
    ]
  ]
};

/**
 * Pre-defined game states for testing
 */
export const gameStates = {
  /**
   * Fresh game state at the beginning
   */
  initialGameState: {
    board: boardLayouts.initialBoard,
    players: [
      {
        id: 'red',
        color: 'red',
        position: { row: 0, col: 0 },
        startingCard: 'red-joker'
      },
      {
        id: 'blue', 
        color: 'blue',
        position: { row: 3, col: 3 },
        startingCard: 'black-joker'
      }
    ],
    currentPlayer: 0,
    gameStatus: 'playing',
    moveHistory: [],
    winner: null,
    currentMovePath: [],
    jokerMoveState: null
  },

  /**
   * Mid-game state
   */
  midGameState: {
    board: boardLayouts.midGameBoard,
    players: [
      {
        id: 'red',
        color: 'red',
        position: { row: 0, col: 1 },
        startingCard: 'red-joker'
      },
      {
        id: 'blue',
        color: 'blue', 
        position: { row: 2, col: 2 },
        startingCard: 'black-joker'
      }
    ],
    currentPlayer: 1,
    gameStatus: 'playing',
    moveHistory: [
      { from: { row: 0, col: 0 }, to: { row: 0, col: 1 }, player: 'red', cardType: 'red-joker' },
      { from: { row: 3, col: 3 }, to: { row: 2, col: 2 }, player: 'blue', cardType: 'black-joker' }
    ],
    winner: null,
    currentMovePath: [],
    jokerMoveState: null
  },

  /**
   * End-game state with limited moves
   */
  endGameState: {
    board: boardLayouts.endGameBoard,
    players: [
      {
        id: 'red',
        color: 'red',
        position: { row: 1, col: 1 },
        startingCard: 'red-joker'
      },
      {
        id: 'blue',
        color: 'blue',
        position: { row: 2, col: 3 },
        startingCard: 'black-joker'
      }
    ],
    currentPlayer: 0,
    gameStatus: 'playing', 
    moveHistory: [
      { from: { row: 0, col: 0 }, to: { row: 0, col: 1 }, player: 'red', cardType: 'red-joker' },
      { from: { row: 3, col: 3 }, to: { row: 2, col: 2 }, player: 'blue', cardType: 'black-joker' },
      { from: { row: 0, col: 1 }, to: { row: 1, col: 1 }, player: 'red', cardType: 'A' },
      { from: { row: 2, col: 2 }, to: { row: 2, col: 3 }, player: 'blue', cardType: '4' }
    ],
    winner: null,
    currentMovePath: [],
    jokerMoveState: null
  },

  /**
   * Game state with active joker movement
   */
  jokerMovementState: {
    board: boardLayouts.jokersAdjacentBoard,
    players: [
      {
        id: 'red',
        color: 'red',
        position: { row: 0, col: 0 },
        startingCard: 'red-joker'
      },
      {
        id: 'blue',
        color: 'blue',
        position: { row: 0, col: 1 },
        startingCard: 'black-joker'
      }
    ],
    currentPlayer: 0,
    gameStatus: 'playing',
    moveHistory: [],
    winner: null,
    currentMovePath: [{ row: 0, col: 0 }],
    jokerMoveState: {
      isActive: true,
      currentPosition: { row: 0, col: 0 },
      remainingMoves: 3,
      canComplete: true,
      path: [{ row: 0, col: 0 }]
    }
  },

  /**
   * Completed game state
   */
  completedGameState: {
    board: boardLayouts.endGameBoard,
    players: [
      {
        id: 'red',
        color: 'red',
        position: { row: 1, col: 1 },
        startingCard: 'red-joker'
      },
      {
        id: 'blue',
        color: 'blue',
        position: { row: 2, col: 3 },
        startingCard: 'black-joker'
      }
    ],
    currentPlayer: 0,
    gameStatus: 'ended',
    moveHistory: [
      { from: { row: 0, col: 0 }, to: { row: 0, col: 1 }, player: 'red', cardType: 'red-joker' },
      { from: { row: 3, col: 3 }, to: { row: 2, col: 2 }, player: 'blue', cardType: 'black-joker' },
      { from: { row: 0, col: 1 }, to: { row: 1, col: 1 }, player: 'red', cardType: 'A' },
      { from: { row: 2, col: 2 }, to: { row: 2, col: 3 }, player: 'blue', cardType: '4' }
    ],
    winner: 'red',
    currentMovePath: [],
    jokerMoveState: null
  }
};

/**
 * Move patterns for testing different scenarios
 */
export const movePatterns = {
  /**
   * Simple orthogonal moves
   */
  orthogonalMoves: [
    { from: { row: 1, col: 1 }, to: { row: 1, col: 2 } }, // Right
    { from: { row: 1, col: 1 }, to: { row: 1, col: 0 } }, // Left
    { from: { row: 1, col: 1 }, to: { row: 0, col: 1 } }, // Up
    { from: { row: 1, col: 1 }, to: { row: 2, col: 1 } }  // Down
  ],

  /**
   * Diagonal moves (should be invalid)
   */
  diagonalMoves: [
    { from: { row: 1, col: 1 }, to: { row: 0, col: 0 } },
    { from: { row: 1, col: 1 }, to: { row: 0, col: 2 } },
    { from: { row: 1, col: 1 }, to: { row: 2, col: 0 } },
    { from: { row: 1, col: 1 }, to: { row: 2, col: 2 } }
  ],

  /**
   * Wraparound moves
   */
  wraparoundMoves: [
    { from: { row: 0, col: 0 }, to: { row: 3, col: 0 } }, // Top to bottom
    { from: { row: 3, col: 0 }, to: { row: 0, col: 0 } }, // Bottom to top
    { from: { row: 0, col: 0 }, to: { row: 0, col: 3 } }, // Left to right
    { from: { row: 0, col: 3 }, to: { row: 0, col: 0 } }  // Right to left
  ],

  /**
   * Multi-step moves
   */
  multiStepMoves: [
    { from: { row: 0, col: 0 }, to: { row: 0, col: 2 } }, // 2 steps
    { from: { row: 0, col: 0 }, to: { row: 0, col: 3 } }, // 3 steps  
    { from: { row: 0, col: 0 }, to: { row: 3, col: 0 } }  // 3 steps with wraparound
  ],

  /**
   * Joker moves (1-4 spaces)
   */
  jokerMoves: [
    { from: { row: 0, col: 0 }, to: { row: 0, col: 1 } }, // 1 space
    { from: { row: 0, col: 0 }, to: { row: 0, col: 2 } }, // 2 spaces
    { from: { row: 0, col: 0 }, to: { row: 0, col: 3 } }, // 3 spaces
    { from: { row: 0, col: 0 }, to: { row: 3, col: 0 } }  // 4 spaces (wraparound)
  ]
};

/**
 * Test scenarios for edge cases
 */
export const edgeCases = {
  /**
   * Moves to collapsed cards (should be invalid)
   */
  movesToCollapsedCards: [
    {
      board: boardLayouts.midGameBoard,
      move: { from: { row: 0, col: 1 }, to: { row: 0, col: 0 } } // To collapsed red-joker
    }
  ],

  /**
   * Moves from collapsed cards (should be invalid)
   */
  movesFromCollapsedCards: [
    {
      board: boardLayouts.midGameBoard,
      move: { from: { row: 0, col: 0 }, to: { row: 0, col: 1 } } // From collapsed red-joker
    }
  ],

  /**
   * Moves with wrong distance for card type
   */
  wrongDistanceMoves: [
    {
      cardType: 'A',
      move: { from: { row: 0, col: 0 }, to: { row: 0, col: 2 } } // A card moving 2 spaces
    },
    {
      cardType: '2',
      move: { from: { row: 0, col: 0 }, to: { row: 0, col: 3 } } // 2 card moving 3 spaces
    }
  ]
};

/**
 * Factory functions for creating test data
 */
export const factories = {
  /**
   * Create a basic card object
   */
  createCard(type, row, col, collapsed = false, hasPlayer = false, playerId = null) {
    return {
      type,
      position: { row, col },
      collapsed,
      hasPlayer,
      playerId
    };
  },

  /**
   * Create a basic player object
   */
  createPlayer(id, color, position, startingCard) {
    return {
      id,
      color,
      position,
      startingCard
    };
  },

  /**
   * Create a basic move object
   */
  createMove(fromRow, fromCol, toRow, toCol) {
    return {
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol }
    };
  },

  /**
   * Create an empty 4x4 board
   */
  createEmptyBoard() {
    const board = [];
    for (let row = 0; row < 4; row++) {
      board[row] = [];
      for (let col = 0; col < 4; col++) {
        board[row][col] = this.createCard('empty', row, col);
      }
    }
    return board;
  },

  /**
   * Create a basic game state
   */
  createGameState(board, players, currentPlayer = 0, gameStatus = 'playing') {
    return {
      board,
      players,
      currentPlayer,
      gameStatus,
      moveHistory: [],
      winner: null,
      currentMovePath: [],
      jokerMoveState: null
    };
  }
};