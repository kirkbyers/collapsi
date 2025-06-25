// Unit tests for path-highlighter.js
// Tests path visualization, highlighting, and movement preview functionality

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load the module being tested
const pathHighlighterPath = path.join(__dirname, 'path-highlighter.js');
const pathHighlighterCode = fs.readFileSync(pathHighlighterPath, 'utf8');

// Create a mock console to capture logs
let consoleLogs = [];
const mockConsole = {
    log: (message) => { consoleLogs.push(message); },
    error: (message) => { consoleLogs.push(`ERROR: ${message}`); },
    warn: (message) => { consoleLogs.push(`WARN: ${message}`); }
};

// Mock performance API
const mockPerformance = {
    now: jest.fn(() => 100) // Default timestamp
};

// Mock dependencies
let mockGameState = {};
let mockCurrentPlayer = null;
let mockCards = {};
let mockPathVisualizationPerformance = {
    startTracking: jest.fn(),
    endTracking: jest.fn(() => 25) // Mock 25ms duration
};

const mockDependencies = {
    console: mockConsole,
    performance: mockPerformance,
    gameState: mockGameState,
    pathVisualizationPerformance: mockPathVisualizationPerformance,
    
    // Game state functions
    getCurrentPlayer: jest.fn(() => mockCurrentPlayer),
    getCardAt: jest.fn((position) => mockCards[`${position.row}-${position.col}`] || null),
    getCardMovementDistance: jest.fn(),
    
    // Position utilities
    calculateWraparoundPosition: jest.fn(),
    
    // UI functions
    highlightJokerMovementPath: jest.fn(),
    highlightMovementPath: jest.fn(),
    clearPathHighlighting: jest.fn(),
    updateDestinationHighlighting: jest.fn(),
    previewMovementPath: jest.fn()
};

// Create context with mocked dependencies
const context = { ...mockDependencies };
vm.createContext(context);

// Execute the code in the context
vm.runInContext(pathHighlighterCode, context);

// Extract functions from context
const { 
    getNumberedCardMovementPath,
    highlightCurrentPlayerMovementPath,
    updatePathVisualization,
    updateAllVisualization,
    previewMovementToPosition
} = context;

// Reset mocks before each test
beforeEach(() => {
    consoleLogs = [];
    jest.clearAllMocks();
    mockGameState = {};
    mockCurrentPlayer = null;
    mockCards = {};
    mockPerformance.now.mockReturnValue(100);
    mockPathVisualizationPerformance.endTracking.mockReturnValue(25);
});

describe('getNumberedCardMovementPath', () => {
    beforeEach(() => {
        // Mock calculateWraparoundPosition to return predictable results
        mockDependencies.calculateWraparoundPosition.mockImplementation((pos, direction) => {
            const moves = {
                up: { row: pos.row - 1, col: pos.col },
                down: { row: pos.row + 1, col: pos.col },
                left: { row: pos.row, col: pos.col - 1 },
                right: { row: pos.row, col: pos.col + 1 }
            };
            return { position: moves[direction] };
        });
    });

    test('should return valid path for distance 1', () => {
        const startPosition = { row: 1, col: 1 };
        const distance = 1;
        
        const result = getNumberedCardMovementPath(startPosition, distance);
        
        expect(result).toHaveLength(2); // Start position + 1 move
        expect(result[0]).toEqual(startPosition);
        expect(consoleLogs).toContain('Getting numbered card movement path: 1 spaces from {"row":1,"col":1}');
    });

    test('should return valid path for distance 2', () => {
        const startPosition = { row: 0, col: 0 };
        const distance = 2;
        
        const result = getNumberedCardMovementPath(startPosition, distance);
        
        expect(result).toHaveLength(3); // Start position + 2 moves
        expect(result[0]).toEqual(startPosition);
    });

    test('should handle invalid position gracefully', () => {
        mockDependencies.calculateWraparoundPosition.mockImplementation(() => {
            throw new Error('Invalid position');
        });
        
        const result = getNumberedCardMovementPath({ row: 0, col: 0 }, 1);
        
        expect(result).toEqual([]);
        expect(consoleLogs.some(log => log.includes('ERROR: Error getting numbered card movement path'))).toBe(true);
    });

    test('should return empty array when no valid paths exist', () => {
        mockDependencies.calculateWraparoundPosition.mockReturnValue(null);
        
        const result = getNumberedCardMovementPath({ row: 0, col: 0 }, 2);
        
        expect(result).toEqual([]);
    });
});

