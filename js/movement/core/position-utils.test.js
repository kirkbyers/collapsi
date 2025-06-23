// Unit tests for position-utils.js
// Tests position calculations, wraparound logic, and adjacency functions

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load the module being tested
const positionUtilsPath = path.join(__dirname, 'position-utils.js');
const positionUtilsCode = fs.readFileSync(positionUtilsPath, 'utf8');

// Create a mock console to capture logs
let consoleLogs = [];
const mockConsole = {
    log: (message) => { consoleLogs.push(message); },
    error: (message) => { consoleLogs.push(`ERROR: ${message}`); }
};

// Create context with the functions we need
const context = {
    console: mockConsole,
    getMovementDirection: undefined,
    calculateWraparoundPosition: undefined,
    isWraparoundStep: undefined,
    getAdjacentPositions: undefined
};
vm.createContext(context);

// Execute the code in the context
vm.runInContext(positionUtilsCode, context);

// Extract functions from context
const { getMovementDirection, calculateWraparoundPosition, isWraparoundStep, getAdjacentPositions } = context;

// Reset console logs before each test
beforeEach(() => {
    consoleLogs = [];
});

describe('getMovementDirection', () => {
    it('should detect upward movement', () => {
        const result = getMovementDirection({ row: 1, col: 1 }, { row: 0, col: 1 });
        expect(result.valid).toBe(true);
        expect(result.direction).toBe('up');
        expect(result.vector).toEqual({ row: -1, col: 0 });
    });

    it('should detect downward movement', () => {
        const result = getMovementDirection({ row: 1, col: 1 }, { row: 2, col: 1 });
        expect(result.valid).toBe(true);
        expect(result.direction).toBe('down');
        expect(result.vector).toEqual({ row: 1, col: 0 });
    });

    it('should detect leftward movement', () => {
        const result = getMovementDirection({ row: 1, col: 1 }, { row: 1, col: 0 });
        expect(result.valid).toBe(true);
        expect(result.direction).toBe('left');
        expect(result.vector).toEqual({ row: 0, col: -1 });
    });

    it('should detect rightward movement', () => {
        const result = getMovementDirection({ row: 1, col: 1 }, { row: 1, col: 2 });
        expect(result.valid).toBe(true);
        expect(result.direction).toBe('right');
        expect(result.vector).toEqual({ row: 0, col: 1 });
    });

    it('should reject diagonal movement', () => {
        const result = getMovementDirection({ row: 1, col: 1 }, { row: 2, col: 2 });
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Not an adjacent orthogonal movement');
    });

    it('should reject multi-space movement', () => {
        const result = getMovementDirection({ row: 1, col: 1 }, { row: 3, col: 1 });
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Not an adjacent orthogonal movement');
    });

    it('should reject same position', () => {
        const result = getMovementDirection({ row: 1, col: 1 }, { row: 1, col: 1 });
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Not an adjacent orthogonal movement');
    });

    it('should handle missing positions', () => {
        expect(getMovementDirection(null, { row: 1, col: 1 }).valid).toBe(false);
        expect(getMovementDirection({ row: 1, col: 1 }, null).valid).toBe(false);
        expect(getMovementDirection(null, null).valid).toBe(false);
    });
});

