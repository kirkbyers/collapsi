// Unit tests for rendering-integration.js
// Tests rendering integration system with move execution and visual updates

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load the module being tested
const renderingIntegrationPath = path.join(__dirname, 'rendering-integration.js');
const renderingIntegrationCode = fs.readFileSync(renderingIntegrationPath, 'utf8');

// Create a mock console to capture logs
let consoleLogs = [];
const mockConsole = {
    log: (message) => { consoleLogs.push(message); },
    error: (message) => { consoleLogs.push(`ERROR: ${message}`); },
    warn: (message) => { consoleLogs.push(`WARN: ${message}`); }
};

// Mock DOM elements and document
const mockDOMElement = {
    classList: {
        add: jest.fn(),
        remove: jest.fn()
    },
    dataset: {},
    removeAttribute: jest.fn()
};

const mockDocument = {
    querySelector: jest.fn(() => mockDOMElement),
    querySelectorAll: jest.fn(() => [mockDOMElement])
};

// Mock gameState global
const mockGameState = {
    board: [
        [{ type: 'red-joker', isAccessible: true }, { type: '2', isAccessible: true }, { type: '3', isAccessible: true }, { type: '4', isAccessible: true }],
        [{ type: 'A', isAccessible: true }, { type: 'A', isAccessible: true }, { type: '2', isAccessible: true }, { type: '3', isAccessible: true }],
        [{ type: '2', isAccessible: true }, { type: '3', isAccessible: true }, { type: '4', isAccessible: true }, { type: 'A', isAccessible: true }],
        [{ type: '3', isAccessible: true }, { type: '4', isAccessible: true }, { type: 'A', isAccessible: true }, { type: 'black-joker', isAccessible: true }]
    ],
    players: [
        { id: 'red', color: 'red', position: { row: 0, col: 0 }, startingCard: 'red-joker' },
        { id: 'blue', color: 'blue', position: { row: 3, col: 3 }, startingCard: 'black-joker' }
    ],
    currentPlayer: 0
};

// Mock external dependency functions
const mockDependencies = {
    // Player functions
    getPlayerById: jest.fn((playerId) => {
        return mockGameState.players.find(p => p.id === playerId) || null;
    }),
    getCurrentPlayer: jest.fn(() => mockGameState.players[mockGameState.currentPlayer]),
    
    // Move execution functions
    executeMoveToDestination: jest.fn(() => ({ success: true, reason: 'Move executed successfully' })),
    validateCompleteGameMove: jest.fn(() => ({ valid: true })),
    
    // Rendering functions
    clearPathHighlighting: jest.fn(),
    showMoveExecutionFeedback: jest.fn(),
    highlightMovementPath: jest.fn(() => true),
    updateBoardStateAfterMove: jest.fn(() => ({ success: true })),
    collapseStartingCardAfterMove: jest.fn(() => ({ success: true })),
    switchTurnAfterMoveCompletion: jest.fn(() => ({ success: true, gameEnded: false })),
    showMoveSuccessFeedback: jest.fn(),
    updateGameStatusDisplay: jest.fn(),
    highlightCurrentPlayerPawn: jest.fn(() => ({ success: true })),
    
    // Board functions
    getCardAtPosition: jest.fn((row, col) => {
        if (row >= 0 && row < 4 && col >= 0 && col < 4) {
            return mockGameState.board[row][col];
        }
        return null;
    }),
    updateCardDisplay: jest.fn(() => true),
    movePlayerPawn: jest.fn(() => true)
};

// Create context with mocked dependencies
const context = {
    console: mockConsole,
    document: mockDocument,
    gameState: mockGameState,
    Date: Date,
    ...mockDependencies,
    
    // Functions from module being tested
    executeMovWithRendering: undefined,
    createMoveExecutionContext: undefined,
    validateExecutionContext: undefined,
    executeCoordinatedMove: undefined,
    handlePreExecutionRendering: undefined,
    handlePostExecutionRendering: undefined,
    updateBoardRenderingAfterMove: undefined,
    renderAffectedPositions: undefined,
    updatePlayerPawnRendering: undefined,
    completeRenderingIntegration: undefined,
    highlightExecutionPath: undefined,
    markPositionForExecution: undefined,
    clearPositionMarking: undefined,
    updateMovementIndicators: undefined,
    clearExecutionVisualIndicators: undefined,
    rollbackRenderingChanges: undefined,
    cleanupTemporaryRenderingState: undefined,
    getRenderingIntegrationStatus: undefined
};

