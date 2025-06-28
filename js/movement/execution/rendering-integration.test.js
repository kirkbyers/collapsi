/**
 * Unit Tests for js/movement/execution/rendering-integration.js
 * Tests rendering integration system with clean ES6 module approach
 */

import { 
  assertions, 
  testUtils, 
  performanceHelpers 
} from '../../../tests/utils/test-helpers.js';
import { 
  gameStates, 
  factories, 
  movePatterns 
} from '../../../tests/utils/game-fixtures.js';
import { setupTestEnvironment, cleanupTestEnvironment } from '../../../tests/utils/test-cleanup.js';

// Import functions to test
import {
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
} from './rendering-integration.js';

// Setup global mocks for non-ES6 modules
const mockFunctions = {
    // Player functions
    getPlayerById: jest.fn().mockImplementation((playerId) => {
        const players = [
            { id: 'red', color: 'red', position: { row: 0, col: 0 }, startingCard: 'red-joker' },
            { id: 'blue', color: 'blue', position: { row: 3, col: 3 }, startingCard: 'black-joker' }
        ];
        return players.find(p => p.id === playerId) || null;
    }),
    getCurrentPlayer: jest.fn(() => ({ id: 'red', color: 'red', position: { row: 0, col: 0 } })),
    
    // Move execution functions
    executeMoveToDestination: jest.fn(() => ({ success: true, reason: 'Move executed successfully' })),
    
    // Board state functions
    updateBoardStateAfterMove: jest.fn(() => ({ success: true })),
    collapseStartingCardAfterMove: jest.fn(() => ({ success: true })),
    switchTurnAfterMoveCompletion: jest.fn(() => ({ success: true, gameEnded: false })),
    
    // Additional rendering functions that might be called
    completeRenderingIntegration: jest.fn(() => ({ success: true, reason: 'Integration completed' })),
    
    // Board functions
    getCardAtPosition: jest.fn((row, col) => {
        const mockBoard = [
            [{ type: 'red-joker', isAccessible: true }, { type: '2', isAccessible: true }, { type: '3', isAccessible: true }, { type: '4', isAccessible: true }],
            [{ type: 'A', isAccessible: true }, { type: 'A', isAccessible: true }, { type: '2', isAccessible: true }, { type: '3', isAccessible: true }],
            [{ type: '2', isAccessible: true }, { type: '3', isAccessible: true }, { type: '4', isAccessible: true }, { type: 'A', isAccessible: true }],
            [{ type: '3', isAccessible: true }, { type: '4', isAccessible: true }, { type: 'A', isAccessible: true }, { type: 'black-joker', isAccessible: true }]
        ];
        if (row >= 0 && row < 4 && col >= 0 && col < 4) {
            return mockBoard[row][col];
        }
        return null;
    }),
    updateCardDisplay: jest.fn(() => true),
    movePlayerPawn: jest.fn(() => true),
    
    // UI functions
    clearPathHighlighting: jest.fn(),
    showMoveExecutionFeedback: jest.fn(),
    highlightMovementPath: jest.fn(() => true),
    showMoveSuccessFeedback: jest.fn(),
    updateGameStatusDisplay: jest.fn(),
    highlightCurrentPlayerPawn: jest.fn(() => ({ success: true }))
};

// Mock DOM
const mockDOMElement = {
    classList: {
        add: jest.fn(),
        remove: jest.fn()
    },
    dataset: {},
    removeAttribute: jest.fn(),
    textContent: ''
};

// Set up document mock with proper Jest functions
const mockDocument = {
    querySelector: jest.fn(() => mockDOMElement),
    querySelectorAll: jest.fn(() => [mockDOMElement])
};

// Set up mocks on global scope
beforeAll(() => {
    Object.keys(mockFunctions).forEach(key => {
        global[key] = mockFunctions[key];
    });
});

