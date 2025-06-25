// Unit tests for card-collapse-manager.js
// Tests card collapse management, validation, and visual updates

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load the module being tested
const cardCollapseManagerPath = path.join(__dirname, 'card-collapse-manager.js');
const cardCollapseManagerCode = fs.readFileSync(cardCollapseManagerPath, 'utf8');

// Create a mock console to capture logs
let consoleLogs = [];
const mockConsole = {
    log: (message) => { consoleLogs.push(message); },
    error: (message) => { consoleLogs.push(`ERROR: ${message}`); },
    warn: (message) => { consoleLogs.push(`WARN: ${message}`); }
};

// Mock DOM and dependencies
let mockGameState = {};
let mockCards = {};
let mockDocumentElements = {};

const mockDependencies = {
    console: mockConsole,
    gameState: mockGameState,
    Date: Date,
    setTimeout: jest.fn((fn, delay) => fn()), // Execute immediately for tests
    
    // Mock document
    document: {
        querySelector: jest.fn((selector) => mockDocumentElements[selector] || null)
    },
    
    // Game functions
    getCardAtPosition: jest.fn((row, col) => mockCards[`${row}-${col}`] || null)
};

// Create context with mocked dependencies
const context = { ...mockDependencies };
vm.createContext(context);

// Execute the code in the context
vm.runInContext(cardCollapseManagerCode, context);

// Extract functions from context
const {
    collapseStartingCardAfterMove,
    validateCardCanBeCollapsed,
    validateCollapseAgainstGameRules,
    performCardCollapse,
    updateCardCollapseVisuals,
    isCardCollapsedAt,
    getAllCollapsedCards,
    getCollapsedCardCount,
    restoreCollapsedCard,
    resetAllCardCollapseStates,
    getCollapseStatistics
} = context;

// Reset mocks before each test
beforeEach(() => {
    consoleLogs = [];
    jest.clearAllMocks();
    mockGameState = {};
    mockCards = {};
    mockDocumentElements = {};
    
    // Update the context with fresh mock data
    context.gameState = mockGameState;
    
    // Reset the mock function implementation
    mockDependencies.getCardAtPosition.mockImplementation((row, col) => mockCards[`${row}-${col}`] || null);
    mockDependencies.document.querySelector.mockImplementation((selector) => mockDocumentElements[selector] || null);
});

describe('collapseStartingCardAfterMove', () => {
    test('should collapse card successfully with valid inputs', () => {
        const startingPosition = { row: 1, col: 1 };
        const moveData = {
            playerId: 'player1',
            cardType: 'A',
            startingPosition: { row: 1, col: 1 },
            timestamp: '2023-01-01T12:00:00Z'
        };
        
        mockCards['1-1'] = {
            type: 'A',
            collapsed: false,
            hasPlayer: false
        };
        
        const result = collapseStartingCardAfterMove(startingPosition, moveData);
        
        expect(result.success).toBe(true);
        expect(result.collapseData.position).toEqual(startingPosition);
        expect(result.collapseData.cardType).toBe('A');
        expect(consoleLogs.some(log => log.includes('Collapsing starting card after move completion'))).toBe(true);
    });

    test('should fail when starting card not found', () => {
        const startingPosition = { row: 1, col: 1 };
        const moveData = { playerId: 'player1', cardType: 'A' };
        
        mockDependencies.getCardAtPosition.mockReturnValue(null);
        
        const result = collapseStartingCardAfterMove(startingPosition, moveData);
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Starting card not found');
    });

    test('should fail when card cannot be collapsed', () => {
        const startingPosition = { row: 1, col: 1 };
        const moveData = {
            playerId: 'player1',
            cardType: 'A',
            startingPosition: { row: 1, col: 1 }
        };
        
        mockCards['1-1'] = {
            type: 'A',
            collapsed: true, // Already collapsed
            hasPlayer: false
        };
        
        const result = collapseStartingCardAfterMove(startingPosition, moveData);
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Card is already collapsed');
    });

    test('should handle exceptions gracefully', () => {
        mockDependencies.getCardAtPosition.mockImplementation(() => {
            throw new Error('Test error');
        });
        
        const result = collapseStartingCardAfterMove({ row: 1, col: 1 }, {});
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Card collapse error');
        expect(consoleLogs.some(log => log.includes('ERROR: Error collapsing starting card'))).toBe(true);
    });
});