vm.createContext(context);

// Execute the code in the context
vm.runInContext(renderingIntegrationCode, context);

// Extract functions from context
const {
    executeMovWithRendering,
    createMoveExecutionContext,
    validateExecutionContext,
    executeCoordinatedMove,
    handlePreExecutionRendering,
    handlePostExecutionRendering,
    updateBoardRenderingAfterMove,
    renderAffectedPositions,
    updatePlayerPawnRendering,
    completeRenderingIntegration,
    highlightExecutionPath,
    markPositionForExecution,
    clearPositionMarking,
    updateMovementIndicators,
    clearExecutionVisualIndicators,
    rollbackRenderingChanges,
    cleanupTemporaryRenderingState,
    getRenderingIntegrationStatus
} = context;

// Sample test data
const validMoveData = {
    startingPosition: { row: 0, col: 0 },
    destinationPosition: { row: 0, col: 2 },
    path: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
    cardType: '2',
    currentPlayerId: 'red'
};

// Reset function
const resetMocks = () => {
    consoleLogs = [];
    Object.values(mockDependencies).forEach(mock => {
        if (mock.mockClear) mock.mockClear();
    });
    mockDOMElement.classList.add.mockClear();
    mockDOMElement.classList.remove.mockClear();
    mockDOMElement.removeAttribute.mockClear();
    mockDocument.querySelector.mockClear();
    mockDocument.querySelectorAll.mockClear();
};

beforeEach(() => {
    resetMocks();
});

describe('executeMovWithRendering', () => {
    it('should execute move with rendering integration successfully', () => {
        const result = executeMovWithRendering(
            validMoveData.startingPosition,
            validMoveData.destinationPosition,
            validMoveData.path,
            validMoveData.cardType,
            validMoveData.currentPlayerId
        );

        expect(result.success).toBe(true);
        expect(result.reason).toBe('Move executed with full rendering integration');
        expect(consoleLogs.some(log => log.includes('Executing move with full rendering integration'))).toBe(true);
    });

    it('should return failure when context validation fails', () => {
        // Mock context creation to return invalid context
        const originalContext = context.createMoveExecutionContext;
        context.createMoveExecutionContext = () => ({ valid: false, reason: 'Invalid context' });
        
        const result = executeMovWithRendering(
            validMoveData.startingPosition,
            validMoveData.destinationPosition,
            validMoveData.path,
            validMoveData.cardType,
            validMoveData.currentPlayerId
        );

        expect(result.success).toBe(false);
        expect(result.reason).toBe('Invalid context');
        
        // Restore original function
        context.createMoveExecutionContext = originalContext;
    });

    it('should handle errors gracefully', () => {
        // Mock context creation to throw error
        const originalContext = context.createMoveExecutionContext;
        context.createMoveExecutionContext = () => { throw new Error('Test error'); };
        
        const result = executeMovWithRendering(
            validMoveData.startingPosition,
            validMoveData.destinationPosition,
            validMoveData.path,
            validMoveData.cardType,
            validMoveData.currentPlayerId
        );

        expect(result.success).toBe(false);
        expect(result.reason).toContain('Rendering integration error: Test error');
        
        // Restore original function
        context.createMoveExecutionContext = originalContext;
    });

    it('should handle null/undefined parameters', () => {
        const result = executeMovWithRendering(null, null, null, null, null);
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Context creation error');
    });
});