describe('highlightCurrentPlayerMovementPath', () => {
    test('should highlight path for current player with numbered card', () => {
        mockCurrentPlayer = {
            isPlaced: jest.fn(() => true),
            getPosition: jest.fn(() => ({ row: 1, col: 1 }))
        };
        mockDependencies.getCurrentPlayer.mockReturnValue(mockCurrentPlayer);
        mockDependencies.getCardAt.mockReturnValue({ type: 'A' });
        mockDependencies.getCardMovementDistance.mockReturnValue({ type: 'fixed', distance: 1 });
        mockDependencies.highlightMovementPath.mockReturnValue(true);
        
        // Mock calculateWraparoundPosition for path generation
        mockDependencies.calculateWraparoundPosition.mockReturnValue({ position: { row: 1, col: 2 } });
        
        const result = highlightCurrentPlayerMovementPath();
        
        expect(result).toBe(true);
        expect(mockDependencies.highlightMovementPath).toHaveBeenCalled();
        expect(consoleLogs).toContain('Highlighting current player movement path');
    });

    test('should return false when no current player', () => {
        mockDependencies.getCurrentPlayer.mockReturnValue(null);
        
        const result = highlightCurrentPlayerMovementPath();
        
        expect(result).toBe(false);
        expect(consoleLogs).toContain('No current player or player not placed');
    });

    test('should return false when player not placed', () => {
        mockCurrentPlayer = {
            isPlaced: jest.fn(() => false),
            getPosition: jest.fn(() => ({ row: 1, col: 1 }))
        };
        mockDependencies.getCurrentPlayer.mockReturnValue(mockCurrentPlayer);
        
        const result = highlightCurrentPlayerMovementPath();
        
        expect(result).toBe(false);
        expect(consoleLogs).toContain('No current player or player not placed');
    });

    test('should handle joker movement when active', () => {
        mockCurrentPlayer = {
            isPlaced: jest.fn(() => true),
            getPosition: jest.fn(() => ({ row: 1, col: 1 }))
        };
        mockGameState.jokerMoveState = { isActive: true };
        mockDependencies.getCurrentPlayer.mockReturnValue(mockCurrentPlayer);
        mockDependencies.getCardAt.mockReturnValue({ type: 'joker-red' });
        mockDependencies.highlightJokerMovementPath.mockReturnValue(true);
        
        // Update context gameState
        context.gameState = mockGameState;
        
        const result = highlightCurrentPlayerMovementPath();
        
        expect(result).toBe(true);
        expect(mockDependencies.highlightJokerMovementPath).toHaveBeenCalledWith(mockGameState.jokerMoveState);
    });

    test('should return false when no card at position', () => {
        mockCurrentPlayer = {
            isPlaced: jest.fn(() => true),
            getPosition: jest.fn(() => ({ row: 1, col: 1 }))
        };
        mockDependencies.getCurrentPlayer.mockReturnValue(mockCurrentPlayer);
        mockDependencies.getCardAt.mockReturnValue(null);
        
        const result = highlightCurrentPlayerMovementPath();
        
        expect(result).toBe(false);
        expect(consoleLogs).toContain('No card found at current player position');
    });

    test('should handle errors gracefully', () => {
        mockDependencies.getCurrentPlayer.mockImplementation(() => {
            throw new Error('Test error');
        });
        
        const result = highlightCurrentPlayerMovementPath();
        
        expect(result).toBe(false);
        expect(consoleLogs.some(log => log.includes('ERROR: Error highlighting current player movement path'))).toBe(true);
    });
});

