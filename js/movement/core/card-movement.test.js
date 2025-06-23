// Unit tests for card-movement.js
// Tests card type definitions and movement distance rules

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load the module being tested
const cardMovementPath = path.join(__dirname, 'card-movement.js');
const cardMovementCode = fs.readFileSync(cardMovementPath, 'utf8');

// Create a mock console to capture logs
let consoleLogs = [];
const mockConsole = {
    log: (message) => { consoleLogs.push(message); },
    error: (message) => { consoleLogs.push(`ERROR: ${message}`); }
};

// Create context with the functions we need
const context = {
    console: mockConsole,
    getCardMovementDistance: undefined,
    validateMovementDistance: undefined
};
vm.createContext(context);

// Execute the code in the context
vm.runInContext(cardMovementCode, context);

// Extract functions from context
const { getCardMovementDistance, validateMovementDistance } = context;

// Reset console logs before each test
beforeEach(() => {
    consoleLogs = [];
});

describe('getCardMovementDistance', () => {
    it('should return joker movement for red-joker', () => {
        const result = getCardMovementDistance('red-joker');
        expect(result).toEqual({
            type: 'joker',
            allowedDistances: [1, 2, 3, 4]
        });
    });

    it('should return joker movement for black-joker', () => {
        const result = getCardMovementDistance('black-joker');
        expect(result).toEqual({
            type: 'joker',
            allowedDistances: [1, 2, 3, 4]
        });
    });

    it('should return fixed distance for numbered cards', () => {
        expect(getCardMovementDistance('A')).toEqual({ type: 'fixed', distance: 1 });
        expect(getCardMovementDistance('2')).toEqual({ type: 'fixed', distance: 2 });
        expect(getCardMovementDistance('3')).toEqual({ type: 'fixed', distance: 3 });
        expect(getCardMovementDistance('4')).toEqual({ type: 'fixed', distance: 4 });
    });

    it('should return null for invalid card types', () => {
        expect(getCardMovementDistance('invalid')).toBeNull();
        expect(getCardMovementDistance('5')).toBeNull();
        expect(getCardMovementDistance('')).toBeNull();
    });

    it('should return null for null/undefined input', () => {
        expect(getCardMovementDistance(null)).toBeNull();
        expect(getCardMovementDistance(undefined)).toBeNull();
    });

    it('should log appropriate messages', () => {
        getCardMovementDistance('A');
        expect(consoleLogs).toContain('Getting movement distance for card type: A');
    });

    it('should log errors for invalid inputs', () => {
        getCardMovementDistance('invalid');
        expect(consoleLogs.some(log => log.includes('ERROR:'))).toBe(true);
    });
});

describe('validateMovementDistance', () => {
    describe('joker cards', () => {
        it('should validate all distances 1-4 for red-joker', () => {
            [1, 2, 3, 4].forEach(distance => {
                const result = validateMovementDistance('red-joker', distance);
                expect(result.valid).toBe(true);
                expect(result.reason).toContain('Valid joker movement');
            });
        });

        it('should validate all distances 1-4 for black-joker', () => {
            [1, 2, 3, 4].forEach(distance => {
                const result = validateMovementDistance('black-joker', distance);
                expect(result.valid).toBe(true);
                expect(result.reason).toContain('Valid joker movement');
            });
        });

        it('should reject invalid distances for jokers', () => {
            const result = validateMovementDistance('red-joker', 5);
            expect(result.valid).toBe(false);
            expect(result.reason).toContain('Invalid distance: 5. Must be between 1 and 4.');
        });
    });

    describe('numbered cards', () => {
        it('should validate exact distance matches', () => {
            expect(validateMovementDistance('A', 1).valid).toBe(true);
            expect(validateMovementDistance('2', 2).valid).toBe(true);
            expect(validateMovementDistance('3', 3).valid).toBe(true);
            expect(validateMovementDistance('4', 4).valid).toBe(true);
        });

        it('should reject incorrect distances for numbered cards', () => {
            expect(validateMovementDistance('A', 2).valid).toBe(false);
            expect(validateMovementDistance('2', 1).valid).toBe(false);
            expect(validateMovementDistance('3', 4).valid).toBe(false);
            expect(validateMovementDistance('4', 3).valid).toBe(false);
        });

        it('should provide descriptive error messages for wrong distances', () => {
            const result = validateMovementDistance('A', 3);
            expect(result.valid).toBe(false);
            expect(result.reason).toContain("Card 'A' requires exactly 1 spaces");
        });
    });

    describe('input validation', () => {
        it('should reject invalid distance ranges', () => {
            expect(validateMovementDistance('A', 0).valid).toBe(false);
            expect(validateMovementDistance('A', 5).valid).toBe(false);
            expect(validateMovementDistance('A', -1).valid).toBe(false);
        });

        it('should reject non-numeric distances', () => {
            expect(validateMovementDistance('A', 'invalid').valid).toBe(false);
            expect(validateMovementDistance('A', null).valid).toBe(false);
            expect(validateMovementDistance('A', undefined).valid).toBe(false);
        });

        it('should reject missing card types', () => {
            expect(validateMovementDistance(null, 1).valid).toBe(false);
            expect(validateMovementDistance(undefined, 1).valid).toBe(false);
            expect(validateMovementDistance('', 1).valid).toBe(false);
        });

        it('should reject unknown card types', () => {
            const result = validateMovementDistance('unknown', 1);
            expect(result.valid).toBe(false);
            expect(result.reason).toContain('Unable to determine movement rules');
        });
    });

    describe('edge cases', () => {
        it('should handle boundary distance values', () => {
            expect(validateMovementDistance('A', 1).valid).toBe(true);
            expect(validateMovementDistance('4', 4).valid).toBe(true);
        });

        it('should provide appropriate success messages', () => {
            const result = validateMovementDistance('2', 2);
            expect(result.valid).toBe(true);
            expect(result.reason).toContain('Valid exact movement: 2 spaces');
        });
    });

    it('should log validation messages', () => {
        validateMovementDistance('A', 1);
        expect(consoleLogs.some(log => log.includes('Validating movement distance'))).toBe(true);
    });
});