describe('createMoveExecutionContext', () => {
    it('should create valid execution context with complete data', () => {
        const result = createMoveExecutionContext(
            validMoveData.startingPosition,
            validMoveData.destinationPosition,
            validMoveData.path,
            validMoveData.cardType,
            validMoveData.currentPlayerId
        );

        expect(result.valid).toBe(true);
        expect(result.moveData).toBeDefined();
        expect(result.moveData.startingPosition).toEqual(validMoveData.startingPosition);
        expect(result.moveData.destinationPosition).toEqual(validMoveData.destinationPosition);
        expect(result.moveData.path).toEqual(validMoveData.path);
        expect(result.moveData.cardType).toBe(validMoveData.cardType);
        expect(result.moveData.playerId).toBe(validMoveData.currentPlayerId);
        expect(result.moveData.distance).toBe(2);
        expect(result.moveData.timestamp).toBeDefined();
        expect(result.gameState).toBeDefined();
        expect(result.renderingSteps).toEqual([]);
    });

    it('should handle validation failure', () => {
        // Mock validation to fail
        const originalValidate = context.validateExecutionContext;
        context.validateExecutionContext = () => ({ valid: false, reason: 'Validation failed' });
        
        const result = createMoveExecutionContext(
            validMoveData.startingPosition,
            validMoveData.destinationPosition,
            validMoveData.path,
            validMoveData.cardType,
            validMoveData.currentPlayerId
        );

        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Validation failed');
        
        // Restore original function
        context.validateExecutionContext = originalValidate;
    });

    it('should handle errors in context creation', () => {
        // Test with invalid path to trigger error
        const result = createMoveExecutionContext(
            validMoveData.startingPosition,
            validMoveData.destinationPosition,
            null, // Invalid path
            validMoveData.cardType,
            validMoveData.currentPlayerId
        );

        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Context creation error');
    });
});

describe('validateExecutionContext', () => {
    it('should validate complete execution context successfully', () => {
        const context = {
            moveData: {
                startingPosition: validMoveData.startingPosition,
                destinationPosition: validMoveData.destinationPosition,
                path: validMoveData.path,
                playerId: validMoveData.currentPlayerId
            },
            gameState: {
                board: mockGameState.board,
                players: mockGameState.players
            }
        };

        const result = validateExecutionContext(context);
        
        expect(result.valid).toBe(true);
        expect(result.reason).toBe('Context validation passed');
        expect(mockDependencies.getPlayerById).toHaveBeenCalledWith(validMoveData.currentPlayerId);
    });

    it('should reject context with missing move data', () => {
        const context = {
            moveData: {
                startingPosition: null,
                destinationPosition: validMoveData.destinationPosition,
                path: validMoveData.path,
                playerId: validMoveData.currentPlayerId
            },
            gameState: {
                board: mockGameState.board,
                players: mockGameState.players
            }
        };

        const result = validateExecutionContext(context);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Missing required move data');
    });

    it('should reject context with invalid game state', () => {
        const context = {
            moveData: {
                startingPosition: validMoveData.startingPosition,
                destinationPosition: validMoveData.destinationPosition,
                path: validMoveData.path,
                playerId: validMoveData.currentPlayerId
            },
            gameState: {
                board: null,
                players: mockGameState.players
            }
        };

        const result = validateExecutionContext(context);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Invalid game state');
    });

    it('should reject context with non-existent player', () => {
        mockDependencies.getPlayerById.mockReturnValue(null);
        
        const context = {
            moveData: {
                startingPosition: validMoveData.startingPosition,
                destinationPosition: validMoveData.destinationPosition,
                path: validMoveData.path,
                playerId: 'nonexistent'
            },
            gameState: {
                board: mockGameState.board,
                players: mockGameState.players
            }
        };

        const result = validateExecutionContext(context);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Player not found');
    });

    it('should handle validation errors', () => {
        mockDependencies.getPlayerById.mockImplementation(() => {
            throw new Error('Test validation error');
        });
        
        const context = {
            moveData: {
                startingPosition: validMoveData.startingPosition,
                destinationPosition: validMoveData.destinationPosition,
                path: validMoveData.path,
                playerId: validMoveData.currentPlayerId
            },
            gameState: {
                board: mockGameState.board,
                players: mockGameState.players
            }
        };

        const result = validateExecutionContext(context);
        
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Context validation error: Test validation error');
    });
});

