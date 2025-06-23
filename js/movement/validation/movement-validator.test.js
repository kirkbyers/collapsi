// Unit tests for movement-validator.js
// Tests main validation orchestration and comprehensive move validation

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load dependencies first - we need functions from other modules
const endingValidatorPath = path.join(__dirname, 'ending-validator.js');
const endingValidatorCode = fs.readFileSync(endingValidatorPath, 'utf8');

const pathValidationPath = path.join(__dirname, '../core/path-validation.js');
const pathValidationCode = fs.readFileSync(pathValidationPath, 'utf8');

const cardMovementPath = path.join(__dirname, '../core/card-movement.js');
const cardMovementCode = fs.readFileSync(cardMovementPath, 'utf8');

const optimizedValidatorPath = path.join(__dirname, 'optimized-validator.js');
const optimizedValidatorCode = fs.readFileSync(optimizedValidatorPath, 'utf8');

// Load the module being tested
const movementValidatorPath = path.join(__dirname, 'movement-validator.js');
const movementValidatorCode = fs.readFileSync(movementValidatorPath, 'utf8');

// Create a mock console to capture logs
let consoleLogs = [];
const mockConsole = {
    log: (message) => { consoleLogs.push(message); },
    error: (message) => { consoleLogs.push(`ERROR: ${message}`); }
};

// Mock performance API for Node.js environment
const mockPerformance = {
    now: () => Date.now()
};

// Create context with all dependencies
const context = {
    console: mockConsole,
    performance: mockPerformance,
    // Functions we'll extract
    validateMove: undefined,
    validateMoveStep: undefined,
    validateCompleteGameMove: undefined
};
vm.createContext(context);

// Execute all dependencies in order
vm.runInContext(cardMovementCode, context);
vm.runInContext(pathValidationCode, context);
vm.runInContext(endingValidatorCode, context);
vm.runInContext(optimizedValidatorCode, context);
vm.runInContext(movementValidatorCode, context);

// Extract functions from context
const { validateMove, validateMoveStep, validateCompleteGameMove } = context;

// Reset console logs before each test
beforeEach(() => {
    consoleLogs = [];
});