describe('updatePathVisualization', () => {
    test('should update visualization successfully', () => {
        mockDependencies.clearPathHighlighting.mockReturnValue(true);
        mockDependencies.highlightJokerMovementPath.mockReturnValue(true);
        mockGameState.jokerMoveState = { isActive: true };
        
        const result = updatePathVisualization();
        
        expect(result.success).toBe(true);
        expect(result.duration).toBe(25);
        expect(mockPathVisualizationPerformance.startTracking).toHaveBeenCalled();
        expect(mockPathVisualizationPerformance.endTracking).toHaveBeenCalled();
        expect(mockDependencies.clearPathHighlighting).toHaveBeenCalled();
        expect(consoleLogs).toContain('Updating path visualization');
    });

    test('should handle joker movement state', () => {
        mockGameState.jokerMoveState = { isActive: true, currentPosition: { row: 1, col: 1 } };
        mockDependencies.highlightJokerMovementPath.mockReturnValue(true);
        
        // Update context gameState
        context.gameState = mockGameState;
        
        const result = updatePathVisualization();
        
        expect(result.success).toBe(true);
        expect(mockDependencies.highlightJokerMovementPath).toHaveBeenCalledWith(mockGameState.jokerMoveState);
    });

    test('should handle normal player movement when no joker active', () => {
        mockGameState.jokerMoveState = { isActive: false };
        
        // Mock highlightCurrentPlayerMovementPath to return true
        mockCurrentPlayer = {
            isPlaced: jest.fn(() => true),
            getPosition: jest.fn(() => ({ row: 1, col: 1 }))
        };
        mockDependencies.getCurrentPlayer.mockReturnValue(mockCurrentPlayer);
        mockDependencies.getCardAt.mockReturnValue({ type: 'A' });
        mockDependencies.getCardMovementDistance.mockReturnValue({ type: 'fixed', distance: 1 });
        mockDependencies.highlightMovementPath.mockReturnValue(true);
        
        const result = updatePathVisualization();
        
        expect(result.success).toBe(true);
    });

    test('should handle errors gracefully', () => {
        mockDependencies.clearPathHighlighting.mockImplementation(() => {
            throw new Error('Clear error');
        });
        
        const result = updatePathVisualization();
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Clear error');
        expect(consoleLogs.some(log => log.includes('ERROR: Error updating path visualization'))).toBe(true);
    });
});

describe('updateAllVisualization', () => {
    beforeEach(() => {
        mockPerformance.now
            .mockReturnValueOnce(100) // Start time
            .mockReturnValueOnce(130); // End time (30ms duration)
    });

    test('should update both path and destination visualization', () => {
        mockDependencies.clearPathHighlighting.mockReturnValue(true);
        mockDependencies.updateDestinationHighlighting.mockReturnValue({ success: true });
        
        const result = updateAllVisualization();
        
        expect(result.success).toBe(true);
        expect(result.pathResult.success).toBe(true);
        expect(result.destinationResult.success).toBe(true);
        expect(result.totalDuration).toBe(30);
        expect(consoleLogs).toContain('Updating all visualization (paths and destinations)');
        expect(consoleLogs).toContain('Total visualization update took 30.00ms');
    });

    test('should warn when exceeding performance target', () => {
        // Reset mock completely and set up new sequence
        mockPerformance.now.mockReset();
        mockPerformance.now
            .mockReturnValueOnce(100) // Start time
            .mockReturnValueOnce(160); // End time (60ms duration - exceeds 50ms target)
        
        mockDependencies.clearPathHighlighting.mockReturnValue(true);
        mockDependencies.updateDestinationHighlighting.mockReturnValue({ success: true });
        
        const result = updateAllVisualization();
        
        expect(result.totalDuration).toBe(60);
        expect(consoleLogs.some(log => log.includes('WARN: Visualization update exceeded 50ms target: 60.00ms'))).toBe(true);
    });

    test('should handle partial failures', () => {
        mockDependencies.clearPathHighlighting.mockReturnValue(true);
        mockDependencies.updateDestinationHighlighting.mockReturnValue({ success: false });
        
        const result = updateAllVisualization();
        
        expect(result.success).toBe(false);
        expect(result.pathResult.success).toBe(true);
        expect(result.destinationResult.success).toBe(false);
    });

    test('should handle errors gracefully', () => {
        // Mock performance.now to throw in the try block
        mockPerformance.now.mockImplementation(() => {
            throw new Error('Update error');
        });
        
        const result = updateAllVisualization();
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Cannot read properties of undefined (reading \'success\')');
        expect(consoleLogs.some(log => log.includes('ERROR: Error updating all visualization'))).toBe(true);
    });
});