describe('executeCoordinatedMove', () => {
    const mockContext = {
        moveData: {
            startingPosition: validMoveData.startingPosition,
            destinationPosition: validMoveData.destinationPosition,
            path: validMoveData.path,
            cardType: validMoveData.cardType,
            playerId: validMoveData.currentPlayerId
        },
        gameState: mockGameState,
        renderingSteps: []
    };

    it('should execute coordinated move successfully', () => {
        const result = executeCoordinatedMove(mockContext);
        
        expect(result.success).toBe(true);
        expect(result.reason).toBe('Move executed with full rendering integration');
        expect(result.moveResult).toBeDefined();
        expect(result.renderingResult).toBeDefined();
    });

    it('should handle pre-execution rendering failure', () => {
        // Mock pre-execution to fail
        const originalHandle = context.handlePreExecutionRendering;
        context.handlePreExecutionRendering = () => ({ success: false, reason: 'Pre-rendering failed' });
        
        const result = executeCoordinatedMove(mockContext);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Pre-rendering failed');
        
        // Restore original function
        context.handlePreExecutionRendering = originalHandle;
    });

    it('should handle move execution failure and rollback', () => {
        mockDependencies.executeMoveToDestination.mockReturnValue({ success: false, reason: 'Move execution failed' });
        
        const result = executeCoordinatedMove(mockContext);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Move execution failed');
    });

    it('should handle post-execution rendering warning', () => {
        // Mock post-execution to fail
        const originalHandle = context.handlePostExecutionRendering;
        context.handlePostExecutionRendering = () => ({ success: false, reason: 'Post-rendering failed' });
        
        const result = executeCoordinatedMove(mockContext);
        
        expect(result.success).toBe(true); // Move still succeeds even if post-rendering fails
        expect(consoleLogs.some(log => log.includes('WARN: Post-execution rendering failed'))).toBe(true);
        
        // Restore original function
        context.handlePostExecutionRendering = originalHandle;
    });

    it('should handle errors and rollback', () => {
        // Mock move execution to throw error
        mockDependencies.executeMoveToDestination.mockImplementation(() => {
            throw new Error('Execution error');
        });
        
        const result = executeCoordinatedMove(mockContext);
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Coordinated execution error: Execution error');
    });
});

describe('handlePreExecutionRendering', () => {
    const mockContext = {
        moveData: {
            startingPosition: validMoveData.startingPosition,
            destinationPosition: validMoveData.destinationPosition,
            path: validMoveData.path,
            cardType: validMoveData.cardType
        },
        renderingSteps: []
    };

    it('should handle pre-execution rendering successfully', () => {
        const result = handlePreExecutionRendering(mockContext);
        
        expect(result.success).toBe(true);
        expect(result.reason).toBe('Pre-execution rendering completed');
        expect(mockContext.renderingSteps).toContain('pre-execution');
        expect(mockDependencies.clearPathHighlighting).toHaveBeenCalled();
        expect(mockDependencies.showMoveExecutionFeedback).toHaveBeenCalledWith(true);
    });

    it('should handle highlighting failure gracefully', () => {
        // Mock highlighting to fail
        const originalHighlight = context.highlightExecutionPath;
        context.highlightExecutionPath = () => ({ success: false, reason: 'Highlighting failed' });
        
        const result = handlePreExecutionRendering(mockContext);
        
        expect(result.success).toBe(true); // Still succeeds even if highlighting fails
        expect(consoleLogs.some(log => log.includes('WARN: Failed to highlight execution path'))).toBe(true);
        
        // Restore original function
        context.highlightExecutionPath = originalHighlight;
    });

    it('should handle errors in pre-execution', () => {
        mockDependencies.clearPathHighlighting.mockImplementation(() => {
            throw new Error('Pre-execution error');
        });
        
        const result = handlePreExecutionRendering(mockContext);
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Pre-execution rendering error: Pre-execution error');
    });
});

describe('handlePostExecutionRendering', () => {
    const mockContext = {
        moveData: {
            startingPosition: validMoveData.startingPosition,
            destinationPosition: validMoveData.destinationPosition,
            path: validMoveData.path,
            cardType: validMoveData.cardType,
            playerId: validMoveData.currentPlayerId
        },
        renderingSteps: []
    };

    const mockMoveResult = {
        success: true,
        reason: 'Move completed'
    };

    it('should handle post-execution rendering successfully', () => {
        const result = handlePostExecutionRendering(mockContext, mockMoveResult);
        
        expect(result.success).toBe(true);
        expect(result.reason).toBe('Post-execution rendering completed');
        expect(mockContext.renderingSteps).toContain('post-execution');
    });

    it('should handle board rendering failure', () => {
        // Mock board update to fail
        const originalUpdate = context.updateBoardRenderingAfterMove;
        context.updateBoardRenderingAfterMove = () => ({ success: false, reason: 'Board update failed' });
        
        const result = handlePostExecutionRendering(mockContext, mockMoveResult);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Board update failed');
        
        // Restore original function
        context.updateBoardRenderingAfterMove = originalUpdate;
    });

    it('should handle collapse failure gracefully', () => {
        mockDependencies.collapseStartingCardAfterMove.mockReturnValue({ success: false, reason: 'Collapse failed' });
        
        const result = handlePostExecutionRendering(mockContext, mockMoveResult);
        
        expect(result.success).toBe(true); // Still succeeds even if collapse fails
        expect(consoleLogs.some(log => log.includes('WARN: Card collapse rendering failed'))).toBe(true);
    });

    it('should handle errors in post-execution', () => {
        // Mock to throw error
        const originalUpdate = context.updateBoardRenderingAfterMove;
        context.updateBoardRenderingAfterMove = () => { throw new Error('Post-execution error'); };
        
        const result = handlePostExecutionRendering(mockContext, mockMoveResult);
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Post-execution rendering error: Post-execution error');
        
        // Restore original function
        context.updateBoardRenderingAfterMove = originalUpdate;
    });
});

