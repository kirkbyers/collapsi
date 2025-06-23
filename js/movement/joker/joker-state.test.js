// Unit tests for joker-state.js
// Tests joker movement state management and lifecycle functions

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load dependencies first
const pathValidationPath = path.join(__dirname, '../core/path-validation.js');
const pathValidationCode = fs.readFileSync(pathValidationPath, 'utf8');

const positionUtilsPath = path.join(__dirname, '../core/position-utils.js');
const positionUtilsCode = fs.readFileSync(positionUtilsPath, 'utf8');

const endingValidatorPath = path.join(__dirname, '../validation/ending-validator.js');
const endingValidatorCode = fs.readFileSync(endingValidatorPath, 'utf8');

// Load the module being tested
const jokerStatePath = path.join(__dirname, 'joker-state.js');
const jokerStateCode = fs.readFileSync(jokerStatePath, 'utf8');

// Create a mock console to capture logs
let consoleLogs = [];
const mockConsole = {
    log: (message) => { consoleLogs.push(message); },
    error: (message) => { consoleLogs.push(`ERROR: ${message}`); }
};

// Mock game state and functions
const mockGameState = {
    jokerMoveState: null,
    board: [
        [
            { type: 'red-joker', hasPlayer: false, collapsed: false },
            { type: 'A', hasPlayer: false, collapsed: false },
            { type: '2', hasPlayer: false, collapsed: false },
            { type: '3', hasPlayer: false, collapsed: false }
        ],
        [
            { type: 'A', hasPlayer: false, collapsed: false },
            { type: '4', hasPlayer: false, collapsed: false },
            { type: '3', hasPlayer: false, collapsed: false },
            { type: '2', hasPlayer: false, collapsed: false }
        ],
        [
            { type: '2', hasPlayer: false, collapsed: false },
            { type: '3', hasPlayer: false, collapsed: false },
            { type: 'A', hasPlayer: false, collapsed: false },
            { type: '4', hasPlayer: false, collapsed: false }
        ],
        [
            { type: '3', hasPlayer: false, collapsed: false },
            { type: 'A', hasPlayer: false, collapsed: false },
            { type: '4', hasPlayer: false, collapsed: false },
            { type: 'black-joker', hasPlayer: false, collapsed: false }
        ]
    ],
    players: [
        { id: 'player1', position: { row: 0, col: 0 } },
        { id: 'player2', position: { row: 3, col: 3 } }
    ]
};

// Mock functions
const mockFunctions = {
    getCardAtPosition: (row, col) => {
        if (row >= 0 && row < 4 && col >= 0 && col < 4) {
            return mockGameState.board[row][col];
        }
        return null;
    },
    getCurrentPlayer: () => ({ id: 'player1', isPlaced: () => true, getPosition: () => ({ row: 0, col: 0 }) }),
    movePlayerPawn: jest.fn(),
    clearValidationCache: jest.fn()
};

// Create context with all dependencies and mocks
const context = {
    console: mockConsole,
    gameState: mockGameState,
    ...mockFunctions,
    // Functions we'll extract
    initializeJokerMovement: undefined,
    isValidJokerMoveStep: undefined,
    executeJokerMoveStep: undefined,
    getValidJokerMoveSteps: undefined,
    canEndJokerTurnEarly: undefined,
    hasValidJokerMovesRemaining: undefined,
    getJokerMovementSummary: undefined,
    updateJokerMovementState: undefined,
    resetJokerMovementState: undefined,
    canStartJokerMovement: undefined,
    startJokerMovement: undefined
};
vm.createContext(context);

// Execute all dependencies in order
vm.runInContext(pathValidationCode, context);
vm.runInContext(positionUtilsCode, context);
vm.runInContext(endingValidatorCode, context);
vm.runInContext(jokerStateCode, context);

// Extract functions from context
const { 
    initializeJokerMovement, isValidJokerMoveStep, executeJokerMoveStep, 
    getValidJokerMoveSteps, canEndJokerTurnEarly, hasValidJokerMovesRemaining,
    getJokerMovementSummary, updateJokerMovementState, resetJokerMovementState,
    canStartJokerMovement, startJokerMovement
} = context;

// Reset before each test
beforeEach(() => {
    consoleLogs = [];
    mockGameState.jokerMoveState = null;
    mockFunctions.movePlayerPawn.mockClear();
    mockFunctions.clearValidationCache.mockClear();
});