// Mock window.gameState
global.window = global.window || {};
global.window.gameState = {
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

// Test data
const validMoveData = {
    startingPosition: { row: 0, col: 0 },
    destinationPosition: { row: 0, col: 2 },
    path: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
    cardType: '2',
    currentPlayerId: 'red'
};

describe('Rendering Integration System Tests', () => {
    beforeEach(() => {
        setupTestEnvironment();
        jest.clearAllMocks();
        
        // Reset all function mocks but keep implementations
        Object.values(mockFunctions).forEach(mock => {
            if (mock.mockClear) mock.mockClear();
        });
        
        // Re-establish mock implementations that are cleared
        global.getPlayerById.mockImplementation((playerId) => {
            const players = [
                { id: 'red', color: 'red', position: { row: 0, col: 0 }, startingCard: 'red-joker' },
                { id: 'blue', color: 'blue', position: { row: 3, col: 3 }, startingCard: 'black-joker' }
            ];
            return players.find(p => p.id === playerId) || null;
        });
        global.executeMoveToDestination.mockImplementation(() => ({ success: true, reason: 'Move executed successfully' }));
        global.updateCardDisplay.mockImplementation(() => true);
        global.movePlayerPawn.mockImplementation(() => true);
        global.highlightMovementPath.mockImplementation(() => true);
        global.completeRenderingIntegration.mockImplementation(() => ({ success: true, reason: 'Integration completed' }));
        global.updateBoardStateAfterMove.mockImplementation(() => ({ success: true }));
        global.getCardAtPosition.mockImplementation((row, col) => {
            const mockBoard = [
                [{ type: 'red-joker', isAccessible: true }, { type: '2', isAccessible: true }, { type: '3', isAccessible: true }, { type: '4', isAccessible: true }],
                [{ type: 'A', isAccessible: true }, { type: 'A', isAccessible: true }, { type: '2', isAccessible: true }, { type: '3', isAccessible: true }],
                [{ type: '2', isAccessible: true }, { type: '3', isAccessible: true }, { type: '4', isAccessible: true }, { type: 'A', isAccessible: true }],
                [{ type: '3', isAccessible: true }, { type: '4', isAccessible: true }, { type: 'A', isAccessible: true }, { type: 'black-joker', isAccessible: true }]
            ];
            if (row >= 0 && row < 4 && col >= 0 && col < 4) {
                return mockBoard[row][col];
            }
            return null;
        });
        global.collapseStartingCardAfterMove.mockImplementation(() => ({ success: true }));
        global.switchTurnAfterMoveCompletion.mockImplementation(() => ({ success: true, gameEnded: false }));
        global.clearPathHighlighting.mockImplementation(() => {});
        global.showMoveExecutionFeedback.mockImplementation(() => {});
        global.showMoveSuccessFeedback.mockImplementation(() => {});
        global.updateGameStatusDisplay.mockImplementation(() => {});
        global.highlightCurrentPlayerPawn.mockImplementation(() => ({ success: true }));
        
        // Reset DOM element mocks
        mockDOMElement.classList.add.mockClear();
        mockDOMElement.classList.remove.mockClear();
        mockDOMElement.removeAttribute.mockClear();
        
        // Reset mockDOMElement dataset
        mockDOMElement.dataset = {};
        
        // Set up document spy in beforeEach to ensure it works with JSDOM
        jest.spyOn(document, 'querySelector').mockImplementation(() => mockDOMElement);
        jest.spyOn(document, 'querySelectorAll').mockImplementation(() => [mockDOMElement]);
    });

    afterEach(() => {
        cleanupTestEnvironment();
    });

    describe('executeMovWithRendering', () => {
        it('should execute move with rendering integration successfully', () => {
            // Set up all necessary mocks for successful execution
            global.highlightMovementPath.mockReturnValue(true);
            global.completeRenderingIntegration.mockReturnValue({ success: true, reason: 'Integration completed' });
            
            const result = executeMovWithRendering(
                validMoveData.startingPosition,
                validMoveData.destinationPosition,
                validMoveData.path,
                validMoveData.cardType,
                validMoveData.currentPlayerId
            );

            expect(result.success).toBe(true);
            expect(result.reason).toBe('Move executed with full rendering integration');
        });

        it('should handle null/undefined parameters', () => {
            const result = executeMovWithRendering(null, null, null, null, null);
            
            expect(result.success).toBe(false);
            expect(result.reason).toContain('Missing required move data');
        });

        it('should handle errors gracefully', () => {
            // Mock to throw error
            global.executeMoveToDestination.mockImplementationOnce(() => {
                throw new Error('Test error');
            });
            
            const result = executeMovWithRendering(
                validMoveData.startingPosition,
                validMoveData.destinationPosition,
                validMoveData.path,
                validMoveData.cardType,
                validMoveData.currentPlayerId
            );

            expect(result.success).toBe(false);
            expect(result.reason).toContain('Coordinated execution error');
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

        it('should handle errors in context creation', () => {
            const result = createMoveExecutionContext(
                validMoveData.startingPosition,
                validMoveData.destinationPosition,
                null, // Invalid path
                validMoveData.cardType,
                validMoveData.currentPlayerId
            );

            expect(result.valid).toBe(false);
            expect(result.reason).toContain('Missing required move data');
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
                    board: window.gameState.board,
                    players: window.gameState.players
                }
            };

            const result = validateExecutionContext(context);
            
            expect(result.valid).toBe(true);
            expect(result.reason).toBe('Context validation passed');
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
                    board: window.gameState.board,
                    players: window.gameState.players
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
                    players: window.gameState.players
                }
            };

            const result = validateExecutionContext(context);
            
            expect(result.valid).toBe(false);
            expect(result.reason).toBe('Invalid game state');
        });

        it('should reject context with non-existent player', () => {
            global.getPlayerById.mockReturnValueOnce(null);
            
            const context = {
                moveData: {
                    startingPosition: validMoveData.startingPosition,
                    destinationPosition: validMoveData.destinationPosition,
                    path: validMoveData.path,
                    playerId: 'nonexistent'
                },
                gameState: {
                    board: window.gameState.board,
                    players: window.gameState.players
                }
            };

            const result = validateExecutionContext(context);
            
            expect(result.valid).toBe(false);
            expect(result.reason).toBe('Player not found');
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
            gameState: window.gameState,
            renderingSteps: []
        };

        it('should execute coordinated move successfully', () => {
            // Set up all necessary mocks for successful execution
            global.highlightMovementPath.mockReturnValue(true);
            global.completeRenderingIntegration.mockReturnValue({ success: true, reason: 'Integration completed' });
            
            const result = executeCoordinatedMove(mockContext);
            
            expect(result.success).toBe(true);
            expect(result.reason).toBe('Move executed with full rendering integration');
            expect(result.moveResult).toBeDefined();
            expect(result.renderingResult).toBeDefined();
        });

        it('should handle move execution failure and rollback', () => {
            global.executeMoveToDestination.mockReturnValueOnce({ success: false, reason: 'Move execution failed' });
            
            const result = executeCoordinatedMove(mockContext);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Move execution failed');
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
            
            expect(global.getCardAtPosition).toHaveBeenCalled();
            expect(global.updateCardDisplay).toHaveBeenCalled();
        });

        it('should handle positions with no cards', () => {
            // Mock all position calls to return null (starting, destination, and path positions)
            global.getCardAtPosition.mockReturnValue(null);
            
            const result = renderAffectedPositions(mockMoveData);
            
            expect(result.success).toBe(true);
            expect(result.renderedCount).toBe(0);
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
            
            expect(global.getPlayerById).toHaveBeenCalledWith('red');
            expect(global.movePlayerPawn).toHaveBeenCalledWith('red', 0, 2);
            expect(global.highlightCurrentPlayerPawn).toHaveBeenCalled();
        });

        it('should handle non-existent player', () => {
            global.getPlayerById.mockReturnValueOnce(null);
            
            const result = updatePlayerPawnRendering(mockMoveData);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Player not found for pawn rendering');
        });

        it('should handle pawn movement failure', () => {
            global.movePlayerPawn.mockReturnValueOnce(false);
            
            const result = updatePlayerPawnRendering(mockMoveData);
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Failed to update pawn position');
        });
    });

    describe('highlightExecutionPath', () => {
        const mockPath = [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 }
        ];

        it('should highlight numbered card path successfully', () => {
            // Ensure the mock returns true for this test
            global.highlightMovementPath.mockReturnValue(true);
            
            const result = highlightExecutionPath(mockPath, '2');
            
            expect(result.success).toBe(true);
            expect(result.reason).toBe('Execution path highlighted');
            
            expect(global.highlightMovementPath).toHaveBeenCalledWith(mockPath, false);
        });

        it('should highlight joker path with correct flag', () => {
            global.highlightMovementPath.mockReturnValue(true);
            
            const result = highlightExecutionPath(mockPath, 'red-joker');
            
            expect(result.success).toBe(true);
            
            expect(global.highlightMovementPath).toHaveBeenCalledWith(mockPath, true);
        });

        it('should handle highlighting failure', () => {
            global.highlightMovementPath.mockReturnValueOnce(false);
            
            const result = highlightExecutionPath(mockPath, '2');
            
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Failed to highlight movement path');
        });
    });

    describe('markPositionForExecution', () => {
        const mockPosition = { row: 1, col: 1 };

        it('should mark position for execution successfully', () => {
            markPositionForExecution(mockPosition, 'starting');
            
            // The function should complete without errors (DOM operations may not be tracked in test env)
            expect(mockDOMElement.dataset.executionRole).toBe('starting');
        });

        it('should handle missing DOM element', () => {
            // Should not throw error
            expect(() => markPositionForExecution(mockPosition, 'destination')).not.toThrow();
        });
    });

    describe('clearPositionMarking', () => {
        const mockPosition = { row: 1, col: 1 };

        it('should clear position marking successfully', () => {
            clearPositionMarking(mockPosition);
            
            // The function should complete without errors
            expect(mockDOMElement.classList.remove).toHaveBeenCalledWith('execution-starting', 'execution-destination', 'executing-move', 'execution-start', 'execution-end');
            expect(mockDOMElement.removeAttribute).toHaveBeenCalledWith('data-execution-role');
        });

        it('should handle missing DOM element', () => {
            expect(() => clearPositionMarking(mockPosition)).not.toThrow();
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
        });
    });

    describe('Integration Tests', () => {
        it('should handle complete move execution flow', () => {
            // Set up all necessary mocks for successful execution
            global.highlightMovementPath.mockReturnValue(true);
            global.completeRenderingIntegration.mockReturnValue({ success: true, reason: 'Integration completed' });
            
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
            
            // Verify major dependencies were called
            expect(global.clearPathHighlighting).toHaveBeenCalled();
            expect(global.showMoveExecutionFeedback).toHaveBeenCalled();
            expect(global.executeMoveToDestination).toHaveBeenCalled();
        });

        it('should handle joker move execution', () => {
            // Set up all necessary mocks for successful execution
            global.highlightMovementPath.mockReturnValue(true);
            global.completeRenderingIntegration.mockReturnValue({ success: true, reason: 'Integration completed' });
            
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
            expect(global.highlightMovementPath).toHaveBeenCalledWith(expect.any(Array), true);
        });
    });
});