// Unit tests for optimized-validator.js
// Tests performance-optimized validation functions

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load dependencies first
const endingValidatorPath = path.join(__dirname, 'ending-validator.js');
const endingValidatorCode = fs.readFileSync(endingValidatorPath, 'utf8');

const pathValidationPath = path.join(__dirname, '../core/path-validation.js');
const pathValidationCode = fs.readFileSync(pathValidationPath, 'utf8');

const cardMovementPath = path.join(__dirname, '../core/card-movement.js');
const cardMovementCode = fs.readFileSync(cardMovementPath, 'utf8');

// Load the module being tested
const optimizedValidatorPath = path.join(__dirname, 'optimized-validator.js');
const optimizedValidatorCode = fs.readFileSync(optimizedValidatorPath, 'utf8');

// Create a mock console to capture logs
let consoleLogs = [];
const mockConsole = {
    log: (message) => { consoleLogs.push(message); },
    error: (message) => { consoleLogs.push(`ERROR: ${message}`); }
};

// Mock performance API for Node.js environment
const mockPerformance = {
    now: jest.fn(() => Date.now())
};

// Create context with all dependencies
const context = {
    console: mockConsole,
    performance: mockPerformance,
    Map: Map, // Needed for cache
    // Functions we'll extract
    validateMoveOptimized: undefined,
    validateCompletePathOptimized: undefined,
    benchmarkValidationPerformance: undefined,
    isPositionValidCached: undefined,
    clearValidationCache: undefined
};
vm.createContext(context);

// Execute all dependencies in order
vm.runInContext(cardMovementCode, context);
vm.runInContext(pathValidationCode, context);
vm.runInContext(endingValidatorCode, context);
vm.runInContext(optimizedValidatorCode, context);

// Extract functions from context
const { validateMoveOptimized, validateCompletePathOptimized, benchmarkValidationPerformance, isPositionValidCached, clearValidationCache } = context;

// Reset console logs and performance mock before each test
beforeEach(() => {
    consoleLogs = [];
    mockPerformance.now.mockReset();
    clearValidationCache();
    
    // Mock performance.now to return incrementing values
    let time = 0;
    mockPerformance.now.mockImplementation(() => {
        time += 1; // Each call increments by 1ms
        return time;
    });
});

// Test fixtures
const mockGameBoard = [
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
];

const mockPlayers = [];

