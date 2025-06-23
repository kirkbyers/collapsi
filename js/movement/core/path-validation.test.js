// Unit tests for path-validation.js
// Tests path validation logic including orthogonal movement and revisit prevention

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load the module being tested
const pathValidationPath = path.join(__dirname, 'path-validation.js');
const pathValidationCode = fs.readFileSync(pathValidationPath, 'utf8');

// Create a mock console to capture logs
let consoleLogs = [];
const mockConsole = {
    log: (message) => { consoleLogs.push(message); },
    error: (message) => { consoleLogs.push(`ERROR: ${message}`); }
};

// Create context with the functions we need
const context = {
    console: mockConsole,
    isOrthogonalStep: undefined,
    validateOrthogonalPath: undefined,
    isPositionVisited: undefined,
    validateNoRevisitedCards: undefined,
    getInvalidNextPositions: undefined,
    isValidNextPosition: undefined,
    validateCompletePath: undefined
};
vm.createContext(context);

// Execute the code in the context
vm.runInContext(pathValidationCode, context);

// Extract functions from context
const { isOrthogonalStep, validateOrthogonalPath, isPositionVisited, validateNoRevisitedCards, getInvalidNextPositions, isValidNextPosition, validateCompletePath } = context;

// Reset console logs before each test
beforeEach(() => {
    consoleLogs = [];
});

describe('isOrthogonalStep', () => {
    describe('valid orthogonal movements', () => {
        it('should validate direct adjacent movements', () => {
            expect(isOrthogonalStep({ row: 1, col: 1 }, { row: 0, col: 1 }).valid).toBe(true); // up
            expect(isOrthogonalStep({ row: 1, col: 1 }, { row: 2, col: 1 }).valid).toBe(true); // down
            expect(isOrthogonalStep({ row: 1, col: 1 }, { row: 1, col: 0 }).valid).toBe(true); // left
            expect(isOrthogonalStep({ row: 1, col: 1 }, { row: 1, col: 2 }).valid).toBe(true); // right
        });

        it('should validate wraparound movements', () => {
            expect(isOrthogonalStep({ row: 0, col: 1 }, { row: 3, col: 1 }).valid).toBe(true); // vertical wrap
            expect(isOrthogonalStep({ row: 3, col: 1 }, { row: 0, col: 1 }).valid).toBe(true); // vertical wrap
            expect(isOrthogonalStep({ row: 1, col: 0 }, { row: 1, col: 3 }).valid).toBe(true); // horizontal wrap
            expect(isOrthogonalStep({ row: 1, col: 3 }, { row: 1, col: 0 }).valid).toBe(true); // horizontal wrap
        });

        it('should provide correct difference calculations', () => {
            const result = isOrthogonalStep({ row: 1, col: 1 }, { row: 0, col: 1 });
            expect(result.rowDiff).toBe(1);
            expect(result.colDiff).toBe(0);
        });
    });

    describe('invalid movements', () => {
        it('should reject diagonal movements', () => {
            const result = isOrthogonalStep({ row: 1, col: 1 }, { row: 2, col: 2 });
            expect(result.valid).toBe(false);
            expect(result.reason).toContain('diagonal or multi-space step');
        });

        it('should reject multi-space movements', () => {
            const result = isOrthogonalStep({ row: 1, col: 1 }, { row: 3, col: 1 });
            expect(result.valid).toBe(false);
            expect(result.reason).toContain('row diff: 2');
        });

        it('should reject same position', () => {
            const result = isOrthogonalStep({ row: 1, col: 1 }, { row: 1, col: 1 });
            expect(result.valid).toBe(false);
        });

        it('should reject L-shaped movements', () => {
            const result = isOrthogonalStep({ row: 1, col: 1 }, { row: 2, col: 3 });
            expect(result.valid).toBe(false);
            expect(result.reason).toContain('row diff: 1, col diff: 2');
        });
    });

    describe('input validation', () => {
        it('should handle missing positions', () => {
            expect(isOrthogonalStep(null, { row: 1, col: 1 }).valid).toBe(false);
            expect(isOrthogonalStep({ row: 1, col: 1 }, null).valid).toBe(false);
            expect(isOrthogonalStep(null, null).valid).toBe(false);
        });

        it('should handle invalid position coordinates', () => {
            expect(isOrthogonalStep({ row: 'invalid' }, { row: 1, col: 1 }).valid).toBe(false);
            expect(isOrthogonalStep({ row: 1, col: 1 }, { col: 1 }).valid).toBe(false);
        });
    });

    it('should log step checking messages', () => {
        isOrthogonalStep({ row: 1, col: 1 }, { row: 0, col: 1 });
        expect(consoleLogs.some(log => log.includes('Checking orthogonal step'))).toBe(true);
    });
});