describe('validateCardCanBeCollapsed', () => {
    test('should validate card can be collapsed when conditions are met', () => {
        const card = { type: 'A', collapsed: false, hasPlayer: false };
        const position = { row: 1, col: 1 };
        const moveData = { startingPosition: { row: 1, col: 1 }, cardType: 'A', playerId: 'player1' };
        
        const result = validateCardCanBeCollapsed(card, position, moveData);
        
        expect(result.canCollapse).toBe(true);
        expect(result.reason).toBe('Card can be collapsed');
        expect(consoleLogs).toContain('Validating card can be collapsed: A');
    });

    test('should reject already collapsed card', () => {
        const card = { type: 'A', collapsed: true, hasPlayer: false };
        const position = { row: 1, col: 1 };
        const moveData = { startingPosition: { row: 1, col: 1 } };
        
        const result = validateCardCanBeCollapsed(card, position, moveData);
        
        expect(result.canCollapse).toBe(false);
        expect(result.reason).toBe('Card is already collapsed');
    });

    test('should reject card with player still on it', () => {
        const card = { type: 'A', collapsed: false, hasPlayer: true };
        const position = { row: 1, col: 1 };
        const moveData = { startingPosition: { row: 1, col: 1 } };
        
        const result = validateCardCanBeCollapsed(card, position, moveData);
        
        expect(result.canCollapse).toBe(false);
        expect(result.reason).toBe('Cannot collapse card with player still on it');
    });

    test('should reject position mismatch', () => {
        const card = { type: 'A', collapsed: false, hasPlayer: false };
        const position = { row: 1, col: 1 };
        const moveData = { startingPosition: { row: 2, col: 2 } }; // Different position
        
        const result = validateCardCanBeCollapsed(card, position, moveData);
        
        expect(result.canCollapse).toBe(false);
        expect(result.reason).toBe('Position does not match move starting position');
    });

    test('should handle exceptions gracefully', () => {
        const card = null; // Will cause error when accessing properties
        const position = { row: 1, col: 1 };
        const moveData = { startingPosition: { row: 1, col: 1 } };
        
        const result = validateCardCanBeCollapsed(card, position, moveData);
        
        expect(result.canCollapse).toBe(false);
        expect(result.reason).toContain('Validation error');
        expect(consoleLogs.some(log => log.includes('ERROR: Error validating card collapse'))).toBe(true);
    });
});

describe('validateCollapseAgainstGameRules', () => {
    test('should validate against game rules when conditions are met', () => {
        const card = { type: 'A', hasPlayer: false };
        const position = { row: 1, col: 1 };
        const moveData = { cardType: 'A', playerId: 'player1' };
        
        const result = validateCollapseAgainstGameRules(card, position, moveData);
        
        expect(result.valid).toBe(true);
        expect(result.reason).toBe('Collapse follows game rules');
        expect(consoleLogs).toContain('Validating collapse against game rules');
    });

    test('should reject when player has not completed move off card', () => {
        const card = { type: 'A', hasPlayer: true, playerId: 'player1' };
        const position = { row: 1, col: 1 };
        const moveData = { cardType: 'A', playerId: 'player1' };
        
        const result = validateCollapseAgainstGameRules(card, position, moveData);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Player has not completed their move off this card');
    });

    test('should reject when card type does not match move data', () => {
        const card = { type: 'A', hasPlayer: false };
        const position = { row: 1, col: 1 };
        const moveData = { cardType: '2', playerId: 'player1' }; // Different card type
        
        const result = validateCollapseAgainstGameRules(card, position, moveData);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Card type does not match move data');
    });

    test('should handle exceptions gracefully', () => {
        const card = null;
        const position = { row: 1, col: 1 };
        const moveData = { cardType: 'A', playerId: 'player1' };
        
        const result = validateCollapseAgainstGameRules(card, position, moveData);

        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Game rule validation error');
        expect(consoleLogs.some(log => log.includes('ERROR: Error validating against game rules'))).toBe(true);
    });
});