describe('initializeJokerMovement', () => {
    it('should initialize joker movement for valid player on joker card', () => {
        const player = { id: 'player1' };
        const position = { row: 0, col: 0 }; // red-joker position
        
        const result = initializeJokerMovement(player, position);
        
        expect(result).not.toBeNull();
        expect(result.playerId).toBe('player1');
        expect(result.startingPosition).toEqual(position);
        expect(result.currentPosition).toEqual(position);
        expect(result.maxDistance).toBe(4);
        expect(result.remainingDistance).toBe(4);
        expect(result.movePath).toEqual([position]);
        expect(result.canEndTurn).toBe(true);
        expect(result.isActive).toBe(true);
        expect(mockGameState.jokerMoveState).toBe(result);
    });

    it('should initialize joker movement for black joker', () => {
        const player = { id: 'player2' };
        const position = { row: 3, col: 3 }; // black-joker position
        
        const result = initializeJokerMovement(player, position);
        
        expect(result).not.toBeNull();
        expect(result.playerId).toBe('player2');
        expect(result.startingPosition).toEqual(position);
    });

    it('should return null for invalid player or position', () => {
        // Test with null player
        const result1 = initializeJokerMovement(null, { row: 0, col: 0 });
        expect(result1).toBeNull();
        
        // Test with null position
        const result2 = initializeJokerMovement({ id: 'player1' }, null);
        expect(result2).toBeNull();
        
        // Test with undefined player
        const result3 = initializeJokerMovement(undefined, { row: 0, col: 0 });
        expect(result3).toBeNull();
    });

    it('should return null when player not on joker card', () => {
        const player = { id: 'player1' };
        const position = { row: 0, col: 1 }; // A card, not joker
        
        const result = initializeJokerMovement(player, position);
        
        expect(result).toBeNull();
    });

    it('should log initialization messages', () => {
        const player = { id: 'player1' };
        const position = { row: 0, col: 0 };
        
        initializeJokerMovement(player, position);
        
        expect(consoleLogs.some(log => log.includes('Initializing joker movement'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Joker movement initialized'))).toBe(true);
    });
});

describe('isValidJokerMoveStep', () => {
    let jokerState;

    beforeEach(() => {
        jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 0 },
            maxDistance: 4,
            remainingDistance: 4,
            movePath: [{ row: 0, col: 0 }],
            canEndTurn: true,
            isActive: true
        };
    });

    it('should validate adjacent orthogonal position', () => {
        const result = isValidJokerMoveStep(jokerState, { row: 0, col: 1 });
        
        expect(result.valid).toBe(true);
        expect(result.reason).toBe('Valid joker move step');
    });

    it('should validate wraparound movement', () => {
        const result = isValidJokerMoveStep(jokerState, { row: 3, col: 0 });
        
        expect(result.valid).toBe(true);
        expect(result.reason).toBe('Valid joker move step');
    });

    it('should reject diagonal movement', () => {
        const result = isValidJokerMoveStep(jokerState, { row: 1, col: 1 });
        
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('not adjacent');
    });

    it('should reject revisited position', () => {
        jokerState.movePath.push({ row: 0, col: 1 });
        jokerState.currentPosition = { row: 0, col: 1 };
        
        const result = isValidJokerMoveStep(jokerState, { row: 0, col: 0 });
        
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('already visited');
    });

    it('should reject when no remaining distance', () => {
        jokerState.remainingDistance = 0;
        
        const result = isValidJokerMoveStep(jokerState, { row: 0, col: 1 });
        
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('No remaining movement distance');
    });

    it('should reject when joker state is inactive', () => {
        jokerState.isActive = false;
        
        const result = isValidJokerMoveStep(jokerState, { row: 0, col: 1 });
        
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('No active joker movement state');
    });

    it('should reject occupied positions', () => {
        // Mock occupied position
        mockGameState.players.push({ id: 'player2', position: { row: 0, col: 1 } });
        
        const result = isValidJokerMoveStep(jokerState, { row: 0, col: 1 });
        
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('occupied');
        
        // Clean up
        mockGameState.players.pop();
    });

    it('should reject collapsed cards', () => {
        // Mock collapsed card
        mockGameState.board[0][1].collapsed = true;
        
        const result = isValidJokerMoveStep(jokerState, { row: 0, col: 1 });
        
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Target position has collapsed card');
        
        // Clean up
        mockGameState.board[0][1].collapsed = false;
    });
});

describe('executeJokerMoveStep', () => {
    beforeEach(() => {
        mockGameState.jokerMoveState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 0 },
            maxDistance: 4,
            remainingDistance: 4,
            movePath: [{ row: 0, col: 0 }],
            canEndTurn: true,
            isActive: true
        };
    });

    it('should execute valid joker move step', () => {
        const targetPosition = { row: 0, col: 1 };
        const result = executeJokerMoveStep(targetPosition);
        
        expect(result.success).toBe(true);
        expect(result.newPosition).toEqual(targetPosition);
        expect(result.remainingDistance).toBe(3);
        expect(result.canEndTurn).toBe(true);
        expect(result.mustEndTurn).toBe(false);
        
        // Check state updates
        expect(mockGameState.jokerMoveState.currentPosition).toEqual(targetPosition);
        expect(mockGameState.jokerMoveState.movePath).toHaveLength(2);
        expect(mockGameState.jokerMoveState.remainingDistance).toBe(3);
    });

    it('should set mustEndTurn when reaching max distance', () => {
        mockGameState.jokerMoveState.remainingDistance = 1;
        
        const result = executeJokerMoveStep({ row: 0, col: 1 });
        
        expect(result.success).toBe(true);
        expect(result.remainingDistance).toBe(0);
        expect(result.mustEndTurn).toBe(true);
    });

    it('should reject invalid moves', () => {
        const result = executeJokerMoveStep({ row: 1, col: 1 }); // diagonal
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('not adjacent');
    });

    it('should handle no active joker state', () => {
        mockGameState.jokerMoveState = null;
        
        const result = executeJokerMoveStep({ row: 0, col: 1 });
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('No active joker movement state');
    });
});