describe('renderAffectedPositions', () => {
    const mockMoveData = {
        startingPosition: { row: 0, col: 0 },
        destinationPosition: { row: 0, col: 2 },
        path: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }]
    };

    it('should render affected positions successfully', () => {
        const result = renderAffectedPositions(mockMoveData);
        
        expect(result.success).toBe(true);
        expect(result.reason).toContain('Rendered');
        expect(result.renderedCount).toBeGreaterThan(0);
        expect(mockDependencies.getCardAtPosition).toHaveBeenCalled();
        expect(mockDependencies.updateCardDisplay).toHaveBeenCalled();
    });

    it('should handle positions with no cards', () => {
        mockDependencies.getCardAtPosition.mockReturnValue(null);
        
        const result = renderAffectedPositions(mockMoveData);
        
        expect(result.success).toBe(true);
        expect(result.renderedCount).toBe(0);
    });

    it('should handle rendering errors', () => {
        mockDependencies.getCardAtPosition.mockImplementation(() => {
            throw new Error('Card retrieval error');
        });
        
        const result = renderAffectedPositions(mockMoveData);
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Position rendering error: Card retrieval error');
    });
});

describe('updatePlayerPawnRendering', () => {
    const mockMoveData = {
        startingPosition: { row: 0, col: 0 },
        destinationPosition: { row: 0, col: 2 },
        playerId: 'red'
    };

    it('should update player pawn rendering successfully', () => {
        const result = updatePlayerPawnRendering(mockMoveData);
        
        expect(result.success).toBe(true);
        expect(result.reason).toBe('Pawn rendering updated successfully');
        expect(mockDependencies.getPlayerById).toHaveBeenCalledWith('red');
        expect(mockDependencies.movePlayerPawn).toHaveBeenCalledWith('red', 0, 2);
        expect(mockDependencies.highlightCurrentPlayerPawn).toHaveBeenCalled();
    });

    it('should handle non-existent player', () => {
        mockDependencies.getPlayerById.mockReturnValue(null);
        
        const result = updatePlayerPawnRendering(mockMoveData);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Player not found for pawn rendering');
    });

    it('should handle pawn movement failure', () => {
        mockDependencies.movePlayerPawn.mockReturnValue(false);
        
        const result = updatePlayerPawnRendering(mockMoveData);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Failed to update pawn position');
    });

    it('should handle rendering errors', () => {
        mockDependencies.getPlayerById.mockImplementation(() => {
            throw new Error('Player retrieval error');
        });
        
        const result = updatePlayerPawnRendering(mockMoveData);
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Pawn rendering error: Player retrieval error');
    });
});

describe('highlightExecutionPath', () => {
    const mockPath = [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 }
    ];

    it('should highlight numbered card path successfully', () => {
        const result = highlightExecutionPath(mockPath, '2');
        
        expect(result.success).toBe(true);
        expect(result.reason).toBe('Execution path highlighted');
        expect(mockDependencies.highlightMovementPath).toHaveBeenCalledWith(mockPath, false);
        expect(mockDocument.querySelector).toHaveBeenCalled();
        expect(mockDOMElement.classList.add).toHaveBeenCalledWith('executing-move');
    });

    it('should highlight joker path with correct flag', () => {
        const result = highlightExecutionPath(mockPath, 'red-joker');
        
        expect(result.success).toBe(true);
        expect(mockDependencies.highlightMovementPath).toHaveBeenCalledWith(mockPath, true);
    });

    it('should handle highlighting failure', () => {
        mockDependencies.highlightMovementPath.mockReturnValue(false);
        
        const result = highlightExecutionPath(mockPath, '2');
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Failed to highlight movement path');
    });

    it('should handle DOM manipulation errors', () => {
        mockDocument.querySelector.mockImplementation(() => {
            throw new Error('DOM error');
        });
        
        const result = highlightExecutionPath(mockPath, '2');
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Path highlighting error: DOM error');
    });
});