describe('performCardCollapse', () => {
    test('should perform card collapse successfully', () => {
        const card = { type: 'A' };
        const position = { row: 1, col: 1 };
        const moveData = { timestamp: '2023-01-01T12:00:00Z', playerId: 'player1' };
        mockGameState.collapsedCards = [];
        
        const result = performCardCollapse(card, position, moveData);
        
        expect(result.success).toBe(true);
        expect(card.collapsed).toBe(true);
        expect(card.collapseData).toBeDefined();
        expect(card.collapseData.playerId).toBe('player1');
        expect(mockGameState.collapsedCards).toHaveLength(1);
        expect(mockGameState.collapsedCards[0].cardType).toBe('A');
        expect(consoleLogs.some(log => log.includes('Performing collapse on A at (1, 1)'))).toBe(true);
    });

    test('should initialize collapsedCards array if not exists', () => {
        const card = { type: 'A' };
        const position = { row: 1, col: 1 };
        const moveData = { timestamp: '2023-01-01T12:00:00Z', playerId: 'player1' };
        // mockGameState.collapsedCards not initialized
        
        const result = performCardCollapse(card, position, moveData);
        
        expect(result.success).toBe(true);
        expect(mockGameState.collapsedCards).toBeDefined();
        expect(mockGameState.collapsedCards).toHaveLength(1);
    });

    test('should handle exceptions gracefully', () => {
        const card = null;
        const position = { row: 1, col: 1 };
        const moveData = { timestamp: '2023-01-01T12:00:00Z', playerId: 'player1' };
        
        const result = performCardCollapse(card, position, moveData);
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Collapse operation error');
        expect(consoleLogs.some(log => log.includes('ERROR: Error performing card collapse'))).toBe(true);
    });
});

describe('updateCardCollapseVisuals', () => {
    test('should update visuals successfully', () => {
        const position = { row: 1, col: 1 };
        const card = { collapseData: { timestamp: '2023-01-01T12:00:00Z' } };
        
        const mockCardElement = {
            classList: { add: jest.fn(), remove: jest.fn() },
            querySelector: jest.fn(() => ({
                textContent: 'A',
                dataset: {},
                style: { color: '', removeProperty: jest.fn() }
            })),
            dataset: {}
        };
        
        mockDocumentElements['[data-row="1"][data-col="1"]'] = mockCardElement;
        
        const result = updateCardCollapseVisuals(position, card);
        
        expect(result.success).toBe(true);
        expect(mockCardElement.classList.add).toHaveBeenCalledWith('collapsed');
        expect(mockCardElement.classList.add).toHaveBeenCalledWith('collapsing');
        expect(mockCardElement.dataset.collapsed).toBe('true');
        expect(consoleLogs.some(log => log.includes('Updating collapse visuals for card at (1, 1)'))).toBe(true);
    });

    test('should fail when card element not found', () => {
        const position = { row: 1, col: 1 };
        const card = { collapseData: { timestamp: '2023-01-01T12:00:00Z' } };
        
        mockDependencies.document.querySelector.mockReturnValue(null);
        
        const result = updateCardCollapseVisuals(position, card);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Card element not found in DOM');
    });

    test('should handle exceptions gracefully', () => {
        const position = { row: 1, col: 1 };
        const card = { collapseData: { timestamp: '2023-01-01T12:00:00Z' } };
        
        mockDependencies.document.querySelector.mockImplementation(() => {
            throw new Error('DOM error');
        });
        
        const result = updateCardCollapseVisuals(position, card);
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Visual update error');
        expect(consoleLogs.some(log => log.includes('ERROR: Error updating collapse visuals'))).toBe(true);
    });
});

describe('isCardCollapsedAt', () => {
    test('should return true for collapsed card', () => {
        mockCards['1-1'] = { collapsed: true };
        
        const result = isCardCollapsedAt({ row: 1, col: 1 });
        
        expect(result).toBe(true);
    });

    test('should return false for non-collapsed card', () => {
        mockCards['1-1'] = { collapsed: false };
        
        const result = isCardCollapsedAt({ row: 1, col: 1 });
        
        expect(result).toBe(false);
    });

    test('should return false when card not found', () => {
        mockDependencies.getCardAtPosition.mockReturnValue(null);
        
        const result = isCardCollapsedAt({ row: 1, col: 1 });
        
        expect(result).toBe(false);
    });

    test('should handle exceptions gracefully', () => {
        mockDependencies.getCardAtPosition.mockImplementation(() => {
            throw new Error('Test error');
        });
        
        const result = isCardCollapsedAt({ row: 1, col: 1 });
        
        expect(result).toBe(false);
        expect(consoleLogs.some(log => log.includes('ERROR: Error checking if card is collapsed'))).toBe(true);
    });
});