describe('getValidJokerMoveSteps', () => {
    let jokerState;

    beforeEach(() => {
        jokerState = {
            playerId: 'player1',
            currentPosition: { row: 1, col: 1 }, // Center position
            remainingDistance: 2,
            movePath: [{ row: 0, col: 0 }, { row: 1, col: 1 }],
            isActive: true
        };
    });

    it('should return valid adjacent positions', () => {
        const result = getValidJokerMoveSteps(jokerState);
        
        expect(result.length).toBeGreaterThan(0);
        result.forEach(step => {
            expect(step).toHaveProperty('position');
            expect(step).toHaveProperty('direction');
            expect(step).toHaveProperty('wrapped');
        });
    });

    it('should return empty array for inactive state', () => {
        jokerState.isActive = false;
        
        const result = getValidJokerMoveSteps(jokerState);
        
        expect(result).toEqual([]);
    });

    it('should return empty array when no remaining distance', () => {
        jokerState.remainingDistance = 0;
        
        const result = getValidJokerMoveSteps(jokerState);
        
        expect(result).toEqual([]);
    });

    it('should exclude revisited positions', () => {
        jokerState.movePath.push({ row: 1, col: 0 }); // Block left movement
        
        const result = getValidJokerMoveSteps(jokerState);
        
        // Should not include position (1,0)
        const hasBlockedPosition = result.some(step => 
            step.position.row === 1 && step.position.col === 0
        );
        expect(hasBlockedPosition).toBe(false);
    });
});

describe('canEndJokerTurnEarly', () => {
    it('should allow early end after moving at least 1 space', () => {
        const jokerState = {
            movePath: [{ row: 0, col: 0 }, { row: 0, col: 1 }], // 1 space moved
            canEndTurn: true,
            isActive: true
        };
        
        expect(canEndJokerTurnEarly(jokerState)).toBe(true);
    });

    it('should not allow early end without moving', () => {
        const jokerState = {
            movePath: [{ row: 0, col: 0 }], // 0 spaces moved
            canEndTurn: true,
            isActive: true
        };
        
        expect(canEndJokerTurnEarly(jokerState)).toBe(false);
    });

    it('should not allow early end for inactive state', () => {
        const jokerState = {
            movePath: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
            canEndTurn: true,
            isActive: false
        };
        
        expect(canEndJokerTurnEarly(jokerState)).toBe(false);
    });

    it('should handle null joker state', () => {
        expect(canEndJokerTurnEarly(null)).toBe(false);
    });
});

describe('hasValidJokerMovesRemaining', () => {
    it('should detect valid moves remaining', () => {
        const jokerState = {
            currentPosition: { row: 1, col: 1 },
            remainingDistance: 2,
            movePath: [{ row: 0, col: 0 }, { row: 1, col: 1 }],
            isActive: true
        };
        
        expect(hasValidJokerMovesRemaining(jokerState)).toBe(true);
    });

    it('should detect no valid moves when no remaining distance', () => {
        const jokerState = {
            remainingDistance: 0,
            isActive: true
        };
        
        expect(hasValidJokerMovesRemaining(jokerState)).toBe(false);
    });

    it('should detect no valid moves for inactive state', () => {
        const jokerState = {
            remainingDistance: 2,
            isActive: false
        };
        
        expect(hasValidJokerMovesRemaining(jokerState)).toBe(false);
    });
});

