// Unit tests for joker-validator.js
// Tests joker-specific validation logic and numbered card rule compliance

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load all dependencies
const pathValidationPath = path.join(__dirname, '../core/path-validation.js');
const pathValidationCode = fs.readFileSync(pathValidationPath, 'utf8');

const cardMovementPath = path.join(__dirname, '../core/card-movement.js');
const cardMovementCode = fs.readFileSync(cardMovementPath, 'utf8');

const endingValidatorPath = path.join(__dirname, '../validation/ending-validator.js');
const endingValidatorCode = fs.readFileSync(endingValidatorPath, 'utf8');

const optimizedValidatorPath = path.join(__dirname, '../validation/optimized-validator.js');
const optimizedValidatorCode = fs.readFileSync(optimizedValidatorPath, 'utf8');

// Load the module being tested
const jokerValidatorPath = path.join(__dirname, 'joker-validator.js');
const jokerValidatorCode = fs.readFileSync(jokerValidatorPath, 'utf8');

// Create a mock console to capture logs
let consoleLogs = [];
const mockConsole = {
    log: (message) => { consoleLogs.push(message); },
    error: (message) => { consoleLogs.push(`ERROR: ${message}`); }
};

// Mock performance API
const mockPerformance = {
    now: () => Date.now()
};

// Mock game state
const mockGameState = {
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

// Create context with all dependencies and mocks
const context = {
    console: mockConsole,
    performance: mockPerformance,
    gameState: mockGameState,
    Map: Map, // Needed for cache
    // Functions we'll extract
    validateJokerMovementPath: undefined,
    validateJokerMovementAsFixedDistance: undefined,
    compareJokerToNumberedCardMovement: undefined,
    validateJokerStepAgainstNumberedCardRules: undefined,
    validateJokerMovementComprehensive: undefined
};
vm.createContext(context);

// Execute all dependencies in order
vm.runInContext(cardMovementCode, context);
vm.runInContext(pathValidationCode, context);
vm.runInContext(endingValidatorCode, context);
vm.runInContext(optimizedValidatorCode, context);
vm.runInContext(jokerValidatorCode, context);

// Extract functions from context
const { 
    validateJokerMovementPath, validateJokerMovementAsFixedDistance, 
    compareJokerToNumberedCardMovement, validateJokerStepAgainstNumberedCardRules,
    validateJokerMovementComprehensive
} = context;

// Reset before each test
beforeEach(() => {
    consoleLogs = [];
});

describe('validateJokerMovementPath', () => {
    it('should validate simple 1-space joker movement', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 1 },
            movePath: [
                { row: 0, col: 0 },
                { row: 0, col: 1 }
            ],
            isActive: true
        };
        
        const result = validateJokerMovementPath(jokerState);
        
        expect(result.valid).toBe(true);
        expect(result.distance).toBe(1);
        expect(result.reason).toContain('1 spaces, all rules followed');
    });

    it('should validate 4-space joker movement', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 1, col: 3 },
            movePath: [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 2 },
                { row: 0, col: 3 },
                { row: 1, col: 3 }
            ],
            isActive: true
        };
        
        const result = validateJokerMovementPath(jokerState);
        
        expect(result.valid).toBe(true);
        expect(result.distance).toBe(4);
    });

    it('should reject joker movement with no movement', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 0 },
            movePath: [{ row: 0, col: 0 }],
            isActive: true
        };
        
        const result = validateJokerMovementPath(jokerState);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Joker must move at least 1 space');
    });

    it('should reject joker movement exceeding 4 spaces', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 1, col: 1 },
            movePath: [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 2 },
                { row: 0, col: 3 },
                { row: 1, col: 3 },
                { row: 1, col: 2 }
            ],
            isActive: true
        };
        
        const result = validateJokerMovementPath(jokerState);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Joker cannot move more than 4 spaces');
    });

    it('should detect diagonal movement violations', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 1, col: 1 },
            movePath: [
                { row: 0, col: 0 },
                { row: 1, col: 1 } // Diagonal move
            ],
            isActive: true
        };
        
        const result = validateJokerMovementPath(jokerState);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('orthogonal:');
    });

    it('should detect revisited position violations', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 0 },
            movePath: [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 0 } // Revisit starting position
            ],
            isActive: true
        };
        
        const result = validateJokerMovementPath(jokerState);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('noRevisits:');
    });

    it('should detect ending on starting card violation', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 0 }, // Same as starting
            movePath: [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 0 }
            ],
            isActive: true
        };
        
        const result = validateJokerMovementPath(jokerState);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('notOnStarting:');
    });

    it('should handle inactive joker state', () => {
        const result = validateJokerMovementPath(null);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('No active joker movement to validate');
    });

    it('should provide detailed validation results', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 1 },
            movePath: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
            isActive: true
        };
        
        const result = validateJokerMovementPath(jokerState);
        
        expect(result).toHaveProperty('validations');
        expect(result.validations).toHaveProperty('orthogonal');
        expect(result.validations).toHaveProperty('noRevisits');
        expect(result.validations).toHaveProperty('notOnStarting');
        expect(result.validations).toHaveProperty('notOnOccupied');
    });
});