describe('getAllCollapsedCards', () => {
    test('should return all collapsed cards', () => {
        mockCards['0-0'] = { collapsed: true, type: 'A', collapseData: { timestamp: '2023-01-01T12:00:00Z' } };
        mockCards['1-1'] = { collapsed: false, type: '2' };
        mockCards['2-2'] = { collapsed: true, type: '3', collapseData: { timestamp: '2023-01-01T12:01:00Z' } };
        
        const result = getAllCollapsedCards();
        
        expect(result).toHaveLength(2);
        expect(result[0].position).toEqual({ row: 0, col: 0 });
        expect(result[0].cardType).toBe('A');
        expect(result[1].position).toEqual({ row: 2, col: 2 });
        expect(result[1].cardType).toBe('3');
        expect(consoleLogs).toContain('Getting all collapsed cards');
        expect(consoleLogs).toContain('Found 2 collapsed cards');
    });

    test('should return empty array when no collapsed cards', () => {
        // No collapsed cards setup
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                mockCards[`${row}-${col}`] = { collapsed: false, type: 'A' };
            }
        }
        
        const result = getAllCollapsedCards();
        
        expect(result).toHaveLength(0);
        expect(consoleLogs).toContain('Found 0 collapsed cards');
    });

    test('should handle exceptions gracefully', () => {
        mockDependencies.getCardAtPosition.mockImplementation(() => {
            throw new Error('Test error');
        });
        
        const result = getAllCollapsedCards();
        
        expect(result).toEqual([]);
        expect(consoleLogs.some(log => log.includes('ERROR: Error getting collapsed cards'))).toBe(true);
    });
});

describe('getCollapsedCardCount', () => {
    test('should return correct count of collapsed cards', () => {
        mockCards['0-0'] = { collapsed: true, type: 'A', collapseData: {} };
        mockCards['1-1'] = { collapsed: true, type: '2', collapseData: {} };
        mockCards['2-2'] = { collapsed: false, type: '3' };
        
        const result = getCollapsedCardCount();
        
        expect(result).toBe(2);
    });

    test('should return 0 when no collapsed cards', () => {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                mockCards[`${row}-${col}`] = { collapsed: false, type: 'A' };
            }
        }
        
        const result = getCollapsedCardCount();
        
        expect(result).toBe(0);
    });

    test('should handle exceptions gracefully', () => {
        mockDependencies.getCardAtPosition.mockImplementation(() => {
            throw new Error('Test error');
        });
        
        const result = getCollapsedCardCount();
        
        expect(result).toBe(0);
        expect(consoleLogs.some(log => log.includes('ERROR: Error counting collapsed cards'))).toBe(true);
    });
});

describe('restoreCollapsedCard', () => {
    test('should restore collapsed card successfully', () => {
        const position = { row: 1, col: 1 };
        const card = { 
            collapsed: true, 
            collapseData: { timestamp: '2023-01-01T12:00:00Z' } 
        };
        mockCards['1-1'] = card;
        mockGameState.collapsedCards = [
            { position: { row: 1, col: 1 }, cardType: 'A' }
        ];
        
        const mockCardElement = {
            classList: { remove: jest.fn() },
            removeAttribute: jest.fn(),
            querySelector: jest.fn(() => ({
                dataset: { originalText: 'A' },
                style: { removeProperty: jest.fn() }
            }))
        };
        mockDocumentElements['[data-row="1"][data-col="1"]'] = mockCardElement;
        
        const result = restoreCollapsedCard(position);
        
        expect(result.success).toBe(true);
        expect(card.collapsed).toBe(false);
        expect(card.collapseData).toBeUndefined();
        expect(mockGameState.collapsedCards).toHaveLength(0);
        expect(consoleLogs.some(log => log.includes('Restoring collapsed card at (1, 1)'))).toBe(true);
    });

    test('should fail when card not found', () => {
        mockDependencies.getCardAtPosition.mockReturnValue(null);
        
        const result = restoreCollapsedCard({ row: 1, col: 1 });
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Card not found at position');
    });

    test('should fail when card is not collapsed', () => {
        mockCards['1-1'] = { collapsed: false };
        
        const result = restoreCollapsedCard({ row: 1, col: 1 });
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Card is not collapsed');
    });

    test('should handle exceptions gracefully', () => {
        mockDependencies.getCardAtPosition.mockImplementation(() => {
            throw new Error('Test error');
        });
        
        const result = restoreCollapsedCard({ row: 1, col: 1 });
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Restore error');
        expect(consoleLogs.some(log => log.includes('ERROR: Error restoring collapsed card'))).toBe(true);
    });
});