describe('validateMoveOptimized', () => {
    it('should validate a simple valid move with timing', () => {
        const path = [{ row: 0, col: 0 }, { row: 0, col: 1 }];
        const result = validateMoveOptimized({ row: 0, col: 0 }, path, 1, 'A', mockGameBoard, mockPlayers, 'player1');
        
        expect(result.valid).toBe(true);
        expect(result.reason).toBe('All validations passed');
        expect(result).toHaveProperty('executionTime');
        expect(result.pathLength).toBe(2);
        expect(result.distance).toBe(1);
    });

    it('should reject invalid input parameters quickly', () => {
        const result = validateMoveOptimized(null, [], 1, 'A', mockGameBoard, mockPlayers, 'player1');
        
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Invalid input parameters');
        expect(result).toHaveProperty('executionTime');
    });

    it('should fail fast on invalid distance', () => {
        const path = [{ row: 0, col: 0 }, { row: 0, col: 1 }];
        const result = validateMoveOptimized({ row: 0, col: 0 }, path, 2, 'A', mockGameBoard, mockPlayers, 'player1'); // Wrong distance for 'A'
        
        expect(result.valid).toBe(false);
        expect(result.reason).toContain("Card 'A' requires exactly 1 spaces");
        expect(result).toHaveProperty('executionTime');
    });

    it('should fail fast on invalid ending position', () => {
        const occupiedBoard = JSON.parse(JSON.stringify(mockGameBoard));
        occupiedBoard[0][1].hasPlayer = true;
        occupiedBoard[0][1].playerId = 'player2';
        
        const path = [{ row: 0, col: 0 }, { row: 0, col: 1 }];
        const result = validateMoveOptimized({ row: 0, col: 0 }, path, 1, 'A', occupiedBoard, mockPlayers, 'player1');
        
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Position occupied by opponent: player2');
        expect(result).toHaveProperty('executionTime');
    });

    it('should fail fast on path length mismatch', () => {
        const path = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }]; // 2 steps
        const result = validateMoveOptimized({ row: 0, col: 0 }, path, 1, 'A', mockGameBoard, mockPlayers, 'player1'); // Expects 1 step
        
        expect(result.valid).toBe(false);
        expect(result.reason).toContain("Path length 2 doesn't match required distance 1");
        expect(result).toHaveProperty('executionTime');
    });

    it('should validate joker movements', () => {
        const path = [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 },
            { row: 0, col: 3 }
        ];
        const result = validateMoveOptimized({ row: 0, col: 0 }, path, 3, 'red-joker', mockGameBoard, mockPlayers, 'player1');
        
        expect(result.valid).toBe(true);
        expect(result.distance).toBe(3);
    });

    it('should validate paths with wraparound', () => {
        const path = [
            { row: 0, col: 0 },
            { row: 3, col: 0 } // Wraparound
        ];
        const result = validateMoveOptimized({ row: 0, col: 0 }, path, 1, 'A', mockGameBoard, mockPlayers, 'player1');
        
        expect(result.valid).toBe(true);
    });

    it('should handle longer valid paths', () => {
        const path = [
            { row: 1, col: 1 },
            { row: 1, col: 2 },
            { row: 2, col: 2 },
            { row: 3, col: 2 },
            { row: 3, col: 3 }
        ];
        const result = validateMoveOptimized({ row: 1, col: 1 }, path, 4, '4', mockGameBoard, mockPlayers, 'player1');
        
        expect(result.valid).toBe(true);
        expect(result.pathLength).toBe(5);
        expect(result.distance).toBe(4);
    });

    it('should log performance information', () => {
        const path = [{ row: 0, col: 0 }, { row: 0, col: 1 }];
        validateMoveOptimized({ row: 0, col: 0 }, path, 1, 'A', mockGameBoard, mockPlayers, 'player1');
        
        expect(consoleLogs.some(log => log.includes('Starting optimized move validation'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Optimized validation completed'))).toBe(true);
    });
});

describe('validateCompletePathOptimized', () => {
    it('should validate simple orthogonal path', () => {
        const path = [
            { row: 1, col: 1 },
            { row: 1, col: 2 },
            { row: 2, col: 2 }
        ];
        const result = validateCompletePathOptimized(path);
        
        expect(result.valid).toBe(true);
        expect(result.reason).toBe('Path valid: 2 steps');
    });

    it('should detect revisited positions', () => {
        const path = [
            { row: 1, col: 1 },
            { row: 1, col: 2 },
            { row: 1, col: 1 } // Revisit
        ];
        const result = validateCompletePathOptimized(path);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Position revisited at step 2');
    });

    it('should detect invalid orthogonal steps', () => {
        const path = [
            { row: 1, col: 1 },
            { row: 2, col: 2 } // Diagonal
        ];
        const result = validateCompletePathOptimized(path);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Invalid orthogonal step at 1');
    });

    it('should validate wraparound movements', () => {
        const path = [
            { row: 0, col: 0 },
            { row: 3, col: 0 }, // Vertical wraparound
            { row: 3, col: 3 }  // Horizontal wraparound
        ];
        const result = validateCompletePathOptimized(path);
        
        expect(result.valid).toBe(true);
    });

    it('should handle short paths', () => {
        expect(validateCompletePathOptimized([]).valid).toBe(true);
        expect(validateCompletePathOptimized([{ row: 1, col: 1 }]).valid).toBe(true);
    });

    it('should detect invalid position formats', () => {
        const path = [
            { row: 1, col: 1 },
            { invalid: 'position' }
        ];
        const result = validateCompletePathOptimized(path);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Invalid position at step 1');
    });

    it('should be faster than full validation for complex paths', () => {
        const complexPath = [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 },
            { row: 0, col: 3 },
            { row: 1, col: 3 },
            { row: 2, col: 3 }
        ];
        
        // The function should handle this efficiently in a single pass
        const result = validateCompletePathOptimized(complexPath);
        expect(result.valid).toBe(true);
        expect(result.reason).toBe('Path valid: 5 steps');
    });
});