// Test fixtures
const mockGameBoard = [
    [
        { type: 'red-joker', hasPlayer: true, playerId: 'player1', collapsed: false },
        { type: 'A', hasPlayer: false, collapsed: false },
        { type: '2', hasPlayer: false, collapsed: false }, // Changed to not collapsed
        { type: '3', hasPlayer: false, collapsed: false }
    ],
    [
        { type: 'A', hasPlayer: false, collapsed: false },
        { type: '4', hasPlayer: false, collapsed: false },
        { type: '3', hasPlayer: false, collapsed: false },
        { type: '2', hasPlayer: true, playerId: 'player2', collapsed: false }
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
];

const mockPlayers = [
    { id: 'player1', position: { row: 0, col: 0 } },
    { id: 'player2', position: { row: 1, col: 3 } }
];

describe('validateMove', () => {
    it('should validate a complete valid move', () => {
        const path = [{ row: 0, col: 1 }, { row: 0, col: 2 }];
        const result = validateMove({ row: 0, col: 1 }, path, 1, 'A', mockGameBoard, mockPlayers, 'player1');
        expect(result.valid).toBe(true);
    });

    it('should reject invalid input parameters', () => {
        expect(validateMove(null, [], 1, 'A', mockGameBoard, mockPlayers, 'player1').valid).toBe(false);
        expect(validateMove({ row: 0, col: 0 }, null, 1, 'A', mockGameBoard, mockPlayers, 'player1').valid).toBe(false);
        expect(validateMove({ row: 0, col: 0 }, 'not-array', 1, 'A', mockGameBoard, mockPlayers, 'player1').valid).toBe(false);
        expect(validateMove({ row: 0, col: 0 }, [{ row: 0, col: 0 }], 1, 'A', mockGameBoard, mockPlayers, 'player1').valid).toBe(false);
    });

    it('should use optimized validation', () => {
        const path = [{ row: 0, col: 1 }, { row: 0, col: 2 }];
        const result = validateMove({ row: 0, col: 1 }, path, 1, 'A', mockGameBoard, mockPlayers, 'player1');
        expect(result).toHaveProperty('executionTime');
    });

    it('should log validation messages', () => {
        const path = [{ row: 0, col: 1 }, { row: 0, col: 2 }];
        validateMove({ row: 0, col: 1 }, path, 1, 'A', mockGameBoard, mockPlayers, 'player1');
        expect(consoleLogs.some(log => log.includes('Running comprehensive move validation'))).toBe(true);
    });
});

describe('validateMoveStep', () => {
    it('should validate a valid orthogonal step', () => {
        const result = validateMoveStep({ row: 0, col: 1 }, { row: 0, col: 2 }, [{ row: 0, col: 1 }], mockGameBoard, mockPlayers);
        expect(result.valid).toBe(true);
        expect(result.reason).toBe('Valid move step');
    });

    it('should reject diagonal movement', () => {
        const result = validateMoveStep({ row: 0, col: 1 }, { row: 1, col: 2 }, [{ row: 0, col: 1 }], mockGameBoard, mockPlayers);
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('diagonal');
    });

    it('should reject revisited position', () => {
        const currentPath = [{ row: 0, col: 1 }, { row: 0, col: 2 }];
        const result = validateMoveStep({ row: 0, col: 2 }, { row: 0, col: 1 }, currentPath, mockGameBoard, mockPlayers);
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('already visited');
    });

    it('should reject move to occupied position', () => {
        const result = validateMoveStep({ row: 0, col: 1 }, { row: 0, col: 0 }, [{ row: 0, col: 1 }], mockGameBoard, mockPlayers);
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Position occupied by player1');
    });

    it('should reject move to collapsed card', () => {
        const boardWithCollapsed = JSON.parse(JSON.stringify(mockGameBoard));
        boardWithCollapsed[0][2].collapsed = true; // Make position (0,2) collapsed
        
        const result = validateMoveStep({ row: 0, col: 1 }, { row: 0, col: 2 }, [{ row: 0, col: 1 }], boardWithCollapsed, mockPlayers);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Card is collapsed (face-down)');
    });

    it('should handle wraparound movement', () => {
        const result = validateMoveStep({ row: 0, col: 0 }, { row: 3, col: 0 }, [{ row: 0, col: 0 }], mockGameBoard, mockPlayers);
        expect(result.valid).toBe(true); // Assuming position (3,0) is not occupied or collapsed
    });

    it('should log step validation messages', () => {
        validateMoveStep({ row: 0, col: 1 }, { row: 0, col: 2 }, [{ row: 0, col: 1 }], mockGameBoard, mockPlayers);
        expect(consoleLogs.some(log => log.includes('Validating move step'))).toBe(true);
    });
});

describe('validateCompleteGameMove', () => {
    it('should validate complete valid game move', () => {
        const path = [{ row: 0, col: 1 }, { row: 1, col: 1 }];
        const result = validateCompleteGameMove(
            { row: 0, col: 1 }, // starting
            { row: 1, col: 1 }, // ending
            path,
            1, // distance
            'A', // card type
            mockGameBoard,
            mockPlayers,
            'player1'
        );
        expect(result.valid).toBe(true);
        expect(result.reason).toBe('All validations passed');
        expect(result.validations).toHaveProperty('distance');
        expect(result.validations).toHaveProperty('path');
        expect(result.validations).toHaveProperty('ending');
    });

    it('should detect invalid movement distance', () => {
        const path = [{ row: 0, col: 1 }, { row: 1, col: 1 }];
        const result = validateCompleteGameMove(
            { row: 0, col: 1 },
            { row: 1, col: 1 },
            path,
            2, // Wrong distance for 'A' card
            'A',
            mockGameBoard,
            mockPlayers,
            'player1'
        );
        expect(result.valid).toBe(false);
        expect(result.type).toBe('distance');
        expect(result.reason).toContain("Card 'A' requires exactly 1 spaces");
    });

    it('should detect invalid path', () => {
        const path = [{ row: 0, col: 1 }, { row: 2, col: 1 }]; // 2-space jump, not valid orthogonal
        const result = validateCompleteGameMove(
            { row: 0, col: 1 },
            { row: 2, col: 1 },
            path,
            1,
            'A',
            mockGameBoard,
            mockPlayers,
            'player1'
        );
        expect(result.valid).toBe(false);
        expect(result.type).toBe('path');
    });

    it('should detect invalid ending position', () => {
        const path = [{ row: 0, col: 1 }, { row: 0, col: 0 }]; // Ending on occupied position
        const result = validateCompleteGameMove(
            { row: 0, col: 1 },
            { row: 0, col: 0 },
            path,
            1,
            'A',
            mockGameBoard,
            mockPlayers,
            'player1'
        );
        expect(result.valid).toBe(false);
        expect(result.type).toBe('ending');
        expect(result.reason).toContain('occupied by current player');
    });

    it('should validate joker movement with variable distance', () => {
        const path = [
            { row: 0, col: 1 },
            { row: 1, col: 1 },
            { row: 2, col: 1 }
        ];
        const result = validateCompleteGameMove(
            { row: 0, col: 1 },
            { row: 2, col: 1 },
            path,
            2,
            'red-joker',
            mockGameBoard,
            mockPlayers,
            'player1'
        );
        expect(result.valid).toBe(true);
    });

    it('should validate longer paths', () => {
        const path = [
            { row: 2, col: 0 },
            { row: 2, col: 1 },
            { row: 2, col: 2 },
            { row: 2, col: 3 },
            { row: 1, col: 3 }
        ];
        // Note: This will likely fail because row 1, col 3 is occupied, but tests the path validation logic
        const result = validateCompleteGameMove(
            { row: 2, col: 0 },
            { row: 1, col: 3 },
            path,
            4,
            '4',
            mockGameBoard,
            mockPlayers,
            'player1'
        );
        expect(result.valid).toBe(false);
        expect(result.type).toBe('ending'); // Should fail on ending validation
    });

    it('should handle edge cases with wraparound', () => {
        const path = [
            { row: 0, col: 0 },
            { row: 3, col: 0 } // Wraparound move
        ];
        const result = validateCompleteGameMove(
            { row: 0, col: 0 },
            { row: 3, col: 0 },
            path,
            1,
            'A',
            mockGameBoard,
            mockPlayers,
            'player2' // Different player
        );
        // This should actually pass since player2 is not at (0,0) and (3,0) is not occupied
        expect(result.valid).toBe(true);
    });

    it('should provide comprehensive validation details on success', () => {
        const path = [{ row: 2, col: 0 }, { row: 2, col: 1 }];
        const result = validateCompleteGameMove(
            { row: 2, col: 0 },
            { row: 2, col: 1 },
            path,
            1,
            'A',
            mockGameBoard,
            mockPlayers,
            'player1'
        );
        expect(result.valid).toBe(true);
        expect(result.validations.distance.valid).toBe(true);
        expect(result.validations.path.valid).toBe(true);
        expect(result.validations.ending.valid).toBe(true);
    });

    it('should log complete game move validation', () => {
        const path = [{ row: 2, col: 0 }, { row: 2, col: 1 }];
        validateCompleteGameMove(
            { row: 2, col: 0 },
            { row: 2, col: 1 },
            path,
            1,
            'A',
            mockGameBoard,
            mockPlayers,
            'player1'
        );
        expect(consoleLogs.some(log => log.includes('Validating complete game move'))).toBe(true);
    });
});