describe('resetAllCardCollapseStates', () => {
    test('should reset all collapsed cards successfully', () => {
        // Setup collapsed cards
        mockCards['0-0'] = { collapsed: true, collapseData: {} };
        mockCards['1-1'] = { collapsed: true, collapseData: {} };
        mockCards['2-2'] = { collapsed: false };
        mockGameState.collapsedCards = [];
        
        // Mock DOM elements
        mockDocumentElements['[data-row="0"][data-col="0"]'] = {
            classList: { remove: jest.fn() },
            removeAttribute: jest.fn(),
            querySelector: jest.fn(() => ({
                dataset: { originalText: 'A' },
                style: { removeProperty: jest.fn() }
            }))
        };
        mockDocumentElements['[data-row="1"][data-col="1"]'] = {
            classList: { remove: jest.fn() },
            removeAttribute: jest.fn(),
            querySelector: jest.fn(() => ({
                dataset: { originalText: '2' },
                style: { removeProperty: jest.fn() }
            }))
        };
        
        const result = resetAllCardCollapseStates();
        
        expect(result.success).toBe(true);
        expect(result.restoredCount).toBe(2);
        expect(mockCards['0-0'].collapsed).toBe(false);
        expect(mockCards['1-1'].collapsed).toBe(false);
        expect(mockGameState.collapsedCards).toEqual([]);
        expect(consoleLogs).toContain('Resetting all card collapse states');
        expect(consoleLogs).toContain('Reset 2 collapsed cards');
    });

    test('should handle no collapsed cards', () => {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                mockCards[`${row}-${col}`] = { collapsed: false };
            }
        }
        
        const result = resetAllCardCollapseStates();
        
        expect(result.success).toBe(true);
        expect(result.restoredCount).toBe(0);
        expect(consoleLogs).toContain('Reset 0 collapsed cards');
    });

    test('should handle exceptions gracefully', () => {
        mockDependencies.getCardAtPosition.mockImplementation(() => {
            throw new Error('Test error');
        });
        
        const result = resetAllCardCollapseStates();
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Reset error');
        expect(consoleLogs.some(log => log.includes('ERROR: Error resetting card collapse states'))).toBe(true);
    });
});

describe('getCollapseStatistics', () => {
    test('should return correct statistics', () => {
        mockGameState.collapsedCards = [
            {
                cardType: 'A',
                triggeredByPlayerId: 'player1',
                collapseTimestamp: '2023-01-01T12:00:00Z',
                position: { row: 0, col: 0 }
            },
            {
                cardType: 'A',
                triggeredByPlayerId: 'player2',
                collapseTimestamp: '2023-01-01T12:01:00Z',
                position: { row: 1, col: 1 }
            },
            {
                cardType: '2',
                triggeredByPlayerId: 'player1',
                collapseTimestamp: '2023-01-01T12:02:00Z',
                position: { row: 2, col: 2 }
            }
        ];
        
        // Mock getAllCollapsedCards to return 3
        mockCards['0-0'] = { collapsed: true, type: 'A', collapseData: {} };
        mockCards['1-1'] = { collapsed: true, type: 'A', collapseData: {} };
        mockCards['2-2'] = { collapsed: true, type: '2', collapseData: {} };
        
        const result = getCollapseStatistics();
        
        expect(result.totalCollapsed).toBe(3);
        expect(result.collapsedByType['A']).toBe(2);
        expect(result.collapsedByType['2']).toBe(1);
        expect(result.collapsedByPlayer['player1']).toBe(2);
        expect(result.collapsedByPlayer['player2']).toBe(1);
        expect(result.chronology).toHaveLength(3);
        expect(result.chronology[0].timestamp).toBe('2023-01-01T12:00:00Z');
        expect(consoleLogs).toContain('Getting collapse statistics');
    });

    test('should handle no collapsed cards', () => {
        mockGameState.collapsedCards = [];
        
        const result = getCollapseStatistics();
        
        expect(result.totalCollapsed).toBe(0);
        expect(result.collapsedByType).toEqual({});
        expect(result.collapsedByPlayer).toEqual({});
        expect(result.chronology).toEqual([]);
    });

    test('should handle exceptions gracefully', () => {
        mockDependencies.getCardAtPosition.mockImplementation(() => {
            throw new Error('Test error');
        });
        
        const result = getCollapseStatistics();
        
        expect(result.totalCollapsed).toBe(0);
        expect(result.collapsedByType).toEqual({});
        expect(result.collapsedByPlayer).toEqual({});
        expect(result.chronology).toEqual([]);
        expect(consoleLogs.some(log => log.includes('ERROR: Error getting collapse statistics'))).toBe(true);
    });
});