describe('getJokerMovementSummary', () => {
    it('should return comprehensive movement summary', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 2 },
            remainingDistance: 2,
            movePath: [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 2 }
            ],
            canEndTurn: true
        };
        
        const result = getJokerMovementSummary(jokerState);
        
        expect(result.playerId).toBe('player1');
        expect(result.startingPosition).toEqual({ row: 0, col: 0 });
        expect(result.currentPosition).toEqual({ row: 0, col: 2 });
        expect(result.spacesMoved).toBe(2);
        expect(result.remainingDistance).toBe(2);
        expect(result.canEndTurn).toBe(true);
        expect(result.mustEndTurn).toBe(false);
        expect(result.movePath).toHaveLength(3);
    });

    it('should calculate mustEndTurn correctly', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 2 },
            remainingDistance: 0, // No remaining distance
            movePath: [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 2 }
            ],
            canEndTurn: true
        };
        
        const result = getJokerMovementSummary(jokerState);
        
        expect(result.mustEndTurn).toBe(true);
    });

    it('should return null for null joker state', () => {
        expect(getJokerMovementSummary(null)).toBeNull();
    });
});

describe('resetJokerMovementState', () => {
    it('should reset active joker movement state', () => {
        mockGameState.jokerMoveState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 1 },
            movePath: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
            remainingDistance: 3,
            canEndTurn: true,
            isActive: true
        };
        
        const result = resetJokerMovementState();
        
        expect(result.success).toBe(true);
        expect(result.previousState).not.toBeNull();
        expect(mockGameState.jokerMoveState).toBeNull();
        expect(mockFunctions.clearValidationCache).toHaveBeenCalled();
    });

    it('should handle no active joker state', () => {
        mockGameState.jokerMoveState = null;
        
        const result = resetJokerMovementState();
        
        expect(result.success).toBe(true);
        expect(result.previousState).toBeNull();
    });

    it('should log reset messages', () => {
        mockGameState.jokerMoveState = { playerId: 'test' };
        
        resetJokerMovementState();
        
        expect(consoleLogs.some(log => log.includes('Resetting joker movement state'))).toBe(true);
    });
});

describe('canStartJokerMovement', () => {
    it('should allow starting on red joker', () => {
        const result = canStartJokerMovement();
        
        expect(result.canStart).toBe(true);
        expect(result.cardType).toBe('red-joker');
        expect(result.position).toEqual({ row: 0, col: 0 });
    });

    it('should allow starting on black joker', () => {
        // Mock current player on black joker by updating the context
        context.getCurrentPlayer = () => ({
            id: 'player2',
            isPlaced: () => true,
            getPosition: () => ({ row: 3, col: 3 })
        });
        
        const result = canStartJokerMovement();
        
        expect(result.canStart).toBe(true);
        expect(result.cardType).toBe('black-joker');
        
        // Restore mock
        context.getCurrentPlayer = () => ({
            id: 'player1',
            isPlaced: () => true,
            getPosition: () => ({ row: 0, col: 0 })
        });
    });

    it('should reject starting on non-joker card', () => {
        // Mock current player on A card
        context.getCurrentPlayer = () => ({
            id: 'player1',
            isPlaced: () => true,
            getPosition: () => ({ row: 0, col: 1 })
        });
        
        const result = canStartJokerMovement();
        
        expect(result.canStart).toBe(false);
        expect(result.reason).toContain('not a joker card');
        
        // Restore mock
        context.getCurrentPlayer = () => ({
            id: 'player1',
            isPlaced: () => true,
            getPosition: () => ({ row: 0, col: 0 })
        });
    });

    it('should handle no current player', () => {
        context.getCurrentPlayer = () => null;
        
        const result = canStartJokerMovement();
        
        expect(result.canStart).toBe(false);
        expect(result.reason).toContain('No current player');
        
        // Restore mock
        context.getCurrentPlayer = () => ({
            id: 'player1',
            isPlaced: () => true,
            getPosition: () => ({ row: 0, col: 0 })
        });
    });
});

describe('startJokerMovement', () => {
    it('should successfully start joker movement', () => {
        // Mock getJokerMovementStateInfo since it might not be available
        context.getJokerMovementStateInfo = () => ({ active: true });
        
        const result = startJokerMovement();
        
        expect(result.success).toBe(true);
        expect(result.jokerState).not.toBeNull();
        expect(result.jokerState.playerId).toBe('player1');
        expect(mockGameState.jokerMoveState).not.toBeNull();
    });

    it('should fail when not on joker card', () => {
        // Mock current player on non-joker card
        context.getCurrentPlayer = () => ({
            id: 'player1',
            isPlaced: () => true,
            getPosition: () => ({ row: 0, col: 1 })
        });
        
        const result = startJokerMovement();
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('not a joker card');
        
        // Restore mock
        context.getCurrentPlayer = () => ({
            id: 'player1',
            isPlaced: () => true,
            getPosition: () => ({ row: 0, col: 0 })
        });
    });

    it('should log starting messages', () => {
        startJokerMovement();
        
        expect(consoleLogs.some(log => log.includes('Starting joker movement'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Joker movement started successfully'))).toBe(true);
    });
});