describe('validateOrthogonalPath', () => {
    it('should validate simple 2-position path', () => {
        const path = [{ row: 1, col: 1 }, { row: 1, col: 2 }];
        const result = validateOrthogonalPath(path);
        expect(result.valid).toBe(true);
        expect(result.totalSteps).toBe(1);
    });

    it('should validate multi-step orthogonal path', () => {
        const path = [
            { row: 1, col: 1 },
            { row: 1, col: 2 },
            { row: 2, col: 2 },
            { row: 2, col: 1 }
        ];
        const result = validateOrthogonalPath(path);
        expect(result.valid).toBe(true);
        expect(result.totalSteps).toBe(3);
    });

    it('should validate path with wraparound', () => {
        const path = [
            { row: 0, col: 1 },
            { row: 3, col: 1 }, // vertical wraparound
            { row: 3, col: 0 }
        ];
        const result = validateOrthogonalPath(path);
        expect(result.valid).toBe(true);
    });

    it('should reject path with diagonal step', () => {
        const path = [
            { row: 1, col: 1 },
            { row: 2, col: 2 } // diagonal
        ];
        const result = validateOrthogonalPath(path);
        expect(result.valid).toBe(false);
        expect(result.failedStep).toBe(1);
        expect(result.reason).toContain('Step 1 invalid');
    });

    it('should reject path with multi-space step', () => {
        const path = [
            { row: 1, col: 1 },
            { row: 1, col: 3 } // 2-space jump (not wraparound)
        ];
        const result = validateOrthogonalPath(path);
        expect(result.valid).toBe(false);
    });

    it('should handle short paths', () => {
        expect(validateOrthogonalPath([]).valid).toBe(true);
        expect(validateOrthogonalPath([{ row: 1, col: 1 }]).valid).toBe(true);
    });

    it('should handle invalid input', () => {
        expect(validateOrthogonalPath(null).valid).toBe(false);
        expect(validateOrthogonalPath('not-array').valid).toBe(false);
    });

    it('should identify specific failed step', () => {
        const path = [
            { row: 1, col: 1 },
            { row: 1, col: 2 }, // valid
            { row: 3, col: 2 }  // invalid (2-space jump)
        ];
        const result = validateOrthogonalPath(path);
        expect(result.valid).toBe(false);
        expect(result.failedStep).toBe(2);
    });
});

describe('isPositionVisited', () => {
    it('should detect visited position', () => {
        const visited = [{ row: 1, col: 1 }, { row: 2, col: 2 }];
        expect(isPositionVisited({ row: 1, col: 1 }, visited)).toBe(true);
        expect(isPositionVisited({ row: 2, col: 2 }, visited)).toBe(true);
    });

    it('should detect unvisited position', () => {
        const visited = [{ row: 1, col: 1 }, { row: 2, col: 2 }];
        expect(isPositionVisited({ row: 3, col: 3 }, visited)).toBe(false);
        expect(isPositionVisited({ row: 1, col: 2 }, visited)).toBe(false);
    });

    it('should handle empty visited array', () => {
        expect(isPositionVisited({ row: 1, col: 1 }, [])).toBe(false);
    });

    it('should handle invalid inputs gracefully', () => {
        // Should default to "visited" (true) to prevent invalid moves
        expect(isPositionVisited(null, [])).toBe(true);
        expect(isPositionVisited({ row: 1, col: 1 }, null)).toBe(true);
    });
});

describe('validateNoRevisitedCards', () => {
    it('should validate path with no revisits', () => {
        const path = [
            { row: 1, col: 1 },
            { row: 1, col: 2 },
            { row: 2, col: 2 },
            { row: 2, col: 1 }
        ];
        const result = validateNoRevisitedCards(path);
        expect(result.valid).toBe(true);
        expect(result.totalUniquePositions).toBe(4);
    });

    it('should detect revisited position', () => {
        const path = [
            { row: 1, col: 1 },
            { row: 1, col: 2 },
            { row: 1, col: 1 } // revisit
        ];
        const result = validateNoRevisitedCards(path);
        expect(result.valid).toBe(false);
        expect(result.revisitedPosition).toEqual({ row: 1, col: 1 });
        expect(result.revisitedAtStep).toBe(2);
    });

    it('should handle short paths', () => {
        expect(validateNoRevisitedCards([]).valid).toBe(true);
        expect(validateNoRevisitedCards([{ row: 1, col: 1 }]).valid).toBe(true);
    });

    it('should handle invalid positions in path', () => {
        const path = [
            { row: 1, col: 1 },
            { invalid: 'position' }
        ];
        const result = validateNoRevisitedCards(path);
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Invalid position at step 1');
    });

    it('should handle invalid input', () => {
        expect(validateNoRevisitedCards(null).valid).toBe(false);
        expect(validateNoRevisitedCards('not-array').valid).toBe(false);
    });

    it('should provide detailed success information', () => {
        const path = [{ row: 1, col: 1 }, { row: 1, col: 2 }, { row: 2, col: 2 }];
        const result = validateNoRevisitedCards(path);
        expect(result.valid).toBe(true);
        expect(result.reason).toContain('3 unique positions, no revisits');
    });
});