describe('previewMovementToPosition', () => {
    test('should preview movement for joker when active', () => {
        const targetPosition = { row: 2, col: 2 };
        mockCurrentPlayer = {
            isPlaced: jest.fn(() => true),
            getPosition: jest.fn(() => ({ row: 1, col: 1 }))
        };
        mockGameState.jokerMoveState = { 
            isActive: true, 
            movePath: [{ row: 1, col: 1 }] 
        };
        mockDependencies.getCurrentPlayer.mockReturnValue(mockCurrentPlayer);
        mockDependencies.getCardAt.mockReturnValue({ type: 'joker-red' });
        mockDependencies.highlightMovementPath.mockReturnValue(true);
        
        // Update context gameState
        context.gameState = mockGameState;
        
        const result = previewMovementToPosition(targetPosition);
        
        expect(result).toBe(true);
        expect(mockDependencies.highlightMovementPath).toHaveBeenCalledWith(
            [{ row: 1, col: 1 }, targetPosition], 
            true
        );
        expect(consoleLogs.some(log => log.includes('Previewing movement to position:'))).toBe(true);
    });

    test('should preview movement for numbered card', () => {
        const targetPosition = { row: 2, col: 2 };
        mockCurrentPlayer = {
            isPlaced: jest.fn(() => true),
            getPosition: jest.fn(() => ({ row: 1, col: 1 }))
        };
        mockGameState.jokerMoveState = { isActive: false }; // Ensure no joker active
        mockDependencies.getCurrentPlayer.mockReturnValue(mockCurrentPlayer);
        mockDependencies.getCardAt.mockReturnValue({ type: 'A' });
        mockDependencies.getCardMovementDistance.mockReturnValue({ type: 'fixed', distance: 2 });
        mockDependencies.previewMovementPath.mockReturnValue(true);
        
        // Update context gameState
        context.gameState = mockGameState;
        
        const result = previewMovementToPosition(targetPosition);
        
        expect(result).toBe(true);
        expect(mockDependencies.previewMovementPath).toHaveBeenCalledWith(
            { row: 1, col: 1 }, 
            targetPosition, 
            2, 
            false
        );
    });

    test('should return false when no current player', () => {
        mockDependencies.getCurrentPlayer.mockReturnValue(null);
        
        const result = previewMovementToPosition({ row: 2, col: 2 });
        
        expect(result).toBe(false);
    });

    test('should return false when player not placed', () => {
        mockCurrentPlayer = {
            isPlaced: jest.fn(() => false)
        };
        mockDependencies.getCurrentPlayer.mockReturnValue(mockCurrentPlayer);
        
        const result = previewMovementToPosition({ row: 2, col: 2 });
        
        expect(result).toBe(false);
    });

    test('should return false when no card at position', () => {
        mockCurrentPlayer = {
            isPlaced: jest.fn(() => true),
            getPosition: jest.fn(() => ({ row: 1, col: 1 }))
        };
        mockDependencies.getCurrentPlayer.mockReturnValue(mockCurrentPlayer);
        mockDependencies.getCardAt.mockReturnValue(null);
        
        const result = previewMovementToPosition({ row: 2, col: 2 });
        
        expect(result).toBe(false);
    });

    test('should handle errors gracefully', () => {
        mockDependencies.getCurrentPlayer.mockImplementation(() => {
            throw new Error('Preview error');
        });
        
        const result = previewMovementToPosition({ row: 2, col: 2 });
        
        expect(result).toBe(false);
        expect(consoleLogs.some(log => log.includes('ERROR: Error previewing movement to position'))).toBe(true);
    });
});