describe('markPositionForExecution', () => {
    const mockPosition = { row: 1, col: 1 };

    it('should mark position for execution successfully', () => {
        markPositionForExecution(mockPosition, 'starting');
        
        expect(mockDocument.querySelector).toHaveBeenCalledWith('[data-row="1"][data-col="1"]');
        expect(mockDOMElement.classList.add).toHaveBeenCalledWith('execution-starting');
        expect(mockDOMElement.dataset.executionRole).toBe('starting');
    });

    it('should handle missing DOM element', () => {
        mockDocument.querySelector.mockReturnValue(null);
        
        // Should not throw error
        expect(() => markPositionForExecution(mockPosition, 'destination')).not.toThrow();
    });

    it('should handle DOM errors', () => {
        mockDocument.querySelector.mockImplementation(() => {
            throw new Error('DOM error');
        });
        
        // Should not throw error, just log it
        expect(() => markPositionForExecution(mockPosition, 'starting')).not.toThrow();
        expect(consoleLogs.some(log => log.includes('ERROR: Error marking position for execution'))).toBe(true);
    });
});

describe('clearPositionMarking', () => {
    const mockPosition = { row: 1, col: 1 };

    it('should clear position marking successfully', () => {
        clearPositionMarking(mockPosition);
        
        expect(mockDocument.querySelector).toHaveBeenCalledWith('[data-row="1"][data-col="1"]');
        expect(mockDOMElement.classList.remove).toHaveBeenCalledWith('execution-starting', 'execution-destination', 'executing-move', 'execution-start', 'execution-end');
        expect(mockDOMElement.removeAttribute).toHaveBeenCalledWith('data-execution-role');
    });

    it('should handle missing DOM element', () => {
        mockDocument.querySelector.mockReturnValue(null);
        
        expect(() => clearPositionMarking(mockPosition)).not.toThrow();
    });

    it('should handle DOM errors', () => {
        mockDocument.querySelector.mockImplementation(() => {
            throw new Error('DOM error');
        });
        
        expect(() => clearPositionMarking(mockPosition)).not.toThrow();
        expect(consoleLogs.some(log => log.includes('ERROR: Error clearing position marking'))).toBe(true);
    });
});