describe('calculateWraparoundPosition', () => {
    describe('basic movement without wraparound', () => {
        it('should move up correctly', () => {
            const result = calculateWraparoundPosition({ row: 2, col: 1 }, 'up');
            expect(result.position).toEqual({ row: 1, col: 1 });
            expect(result.wrapped).toBe(false);
            expect(result.direction).toBe('up');
        });

        it('should move down correctly', () => {
            const result = calculateWraparoundPosition({ row: 1, col: 1 }, 'down');
            expect(result.position).toEqual({ row: 2, col: 1 });
            expect(result.wrapped).toBe(false);
            expect(result.direction).toBe('down');
        });

        it('should move left correctly', () => {
            const result = calculateWraparoundPosition({ row: 1, col: 2 }, 'left');
            expect(result.position).toEqual({ row: 1, col: 1 });
            expect(result.wrapped).toBe(false);
            expect(result.direction).toBe('left');
        });

        it('should move right correctly', () => {
            const result = calculateWraparoundPosition({ row: 1, col: 1 }, 'right');
            expect(result.position).toEqual({ row: 1, col: 2 });
            expect(result.wrapped).toBe(false);
            expect(result.direction).toBe('right');
        });
    });

    describe('wraparound movement', () => {
        it('should wrap from top to bottom', () => {
            const result = calculateWraparoundPosition({ row: 0, col: 1 }, 'up');
            expect(result.position).toEqual({ row: 3, col: 1 });
            expect(result.wrapped).toBe(true);
            expect(result.direction).toBe('up');
        });

        it('should wrap from bottom to top', () => {
            const result = calculateWraparoundPosition({ row: 3, col: 1 }, 'down');
            expect(result.position).toEqual({ row: 0, col: 1 });
            expect(result.wrapped).toBe(true);
            expect(result.direction).toBe('down');
        });

        it('should wrap from left to right', () => {
            const result = calculateWraparoundPosition({ row: 1, col: 0 }, 'left');
            expect(result.position).toEqual({ row: 1, col: 3 });
            expect(result.wrapped).toBe(true);
            expect(result.direction).toBe('left');
        });

        it('should wrap from right to left', () => {
            const result = calculateWraparoundPosition({ row: 1, col: 3 }, 'right');
            expect(result.position).toEqual({ row: 1, col: 0 });
            expect(result.wrapped).toBe(true);
            expect(result.direction).toBe('right');
        });
    });

    describe('input validation', () => {
        it('should reject invalid positions', () => {
            expect(calculateWraparoundPosition(null, 'up')).toBeNull();
            expect(calculateWraparoundPosition({ row: 'invalid' }, 'up')).toBeNull();
            expect(calculateWraparoundPosition({ col: 1 }, 'up')).toBeNull();
        });

        it('should reject out-of-bounds positions', () => {
            expect(calculateWraparoundPosition({ row: -1, col: 1 }, 'up')).toBeNull();
            expect(calculateWraparoundPosition({ row: 4, col: 1 }, 'up')).toBeNull();
            expect(calculateWraparoundPosition({ row: 1, col: -1 }, 'up')).toBeNull();
            expect(calculateWraparoundPosition({ row: 1, col: 4 }, 'up')).toBeNull();
        });

        it('should reject invalid directions', () => {
            expect(calculateWraparoundPosition({ row: 1, col: 1 }, 'invalid')).toBeNull();
            expect(calculateWraparoundPosition({ row: 1, col: 1 }, null)).toBeNull();
        });
    });

    it('should log calculation messages', () => {
        calculateWraparoundPosition({ row: 1, col: 1 }, 'up');
        expect(consoleLogs.some(log => log.includes('Calculating wraparound position'))).toBe(true);
    });
});

describe('isWraparoundStep', () => {
    describe('direct adjacency (no wraparound)', () => {
        it('should detect direct up movement', () => {
            const result = isWraparoundStep({ row: 2, col: 1 }, { row: 1, col: 1 });
            expect(result.isWraparound).toBe(false);
            expect(result.direction).toBe('up');
        });

        it('should detect direct down movement', () => {
            const result = isWraparoundStep({ row: 1, col: 1 }, { row: 2, col: 1 });
            expect(result.isWraparound).toBe(false);
            expect(result.direction).toBe('down');
        });

        it('should detect direct left movement', () => {
            const result = isWraparoundStep({ row: 1, col: 2 }, { row: 1, col: 1 });
            expect(result.isWraparound).toBe(false);
            expect(result.direction).toBe('left');
        });

        it('should detect direct right movement', () => {
            const result = isWraparoundStep({ row: 1, col: 1 }, { row: 1, col: 2 });
            expect(result.isWraparound).toBe(false);
            expect(result.direction).toBe('right');
        });
    });

    describe('wraparound adjacency', () => {
        it('should detect vertical wraparound up (row 0 to row 3)', () => {
            const result = isWraparoundStep({ row: 0, col: 1 }, { row: 3, col: 1 });
            expect(result.isWraparound).toBe(true);
            expect(result.direction).toBe('up');
        });

        it('should detect vertical wraparound down (row 3 to row 0)', () => {
            const result = isWraparoundStep({ row: 3, col: 1 }, { row: 0, col: 1 });
            expect(result.isWraparound).toBe(true);
            expect(result.direction).toBe('down');
        });

        it('should detect horizontal wraparound left (col 0 to col 3)', () => {
            const result = isWraparoundStep({ row: 1, col: 0 }, { row: 1, col: 3 });
            expect(result.isWraparound).toBe(true);
            expect(result.direction).toBe('left');
        });

        it('should detect horizontal wraparound right (col 3 to col 0)', () => {
            const result = isWraparoundStep({ row: 1, col: 3 }, { row: 1, col: 0 });
            expect(result.isWraparound).toBe(true);
            expect(result.direction).toBe('right');
        });
    });

    describe('non-adjacent movement', () => {
        it('should reject diagonal movement', () => {
            const result = isWraparoundStep({ row: 1, col: 1 }, { row: 2, col: 2 });
            expect(result.isWraparound).toBe(false);
            expect(result.direction).toBeNull();
            expect(result.reason).toContain('Not an adjacent movement');
        });

        it('should reject multi-space movement', () => {
            const result = isWraparoundStep({ row: 1, col: 1 }, { row: 3, col: 1 });
            expect(result.isWraparound).toBe(false);
            expect(result.direction).toBeNull();
        });
    });

    it('should handle missing positions', () => {
        expect(isWraparoundStep(null, { row: 1, col: 1 }).isWraparound).toBe(false);
        expect(isWraparoundStep({ row: 1, col: 1 }, null).isWraparound).toBe(false);
    });

    it('should log checking messages', () => {
        isWraparoundStep({ row: 1, col: 1 }, { row: 1, col: 2 });
        expect(consoleLogs.some(log => log.includes('Checking wraparound step'))).toBe(true);
    });
});