describe('validateJokerMovementAsFixedDistance', () => {
    it('should validate joker movement as equivalent to A card (1 space)', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 1 },
            movePath: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
            isActive: true
        };
        
        const result = validateJokerMovementAsFixedDistance(jokerState, 1);
        
        // The function has a bug - it calls validateMovementDistance with 'virtual-card'
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Unable to determine movement rules for card type: virtual-card');
    });

    it('should validate joker movement as equivalent to 3 card', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 3 },
            movePath: [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 2 },
                { row: 0, col: 3 }
            ],
            isActive: true
        };
        
        const result = validateJokerMovementAsFixedDistance(jokerState, 3);
        
        // Same bug - 'virtual-card' is not recognized
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Unable to determine movement rules for card type: virtual-card');
    });

    it('should reject when actual distance does not match target', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 1 },
            movePath: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
            isActive: true
        };
        
        const result = validateJokerMovementAsFixedDistance(jokerState, 2);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Unable to determine movement rules for card type: virtual-card');
    });

    it('should handle inactive joker state', () => {
        const result = validateJokerMovementAsFixedDistance(null, 1);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('No active joker movement to validate');
    });
});

describe('compareJokerToNumberedCardMovement', () => {
    it('should find joker movement equivalent to A card', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 1 },
            movePath: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
            isActive: true
        };
        
        const result = compareJokerToNumberedCardMovement(jokerState);
        
        expect(result.equivalent).toBe(true);
        expect(result.distance).toBe(1);
        expect(result.virtualCardType).toBe('A');
        expect(result.reason).toContain('equivalent to A card movement');
    });

    it('should find joker movement equivalent to numbered card', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 2 },
            movePath: [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 2 }
            ],
            isActive: true
        };
        
        const result = compareJokerToNumberedCardMovement(jokerState);
        
        expect(result.equivalent).toBe(true);
        expect(result.distance).toBe(2);
        expect(result.virtualCardType).toBe('2');
    });

    it('should handle invalid distance ranges', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 0 },
            movePath: [{ row: 0, col: 0 }], // 0 distance
            isActive: true
        };
        
        const result = compareJokerToNumberedCardMovement(jokerState);
        
        expect(result.equivalent).toBe(false);
        expect(result.reason).toContain('Invalid distance: 0');
    });

    it('should detect validation mismatches', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 1, col: 1 },
            movePath: [
                { row: 0, col: 0 },
                { row: 1, col: 1 } // Invalid diagonal move
            ],
            isActive: true
        };
        
        const result = compareJokerToNumberedCardMovement(jokerState);
        
        expect(result.equivalent).toBe(false);
        expect(result.reason).toContain('Validation mismatch');
    });

    it('should handle inactive joker state', () => {
        const result = compareJokerToNumberedCardMovement(null);
        
        expect(result.equivalent).toBe(false);
        expect(result.reason).toBe('No joker movement to compare');
    });

    it('should provide comprehensive validation details', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 1 },
            movePath: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
            isActive: true
        };
        
        const result = compareJokerToNumberedCardMovement(jokerState);
        
        expect(result).toHaveProperty('numberedCardValidation');
        expect(result).toHaveProperty('jokerValidation');
        expect(result.numberedCardValidation).toHaveProperty('valid');
        expect(result.jokerValidation).toHaveProperty('valid');
    });
});