describe('rollbackRenderingChanges', () => {
    const mockContext = {
        moveData: {
            startingPosition: { row: 0, col: 0 },
            destinationPosition: { row: 0, col: 2 },
            path: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }]
        },
        renderingSteps: ['pre-execution']
    };

    it('should rollback rendering changes successfully', () => {
        rollbackRenderingChanges(mockContext);
        
        expect(mockDependencies.showMoveExecutionFeedback).toHaveBeenCalledWith(false);
        expect(consoleLogs.some(log => log.includes('Rolling back rendering changes'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Rendering rollback completed'))).toBe(true);
    });

    it('should handle rollback errors', () => {
        mockDependencies.showMoveExecutionFeedback.mockImplementation(() => {
            throw new Error('Rollback error');
        });
        
        rollbackRenderingChanges(mockContext);
        
        expect(consoleLogs.some(log => log.includes('ERROR: Error during rendering rollback'))).toBe(true);
    });
});

describe('cleanupTemporaryRenderingState', () => {
    const mockContext = {
        tempRenderingData: { test: true },
        renderingSteps: []
    };

    it('should cleanup temporary rendering state successfully', () => {
        cleanupTemporaryRenderingState(mockContext);
        
        expect(mockDocument.querySelectorAll).toHaveBeenCalled();
        expect(mockDOMElement.classList.remove).toHaveBeenCalled();
        expect(mockDOMElement.removeAttribute).toHaveBeenCalledWith('data-execution-role');
        expect(mockContext.tempRenderingData).toBeUndefined();
        expect(consoleLogs.some(log => log.includes('Cleaning up temporary rendering state'))).toBe(true);
    });

    it('should handle cleanup errors', () => {
        mockDocument.querySelectorAll.mockImplementation(() => {
            throw new Error('Cleanup error');
        });
        
        cleanupTemporaryRenderingState(mockContext);
        
        expect(consoleLogs.some(log => log.includes('ERROR: Error cleaning up temporary rendering state'))).toBe(true);
    });
});

describe('getRenderingIntegrationStatus', () => {
    it('should return rendering integration status', () => {
        const result = getRenderingIntegrationStatus();
        
        expect(result.available).toBe(true);
        expect(result.version).toBe('1.0.0');
        expect(result.features).toContain('coordinated-move-execution');
        expect(result.features).toContain('step-by-step-rendering');
        expect(result.features).toContain('visual-feedback');
        expect(result.features).toContain('error-rollback');
        expect(result.features).toContain('state-integration');
        expect(result.dependencies).toContain('move-executor');
        expect(result.dependencies).toContain('board-state-manager');
        expect(consoleLogs.some(log => log.includes('Getting rendering integration status'))).toBe(true);
    });

    it('should handle status retrieval errors', () => {
        // Mock console to throw error
        const originalConsole = context.console;
        context.console = {
            log: () => { throw new Error('Status error'); },
            error: mockConsole.error
        };
        
        const result = getRenderingIntegrationStatus();
        
        expect(result.available).toBe(false);
        expect(result.error).toBe('Status error');
        
        // Restore original console
        context.console = originalConsole;
    });
});

describe('Integration Tests', () => {
    it('should handle complete move execution flow', () => {
        const result = executeMovWithRendering(
            validMoveData.startingPosition,
            validMoveData.destinationPosition,
            validMoveData.path,
            validMoveData.cardType,
            validMoveData.currentPlayerId
        );

        expect(result.success).toBe(true);
        expect(result.moveResult).toBeDefined();
        expect(result.renderingResult).toBeDefined();
        
        // Verify all major dependencies were called
        expect(mockDependencies.clearPathHighlighting).toHaveBeenCalled();
        expect(mockDependencies.showMoveExecutionFeedback).toHaveBeenCalled();
        expect(mockDependencies.executeMoveToDestination).toHaveBeenCalled();
        expect(mockDependencies.updateGameStatusDisplay).toHaveBeenCalled();
    });

    it('should handle joker move execution', () => {
        const jokerMoveData = {
            ...validMoveData,
            cardType: 'red-joker'
        };

        const result = executeMovWithRendering(
            jokerMoveData.startingPosition,
            jokerMoveData.destinationPosition,
            jokerMoveData.path,
            jokerMoveData.cardType,
            jokerMoveData.currentPlayerId
        );

        expect(result.success).toBe(true);
        // Verify joker-specific highlighting was called
        expect(mockDependencies.highlightMovementPath).toHaveBeenCalledWith(expect.any(Array), true);
    });

    it('should handle edge case positions', () => {
        const edgeCaseData = {
            startingPosition: { row: 0, col: 0 }, // Corner position
            destinationPosition: { row: 3, col: 3 }, // Opposite corner  
            path: [{ row: 0, col: 0 }, { row: 3, col: 3 }], // Minimal path
            cardType: 'A',
            currentPlayerId: 'blue'
        };

        const result = executeMovWithRendering(
            edgeCaseData.startingPosition,
            edgeCaseData.destinationPosition,
            edgeCaseData.path,
            edgeCaseData.cardType,
            edgeCaseData.currentPlayerId
        );

        expect(result.success).toBe(true);
    });
});

describe('Error Recovery Tests', () => {
    it('should recover from rendering failures', () => {
        // Make rendering fail but move succeed
        mockDependencies.showMoveExecutionFeedback.mockImplementation(() => {
            throw new Error('Rendering failure');
        });

        const result = executeMovWithRendering(
            validMoveData.startingPosition,
            validMoveData.destinationPosition,
            validMoveData.path,
            validMoveData.cardType,
            validMoveData.currentPlayerId
        );

        expect(result.success).toBe(false);
        expect(result.reason).toContain('Rendering integration error');
    });

    it('should handle multiple failure points', () => {
        // Mock multiple dependencies to fail
        mockDependencies.clearPathHighlighting.mockImplementation(() => {
            throw new Error('Clear path error');
        });
        mockDependencies.executeMoveToDestination.mockReturnValue({ success: false, reason: 'Execution failed' });

        const result = executeMovWithRendering(
            validMoveData.startingPosition,
            validMoveData.destinationPosition,
            validMoveData.path,
            validMoveData.cardType,
            validMoveData.currentPlayerId
        );

        expect(result.success).toBe(false);
    });
});