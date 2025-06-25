// Unit tests for move-executor.js
// Tests move execution, game state updates, and rollback functionality

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load the module being tested
const moveExecutorPath = path.join(__dirname, 'move-executor.js');
const moveExecutorCode = fs.readFileSync(moveExecutorPath, 'utf8');

// Create a mock console to capture logs
let consoleLogs = [];
const mockConsole = {
    log: (...args) => { consoleLogs.push(args.join(' ')); },
    error: (...args) => { consoleLogs.push(`ERROR: ${args.join(' ')}`); },
    warn: (...args) => { consoleLogs.push(`WARN: ${args.join(' ')}`); }
};

// Mock game state
let mockGameState = {};

// Mock validation results
let mockValidationResult = { valid: true };

// Mock external function dependencies
const mockFunctions = {
    validateCompleteGameMove: jest.fn(() => mockValidationResult),
    getPlayerById: jest.fn(),
    getCurrentPlayer: jest.fn(),
    getCardAtPosition: jest.fn(),
    updatePlayerOnBoard: jest.fn(() => true),
    movePlayerPawn: jest.fn(() => true),
    addMoveToHistory: jest.fn(),
};

// Create context with all dependencies and mocks
const context = {
    console: mockConsole,
    gameState: mockGameState,
    Date: Date,
    setTimeout: setTimeout,
    
    // Mock external functions
    ...mockFunctions,
    
    // Functions will be populated by the module execution
    executeMoveToDestination: undefined,
    performMoveExecution: undefined,
    updateGameStateAfterMove: undefined,
    rollbackMove: undefined,
    executeClickToMove: undefined,
    calculateSimplePath: undefined,
    isMoveExecutionInProgress: undefined,
    setMoveExecutionInProgress: undefined,
    executeMoveWithFeedback: undefined,
    showMoveExecutionFeedback: undefined,
    showMoveSuccessFeedback: undefined,
    showMoveErrorFeedback: undefined
};
vm.createContext(context);

// Execute the code in the context
vm.runInContext(moveExecutorCode, context);

// Extract functions from context
const executeMoveToDestination = context.executeMoveToDestination;
const performMoveExecution = context.performMoveExecution;
const updateGameStateAfterMove = context.updateGameStateAfterMove;
const rollbackMove = context.rollbackMove;
const executeClickToMove = context.executeClickToMove;
const isMoveExecutionInProgress = context.isMoveExecutionInProgress;
const setMoveExecutionInProgress = context.setMoveExecutionInProgress;

// Helper function to create mock player
function createMockPlayer(id, row, col, placed = true) {
    return {
        id: id,
        position: { row: row, col: col },
        placed: placed,
        getPosition: jest.fn(() => ({ row: row, col: col })),
        setPosition: jest.fn((newRow, newCol) => {
            row = newRow;
            col = newCol;
        }),
        isPlaced: jest.fn(() => placed)
    };
}

// Helper function to reset all mocks
function resetMocks() {
    consoleLogs = [];
    Object.keys(mockFunctions).forEach(key => {
        mockFunctions[key].mockClear();
    });
    
    // Reset default mock implementations
    mockFunctions.validateCompleteGameMove.mockReturnValue(mockValidationResult);
    mockFunctions.updatePlayerOnBoard.mockReturnValue(true);
    mockFunctions.movePlayerPawn.mockReturnValue(true);
    
    // Reset game state
    mockGameState.currentMovePath = [];
    mockGameState.jokerMoveState = null;
    mockGameState.board = [];
    mockGameState.players = [];
    mockGameState.moveExecutionInProgress = false;
}

// Reset before each test
beforeEach(() => {
    resetMocks();
    mockValidationResult = { valid: true };
});

describe('Module loading and function availability', () => {
    it('should load all required functions', () => {
        expect(executeMoveToDestination).toBeDefined();
        expect(performMoveExecution).toBeDefined();
        expect(updateGameStateAfterMove).toBeDefined();
        expect(rollbackMove).toBeDefined();
        expect(executeClickToMove).toBeDefined();
        expect(isMoveExecutionInProgress).toBeDefined();
        expect(setMoveExecutionInProgress).toBeDefined();
    });

    it('should have calculateSimplePath function in context', () => {
        expect(context.calculateSimplePath).toBeDefined();
        expect(typeof context.calculateSimplePath).toBe('function');
    });
});