describe('getAdjacentPositions', () => {
    it('should return 4 adjacent positions for middle position', () => {
        const result = getAdjacentPositions({ row: 1, col: 1 });
        expect(result).toHaveLength(4);
        
        const positions = result.map(r => r.position);
        expect(positions).toContainEqual({ row: 0, col: 1 }); // up
        expect(positions).toContainEqual({ row: 2, col: 1 }); // down
        expect(positions).toContainEqual({ row: 1, col: 0 }); // left
        expect(positions).toContainEqual({ row: 1, col: 2 }); // right
    });

    it('should indicate wraparound for edge positions', () => {
        const result = getAdjacentPositions({ row: 0, col: 0 });
        expect(result).toHaveLength(4);
        
        // Check that some positions are marked as wrapped
        const wrappedResults = result.filter(r => r.wrapped);
        expect(wrappedResults.length).toBeGreaterThan(0);
        
        // Specifically check wraparound positions
        const upResult = result.find(r => r.direction === 'up');
        expect(upResult.position).toEqual({ row: 3, col: 0 });
        expect(upResult.wrapped).toBe(true);
        
        const leftResult = result.find(r => r.direction === 'left');
        expect(leftResult.position).toEqual({ row: 0, col: 3 });
        expect(leftResult.wrapped).toBe(true);
    });

    it('should include direction information', () => {
        const result = getAdjacentPositions({ row: 1, col: 1 });
        const directions = result.map(r => r.direction);
        expect(directions).toContain('up');
        expect(directions).toContain('down');
        expect(directions).toContain('left');
        expect(directions).toContain('right');
    });

    it('should handle corner positions correctly', () => {
        const result = getAdjacentPositions({ row: 3, col: 3 });
        expect(result).toHaveLength(4);
        
        // Bottom-right corner should wrap for down and right movements
        const downResult = result.find(r => r.direction === 'down');
        expect(downResult.position).toEqual({ row: 0, col: 3 });
        expect(downResult.wrapped).toBe(true);
        
        const rightResult = result.find(r => r.direction === 'right');
        expect(rightResult.position).toEqual({ row: 3, col: 0 });
        expect(rightResult.wrapped).toBe(true);
    });

    it('should return empty array for invalid position', () => {
        expect(getAdjacentPositions(null)).toEqual([]);
        expect(getAdjacentPositions({ row: 'invalid' })).toEqual([]);
        expect(getAdjacentPositions({})).toEqual([]);
    });

    it('should log messages', () => {
        getAdjacentPositions({ row: 1, col: 1 });
        expect(consoleLogs.some(log => log.includes('Getting adjacent positions'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Found 4 adjacent positions'))).toBe(true);
    });
});