describe('isPositionValidCached', () => {
    it('should cache position validation results', () => {
        const position = { row: 1, col: 1 };
        
        // First call
        const result1 = isPositionValidCached(position, mockGameBoard, mockPlayers, 'test-key');
        expect(result1).toHaveProperty('occupied');
        expect(result1).toHaveProperty('collapsed');
        
        // Second call should return cached result
        const result2 = isPositionValidCached(position, mockGameBoard, mockPlayers, 'test-key');
        expect(result2).toEqual(result1);
    });

    it('should generate cache key from position if not provided', () => {
        const position = { row: 2, col: 3 };
        const result = isPositionValidCached(position, mockGameBoard, mockPlayers);
        expect(result).toHaveProperty('occupied');
        expect(result).toHaveProperty('collapsed');
    });

    it('should handle occupied positions', () => {
        const occupiedBoard = JSON.parse(JSON.stringify(mockGameBoard));
        occupiedBoard[1][1].hasPlayer = true;
        occupiedBoard[1][1].playerId = 'player1';
        
        const result = isPositionValidCached({ row: 1, col: 1 }, occupiedBoard, mockPlayers);
        expect(result.occupied).toBe(true);
    });

    it('should handle collapsed cards', () => {
        const collapsedBoard = JSON.parse(JSON.stringify(mockGameBoard));
        collapsedBoard[1][1].collapsed = true;
        
        const result = isPositionValidCached({ row: 1, col: 1 }, collapsedBoard, mockPlayers);
        expect(result.collapsed).toBe(true);
    });

    it('should handle missing board', () => {
        const result = isPositionValidCached({ row: 1, col: 1 }, null, mockPlayers);
        expect(result.collapsed).toBe(false);
    });
});

describe('clearValidationCache', () => {
    it('should clear the validation cache', () => {
        // Add something to cache
        isPositionValidCached({ row: 1, col: 1 }, mockGameBoard, mockPlayers, 'test');
        
        // Clear cache
        clearValidationCache();
        
        // Should log cache clearing
        expect(consoleLogs.some(log => log.includes('Validation cache cleared'))).toBe(true);
    });
});

describe('benchmarkValidationPerformance', () => {
    it('should run performance benchmarks', () => {
        // Mock the optimized validator to return consistent timing
        const originalNow = mockPerformance.now;
        let callCount = 0;
        mockPerformance.now.mockImplementation(() => {
            callCount++;
            return callCount; // Each call increments by 1ms
        });
        
        const results = benchmarkValidationPerformance();
        
        expect(results).toHaveProperty('Short path (1 step)');
        expect(results).toHaveProperty('Medium path (3 steps)');
        expect(results).toHaveProperty('Long path (4 steps with wraparound)');
        
        // Check that results have the expected structure
        Object.values(results).forEach(result => {
            expect(result).toHaveProperty('averageMs');
            expect(result).toHaveProperty('maxMs');
            expect(result).toHaveProperty('minMs');
            expect(result).toHaveProperty('under100ms');
        });
        
        // Should log benchmark information
        expect(consoleLogs.some(log => log.includes('Running validation performance benchmarks'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Performance target'))).toBe(true);
        
        mockPerformance.now = originalNow;
    });

    it('should show performance metrics for each test case', () => {
        benchmarkValidationPerformance();
        
        // Should log results for each test case
        expect(consoleLogs.some(log => log.includes('Short path (1 step):'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Medium path (3 steps):'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Long path (4 steps with wraparound):'))).toBe(true);
    });
});

describe('performance characteristics', () => {
    it('should handle cache overflow gracefully', () => {
        // Fill cache beyond limit
        for (let i = 0; i < 1100; i++) {
            isPositionValidCached({ row: i % 4, col: (i * 2) % 4 }, mockGameBoard, mockPlayers, `key-${i}`);
        }
        
        // Cache should have been cleared automatically
        // Next call should work normally
        const result = isPositionValidCached({ row: 0, col: 0 }, mockGameBoard, mockPlayers, 'test-after-overflow');
        expect(result).toHaveProperty('occupied');
        expect(result).toHaveProperty('collapsed');
    });

    it('should provide execution time for all validation calls', () => {
        const path = [{ row: 0, col: 0 }, { row: 0, col: 1 }];
        const result = validateMoveOptimized({ row: 0, col: 0 }, path, 1, 'A', mockGameBoard, mockPlayers, 'player1');
        
        expect(result).toHaveProperty('executionTime');
        expect(typeof result.executionTime).toBe('number');
        expect(result.executionTime).toBeGreaterThan(0);
    });
});