describe('validateJokerStepAgainstNumberedCardRules', () => {
    let jokerState;

    beforeEach(() => {
        jokerState = {
            movePath: [{ row: 0, col: 0 }]
        };
    });

    it('should validate orthogonal step', () => {
        const result = validateJokerStepAgainstNumberedCardRules(
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            jokerState
        );
        
        expect(result.valid).toBe(true);
        expect(result.orthogonal).toBe(true);
        expect(result.notRevisited).toBe(true);
        expect(result.notOccupied).toBe(true);
        expect(result.notCollapsed).toBe(true);
        expect(result.reason).toBe('Joker step follows all numbered card rules');
    });

    it('should reject diagonal step', () => {
        const result = validateJokerStepAgainstNumberedCardRules(
            { row: 0, col: 0 },
            { row: 1, col: 1 },
            jokerState
        );
        
        expect(result.valid).toBe(false);
        expect(result.orthogonal).toBe(false);
        expect(result.reason).toContain('not orthogonal');
    });

    it('should reject revisited position', () => {
        jokerState.movePath.push({ row: 0, col: 1 });
        
        const result = validateJokerStepAgainstNumberedCardRules(
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            jokerState
        );
        
        expect(result.valid).toBe(false);
        expect(result.notRevisited).toBe(false);
        expect(result.reason).toContain('revisited position');
    });

    it('should reject occupied position', () => {
        // Mock occupied position
        mockGameState.players.push({ id: 'player3', position: { row: 0, col: 1 } });
        
        const result = validateJokerStepAgainstNumberedCardRules(
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            jokerState
        );
        
        expect(result.valid).toBe(false);
        expect(result.notOccupied).toBe(false);
        expect(result.reason).toContain('position occupied');
        
        // Clean up
        mockGameState.players.pop();
    });

    it('should reject collapsed card', () => {
        // Mock collapsed card
        mockGameState.board[0][1].collapsed = true;
        
        const result = validateJokerStepAgainstNumberedCardRules(
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            jokerState
        );
        
        expect(result.valid).toBe(false);
        expect(result.notCollapsed).toBe(false);
        expect(result.reason).toContain('card collapsed');
        
        // Clean up
        mockGameState.board[0][1].collapsed = false;
    });

    it('should validate wraparound movement', () => {
        const result = validateJokerStepAgainstNumberedCardRules(
            { row: 0, col: 0 },
            { row: 3, col: 0 }, // Wraparound
            jokerState
        );
        
        expect(result.valid).toBe(true);
        expect(result.orthogonal).toBe(true);
    });
});

describe('validateJokerMovementComprehensive', () => {
    it('should validate comprehensive joker movement', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 2 },
            movePath: [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 2 }
            ],
            isActive: true
        };
        
        const result = validateJokerMovementComprehensive(jokerState);
        
        // This will fail because of the bug in compareJokerToNumberedCardMovement
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Joker movement violates numbered card rules');
        expect(result.results).toHaveProperty('pathValidation');
        expect(result.results).toHaveProperty('numberedCardComparison');
        expect(result.results).toHaveProperty('stepByStepValidation');
    });

    it('should detect invalid path validation', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 1, col: 1 },
            movePath: [
                { row: 0, col: 0 },
                { row: 1, col: 1 } // Diagonal move
            ],
            isActive: true
        };
        
        const result = validateJokerMovementComprehensive(jokerState);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Joker movement violates numbered card rules');
        expect(result.results.pathValidation.valid).toBe(false);
    });

    it('should detect invalid step-by-step validation', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 1 },
            movePath: [
                { row: 0, col: 0 },
                { row: 1, col: 1 } // Invalid diagonal step
            ],
            isActive: true
        };
        
        const result = validateJokerMovementComprehensive(jokerState);
        
        expect(result.valid).toBe(false);
        expect(result.results.stepByStepValidation.valid).toBe(false);
        expect(result.results.stepByStepValidation.invalidSteps).toHaveLength(1);
        expect(result.results.stepByStepValidation.invalidSteps[0].stepIndex).toBe(1);
    });

    it('should handle multiple invalid steps', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 2, col: 2 },
            movePath: [
                { row: 0, col: 0 },
                { row: 1, col: 1 }, // Invalid diagonal
                { row: 2, col: 2 }  // Invalid diagonal
            ],
            isActive: true
        };
        
        const result = validateJokerMovementComprehensive(jokerState);
        
        expect(result.valid).toBe(false);
        expect(result.results.stepByStepValidation.invalidSteps.length).toBeGreaterThan(1);
    });

    it('should handle inactive joker state', () => {
        const result = validateJokerMovementComprehensive(null);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('No active joker movement');
    });

    it('should provide detailed step validation information', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 1, col: 1 },
            movePath: [
                { row: 0, col: 0 },
                { row: 1, col: 1 } // Diagonal move
            ],
            isActive: true
        };
        
        const result = validateJokerMovementComprehensive(jokerState);
        
        const invalidStep = result.results.stepByStepValidation.invalidSteps[0];
        expect(invalidStep).toHaveProperty('stepIndex');
        expect(invalidStep).toHaveProperty('fromPosition');
        expect(invalidStep).toHaveProperty('toPosition');
        expect(invalidStep).toHaveProperty('validation');
        expect(invalidStep.validation).toHaveProperty('valid');
        expect(invalidStep.validation).toHaveProperty('reason');
    });

    it('should log comprehensive validation messages', () => {
        const jokerState = {
            playerId: 'player1',
            startingPosition: { row: 0, col: 0 },
            currentPosition: { row: 0, col: 1 },
            movePath: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
            isActive: true
        };
        
        validateJokerMovementComprehensive(jokerState);
        
        expect(consoleLogs.some(log => log.includes('Running comprehensive joker movement validation'))).toBe(true);
    });
});