describe('executeMoveToDestination', () => {
    const startPos = { row: 0, col: 0 };
    const destPos = { row: 0, col: 1 };
    const path = [startPos, destPos];
    const cardType = 'A';
    const gameBoard = [];
    const players = [];
    const playerId = 'player1';

    it('should execute a valid move successfully', () => {
        // Setup mocks to return successful results
        const mockPlayer = createMockPlayer(playerId, 0, 0, true);
        mockFunctions.getPlayerById.mockReturnValue(mockPlayer);
        
        const result = executeMoveToDestination(startPos, destPos, path, cardType, gameBoard, players, playerId);
        
        expect(result.success).toBe(true);
        expect(result.reason).toBe('Move completed successfully');
        expect(result.moveData).toBeDefined();
        expect(result.moveData.startingPosition).toEqual(startPos);
        expect(result.moveData.destinationPosition).toEqual(destPos);
        expect(result.moveData.path).toEqual(path);
        expect(result.moveData.distance).toBe(1);
        expect(result.moveData.playerId).toBe(playerId);
        expect(result.moveData.timestamp).toBeDefined();
    });

    it('should fail when validation fails', () => {
        mockValidationResult = { valid: false, reason: 'Invalid move', type: 'validation' };
        mockFunctions.validateCompleteGameMove.mockReturnValue(mockValidationResult);
        
        const result = executeMoveToDestination(startPos, destPos, path, cardType, gameBoard, players, playerId);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Invalid move');
        expect(result.type).toBe('validation');
    });

    it('should fail when move execution fails', () => {
        // Setup successful validation but failed execution
        const mockPlayer = createMockPlayer(playerId, 0, 0, true);
        mockFunctions.getPlayerById.mockReturnValue(mockPlayer);
        mockFunctions.updatePlayerOnBoard.mockReturnValue(false); // This will cause execution to fail
        
        // Ensure validation passes first
        mockValidationResult = { valid: true };
        mockFunctions.validateCompleteGameMove.mockReturnValue(mockValidationResult);
        
        const result = executeMoveToDestination(startPos, destPos, path, cardType, gameBoard, players, playerId);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Failed to remove player from starting position');
    });

    it('should rollback on game state update failure', () => {
        // Setup player and basic mocks
        const mockPlayer = createMockPlayer(playerId, 0, 0, true);
        mockFunctions.getPlayerById.mockReturnValue(mockPlayer);
        
        // Make addMoveToHistory fail to simulate state update failure
        mockFunctions.addMoveToHistory.mockImplementation(() => {
            throw new Error('State update failed');
        });
        
        const result = executeMoveToDestination(startPos, destPos, path, cardType, gameBoard, players, playerId);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Game state update error: State update failed');
    });

    it('should handle exceptions gracefully', () => {
        mockFunctions.validateCompleteGameMove.mockImplementation(() => {
            throw new Error('Validation error');
        });
        
        const result = executeMoveToDestination(startPos, destPos, path, cardType, gameBoard, players, playerId);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Execution error: Validation error');
        expect(result.type).toBe('error');
    });

    it('should log move execution details', () => {
        // Setup player for successful execution
        const mockPlayer = createMockPlayer(playerId, 0, 0, true);
        mockFunctions.getPlayerById.mockReturnValue(mockPlayer);
        
        executeMoveToDestination(startPos, destPos, path, cardType, gameBoard, players, playerId);
        
        expect(consoleLogs.some(log => log.includes('Executing move to destination'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Move executed successfully'))).toBe(true);
    });
});

describe('performMoveExecution', () => {
    const startPos = { row: 0, col: 0 };
    const destPos = { row: 0, col: 1 };
    const path = [startPos, destPos];
    const playerId = 'player1';

    let mockPlayer;

    beforeEach(() => {
        mockPlayer = createMockPlayer(playerId, 0, 0, true);
        mockFunctions.getPlayerById.mockReturnValue(mockPlayer);
    });

    it('should execute move successfully', () => {
        const result = performMoveExecution(startPos, destPos, path, playerId);
        
        expect(result.success).toBe(true);
        expect(result.reason).toBe('Player position updated successfully');
        expect(mockFunctions.getPlayerById).toHaveBeenCalledWith(playerId);
        expect(mockFunctions.updatePlayerOnBoard).toHaveBeenCalledWith(startPos.row, startPos.col, playerId, false);
        expect(mockFunctions.movePlayerPawn).toHaveBeenCalledWith(playerId, destPos.row, destPos.col);
    });

    it('should fail when player not found', () => {
        mockFunctions.getPlayerById.mockReturnValue(null);
        
        const result = performMoveExecution(startPos, destPos, path, playerId);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe(`Player ${playerId} not found`);
    });

    it('should fail when player position does not match starting position', () => {
        mockPlayer.getPosition.mockReturnValue({ row: 1, col: 1 });
        
        const result = performMoveExecution(startPos, destPos, path, playerId);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Player position does not match starting position');
    });

    it('should fail when unable to remove player from starting position', () => {
        mockFunctions.updatePlayerOnBoard.mockReturnValue(false);
        
        const result = performMoveExecution(startPos, destPos, path, playerId);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Failed to remove player from starting position');
    });

    it('should rollback when unable to move player to destination', () => {
        mockFunctions.updatePlayerOnBoard.mockReturnValueOnce(true).mockReturnValueOnce(true);
        mockFunctions.movePlayerPawn.mockReturnValue(false);
        
        const result = performMoveExecution(startPos, destPos, path, playerId);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Failed to move player to destination');
        // Should call updatePlayerOnBoard twice: once to remove, once to rollback
        expect(mockFunctions.updatePlayerOnBoard).toHaveBeenCalledTimes(2);
        expect(mockFunctions.updatePlayerOnBoard).toHaveBeenLastCalledWith(startPos.row, startPos.col, playerId, true);
    });

    it('should handle exceptions gracefully', () => {
        mockFunctions.getPlayerById.mockImplementation(() => {
            throw new Error('Player lookup error');
        });
        
        const result = performMoveExecution(startPos, destPos, path, playerId);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Move execution error: Player lookup error');
    });

    it('should log execution details', () => {
        performMoveExecution(startPos, destPos, path, playerId);
        
        expect(consoleLogs.some(log => log.includes(`Performing move execution for player ${playerId}`))).toBe(true);
        expect(consoleLogs.some(log => log.includes(`Player ${playerId} moved from`))).toBe(true);
    });
});

describe('updateGameStateAfterMove', () => {
    const startPos = { row: 0, col: 0 };
    const destPos = { row: 0, col: 1 };
    const path = [startPos, destPos];
    const playerId = 'player1';

    beforeEach(() => {
        mockGameState.currentMovePath = [startPos];
        mockGameState.jokerMoveState = { playerId: playerId, currentDistance: 2 };
    });

    it('should update game state successfully', () => {
        const result = updateGameStateAfterMove(startPos, destPos, path, playerId);
        
        expect(result.success).toBe(true);
        expect(result.reason).toBe('Game state updated successfully');
        expect(mockFunctions.addMoveToHistory).toHaveBeenCalled();
        expect(mockGameState.currentMovePath).toEqual([]);
        expect(mockGameState.jokerMoveState).toBeNull();
    });

    it('should clear joker move state only for the current player', () => {
        mockGameState.jokerMoveState = { playerId: 'otherPlayer', currentDistance: 2 };
        
        updateGameStateAfterMove(startPos, destPos, path, playerId);
        
        expect(mockGameState.jokerMoveState).not.toBeNull();
        expect(mockGameState.jokerMoveState.playerId).toBe('otherPlayer');
    });

    it('should add correct move record to history', () => {
        updateGameStateAfterMove(startPos, destPos, path, playerId);
        
        const addMoveCall = mockFunctions.addMoveToHistory.mock.calls[0][0];
        expect(addMoveCall.playerId).toBe(playerId);
        expect(addMoveCall.startingPosition).toEqual(startPos);
        expect(addMoveCall.destinationPosition).toEqual(destPos);
        expect(addMoveCall.path).toEqual(path);
        expect(addMoveCall.distance).toBe(1);
        expect(addMoveCall.timestamp).toBeDefined();
    });

    it('should handle exceptions gracefully', () => {
        mockFunctions.addMoveToHistory.mockImplementation(() => {
            throw new Error('History update error');
        });
        
        const result = updateGameStateAfterMove(startPos, destPos, path, playerId);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Game state update error: History update error');
    });

    it('should log update details', () => {
        updateGameStateAfterMove(startPos, destPos, path, playerId);
        
        expect(consoleLogs.some(log => log.includes('Updating game state after move'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Game state updated after move'))).toBe(true);
    });
});

describe('rollbackMove', () => {
    const startPos = { row: 0, col: 0 };
    const destPos = { row: 0, col: 1 };
    const playerId = 'player1';

    let mockPlayer;

    beforeEach(() => {
        mockPlayer = createMockPlayer(playerId, 0, 1, true);
        mockFunctions.getPlayerById.mockReturnValue(mockPlayer);
    });

    it('should rollback move successfully', () => {
        const result = rollbackMove(startPos, destPos, playerId);
        
        expect(result).toBe(true);
        expect(mockFunctions.updatePlayerOnBoard).toHaveBeenCalledWith(destPos.row, destPos.col, playerId, false);
        expect(mockPlayer.setPosition).toHaveBeenCalledWith(startPos.row, startPos.col);
        expect(mockFunctions.updatePlayerOnBoard).toHaveBeenCalledWith(startPos.row, startPos.col, playerId, true);
    });

    it('should handle missing player gracefully', () => {
        mockFunctions.getPlayerById.mockReturnValue(null);
        
        const result = rollbackMove(startPos, destPos, playerId);
        
        expect(result).toBe(true);
        expect(mockFunctions.updatePlayerOnBoard).toHaveBeenCalledWith(destPos.row, destPos.col, playerId, false);
    });

    it('should handle exceptions gracefully', () => {
        mockFunctions.updatePlayerOnBoard.mockImplementation(() => {
            throw new Error('Board update error');
        });
        
        const result = rollbackMove(startPos, destPos, playerId);
        
        expect(result).toBe(false);
    });

    it('should log rollback details', () => {
        rollbackMove(startPos, destPos, playerId);
        
        expect(consoleLogs.some(log => log.includes(`Rolling back move for player ${playerId}`))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Move rollback completed'))).toBe(true);
    });
});

describe('executeClickToMove', () => {
    const clickedRow = 0;
    const clickedCol = 1;
    const playerId = 'player1';

    let mockPlayer;
    let mockCard;

    beforeEach(() => {
        mockPlayer = createMockPlayer(playerId, 0, 0, true);
        mockCard = { type: 'A', hasPlayer: true, playerId: playerId };
        
        mockFunctions.getCurrentPlayer.mockReturnValue(mockPlayer);
        mockFunctions.getCardAtPosition.mockReturnValue(mockCard);
        
        mockGameState.board = [];
        mockGameState.players = [];
    });

    it('should fail when no current player available', () => {
        mockFunctions.getCurrentPlayer.mockReturnValue(null);
        
        const result = executeClickToMove(clickedRow, clickedCol);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('No current player available');
    });

    it('should fail when current player is not placed', () => {
        mockPlayer.isPlaced.mockReturnValue(false);
        
        const result = executeClickToMove(clickedRow, clickedCol);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Current player is not placed on board');
    });

    it('should fail when starting card not found', () => {
        mockFunctions.getCardAtPosition.mockReturnValue(null);
        
        const result = executeClickToMove(clickedRow, clickedCol);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Starting card not found');
    });

    it('should handle exceptions gracefully', () => {
        mockFunctions.getCurrentPlayer.mockImplementation(() => {
            throw new Error('Player lookup error');
        });
        
        const result = executeClickToMove(clickedRow, clickedCol);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Click-to-move error: Player lookup error');
    });

    it('should log click processing details', () => {
        executeClickToMove(clickedRow, clickedCol);
        
        expect(consoleLogs.some(log => log.includes(`Processing click-to-move to position (${clickedRow}, ${clickedCol})`))).toBe(true);
    });
});

describe('move execution flags', () => {
    beforeEach(() => {
        mockGameState.moveExecutionInProgress = false;
    });

    describe('isMoveExecutionInProgress', () => {
        it('should return false when not in progress', () => {
            expect(isMoveExecutionInProgress()).toBe(false);
        });

        it('should return true when in progress', () => {
            mockGameState.moveExecutionInProgress = true;
            expect(isMoveExecutionInProgress()).toBe(true);
        });

        it('should default to false when undefined', () => {
            delete mockGameState.moveExecutionInProgress;
            expect(isMoveExecutionInProgress()).toBe(false);
        });
    });

    describe('setMoveExecutionInProgress', () => {
        it('should set flag to true', () => {
            setMoveExecutionInProgress(true);
            expect(mockGameState.moveExecutionInProgress).toBe(true);
        });

        it('should set flag to false', () => {
            setMoveExecutionInProgress(false);
            expect(mockGameState.moveExecutionInProgress).toBe(false);
        });

        it('should log flag changes', () => {
            setMoveExecutionInProgress(true);
            expect(consoleLogs.some(log => log.includes('Move execution in progress: true'))).toBe(true);
        });
    });
});

describe('feedback functions', () => {
    beforeEach(() => {
        consoleLogs = [];
    });

    describe('showMoveExecutionFeedback', () => {
        it('should show loading feedback', () => {
            context.showMoveExecutionFeedback(true);
            expect(consoleLogs.some(log => log.includes('🔄 Executing move...'))).toBe(true);
        });

        it('should hide loading feedback', () => {
            context.showMoveExecutionFeedback(false);
            expect(consoleLogs.some(log => log.includes('✅ Move execution completed'))).toBe(true);
        });
    });

    describe('showMoveSuccessFeedback', () => {
        it('should show success message', () => {
            context.showMoveSuccessFeedback();
            expect(consoleLogs.some(log => log.includes('✅ Move executed successfully!'))).toBe(true);
        });
    });

    describe('showMoveErrorFeedback', () => {
        it('should show error message', () => {
            context.showMoveErrorFeedback('Test error');
            expect(consoleLogs.some(log => log.includes('❌ Move execution failed: Test error'))).toBe(true);
        });
    });
});

describe('calculateSimplePath function', () => {
    it('should be available and functional', () => {
        expect(context.calculateSimplePath).toBeDefined();
        expect(typeof context.calculateSimplePath).toBe('function');
        
        // Test basic functionality
        const result = context.calculateSimplePath({ row: 0, col: 0 }, { row: 0, col: 1 });
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
    });
});

describe('integration scenarios', () => {
    it('should handle basic move execution components', () => {
        const mockPlayer = createMockPlayer('player1', 0, 0, true);
        mockFunctions.getPlayerById.mockReturnValue(mockPlayer);
        
        const result = performMoveExecution({ row: 0, col: 0 }, { row: 0, col: 1 }, [], 'player1');
        
        expect(result.success).toBe(true);
        expect(mockFunctions.updatePlayerOnBoard).toHaveBeenCalled();
        expect(mockFunctions.movePlayerPawn).toHaveBeenCalled();
    });

    it('should handle move execution with rollback', () => {
        const mockPlayer = createMockPlayer('player1', 0, 0, true);
        mockFunctions.getPlayerById.mockReturnValue(mockPlayer);
        mockFunctions.updatePlayerOnBoard.mockReturnValueOnce(true).mockReturnValueOnce(true);
        mockFunctions.movePlayerPawn.mockReturnValue(false);
        
        const result = performMoveExecution({ row: 0, col: 0 }, { row: 0, col: 1 }, [], 'player1');
        
        expect(result.success).toBe(false);
        expect(mockFunctions.updatePlayerOnBoard).toHaveBeenCalledTimes(2);
    });
});

console.log('Move executor tests loaded');