describe('getInvalidNextPositions', () => {
    it('should return all positions in current path', () => {
        const path = [
            { row: 1, col: 1 },
            { row: 1, col: 2 },
            { row: 2, col: 2 }
        ];
        const result = getInvalidNextPositions(path);
        expect(result).toHaveLength(3);
        expect(result[0]).toEqual({ row: 1, col: 1, reason: 'Already visited in current turn' });
    });

    it('should return empty array for empty path', () => {
        expect(getInvalidNextPositions([])).toEqual([]);
    });

    it('should handle invalid input', () => {
        expect(getInvalidNextPositions(null)).toEqual([]);
        expect(getInvalidNextPositions('invalid')).toEqual([]);
    });
});

describe('isValidNextPosition', () => {
    it('should validate unvisited position', () => {
        const path = [{ row: 1, col: 1 }, { row: 1, col: 2 }];
        const result = isValidNextPosition(path, { row: 2, col: 2 });
        expect(result.valid).toBe(true);
        expect(result.reason).toContain('not yet visited');
    });

    it('should reject already visited position', () => {
        const path = [{ row: 1, col: 1 }, { row: 1, col: 2 }];
        const result = isValidNextPosition(path, { row: 1, col: 1 });
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('already visited');
    });

    it('should handle empty path', () => {
        const result = isValidNextPosition([], { row: 1, col: 1 });
        expect(result.valid).toBe(true);
    });

    it('should handle invalid proposed position', () => {
        const result = isValidNextPosition([], null);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Invalid proposed position');
    });

    it('should handle invalid path', () => {
        const result = isValidNextPosition(null, { row: 1, col: 1 });
        expect(result.valid).toBe(true);
        expect(result.reason).toBe('No current path to check against');
    });
});

describe('validateCompletePath', () => {
    it('should validate complete valid path', () => {
        const path = [
            { row: 1, col: 1 },
            { row: 1, col: 2 },
            { row: 2, col: 2 }
        ];
        const result = validateCompletePath(path);
        expect(result.valid).toBe(true);
        expect(result.orthogonalValid).toBe(true);
        expect(result.noRevisitsValid).toBe(true);
        expect(result.pathLength).toBe(3);
        expect(result.totalSteps).toBe(2);
    });

    it('should detect orthogonal violations', () => {
        const path = [
            { row: 1, col: 1 },
            { row: 2, col: 2 } // diagonal
        ];
        const result = validateCompletePath(path);
        expect(result.valid).toBe(false);
        expect(result.orthogonalValid).toBe(false);
        expect(result.noRevisitsValid).toBe(true);
    });

    it('should detect revisit violations', () => {
        const path = [
            { row: 1, col: 1 },
            { row: 1, col: 2 },
            { row: 1, col: 1 } // revisit
        ];
        const result = validateCompletePath(path);
        expect(result.valid).toBe(false);
        expect(result.orthogonalValid).toBe(true);
        expect(result.noRevisitsValid).toBe(false);
    });

    it('should detect both types of violations', () => {
        const path = [
            { row: 1, col: 1 },
            { row: 2, col: 2 }, // diagonal
            { row: 1, col: 1 } // revisit
        ];
        const result = validateCompletePath(path);
        expect(result.valid).toBe(false);
        expect(result.orthogonalValid).toBe(false);
        expect(result.noRevisitsValid).toBe(false);
    });

    it('should handle short paths', () => {
        expect(validateCompletePath([]).valid).toBe(true);
        expect(validateCompletePath([{ row: 1, col: 1 }]).valid).toBe(true);
    });

    it('should handle invalid input', () => {
        expect(validateCompletePath(null).valid).toBe(false);
        expect(validateCompletePath('invalid').valid).toBe(false);
    });

    it('should provide comprehensive validation details', () => {
        const path = [{ row: 1, col: 1 }, { row: 1, col: 2 }];
        const result = validateCompletePath(path);
        expect(result.reason).toBe('Path passes all validation checks');
    });

    it('should log validation messages', () => {
        validateCompletePath([{ row: 1, col: 1 }, { row: 1, col: 2 }]);
        expect(consoleLogs.some(log => log.includes('Running comprehensive path validation'))).toBe(true);
    });
});