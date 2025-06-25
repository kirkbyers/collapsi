// Unit tests for board-state-manager.js
// Tests board state management functions and consistency validation

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load the module being tested
const boardStateManagerPath = path.join(__dirname, 'board-state-manager.js');
const boardStateManagerCode = fs.readFileSync(boardStateManagerPath, 'utf8');

// Create a mock console to capture logs
let consoleLogs = [];
const mockConsole = {
    log: (message) => { consoleLogs.push(message); },
    error: (message) => { consoleLogs.push(`ERROR: ${message}`); },
    warn: (message) => { consoleLogs.push(`WARN: ${message}`); }
};

// Mock game state for testing
let mockGameState;

// Mock board structure
let mockBoard;

// Mock players
let mockPlayers;

// Mock functions
const mockGetCardAtPosition = jest.fn();
const mockGetPlayerById = jest.fn();

// Create context with the functions we need
const context = {
    console: mockConsole,
    gameState: mockGameState,
    getCardAtPosition: mockGetCardAtPosition,
    getPlayerById: mockGetPlayerById,
    updateBoardStateAfterMove: undefined,
    updatePlayerPositionsOnBoard: undefined,
    updateCardStatesAfterMove: undefined,
    updateGameMetadataAfterMove: undefined,
    validateBoardStateConsistency: undefined,
    getBoardStateSnapshot: undefined,
    restoreBoardStateFromSnapshot: undefined,
    clearAllPlayerPositionsFromBoard: undefined
};

vm.createContext(context);

// Execute the code in the context
vm.runInContext(boardStateManagerCode, context);

// Extract functions from context
const {
    updateBoardStateAfterMove,
    updatePlayerPositionsOnBoard,
    updateCardStatesAfterMove,
    updateGameMetadataAfterMove,
    validateBoardStateConsistency,
    getBoardStateSnapshot,
    restoreBoardStateFromSnapshot,
    clearAllPlayerPositionsFromBoard
} = context;

// Helper function to create mock card
function createMockCard(type, row, col, collapsed = false, hasPlayer = false, playerId = null) {
    return {
        type: type,
        position: { row, col },
        collapsed: collapsed,
        hasPlayer: hasPlayer,
        playerId: playerId
    };
}

// Helper function to create mock player
function createMockPlayer(id, color, startingCard, row = -1, col = -1) {
    const player = {
        id: id,
        color: color,
        startingCard: startingCard,
        position: { row, col },
        isActive: true
    };
    
    // Create bound methods that work with the player object
    player.setPosition = jest.fn((newRow, newCol) => {
        player.position = { row: newRow, col: newCol };
        return true;
    });
    
    player.getPosition = jest.fn(() => player.position);
    player.isPlaced = jest.fn(() => player.position.row >= 0 && player.position.col >= 0);
    
    return player;
}

// Reset mocks and state before each test
beforeEach(() => {
    consoleLogs = [];
    
    // Reset mock board (4x4 grid)
    mockBoard = [];
    for (let row = 0; row < 4; row++) {
        mockBoard[row] = [];
        for (let col = 0; col < 4; col++) {
            mockBoard[row][col] = createMockCard('A', row, col);
        }
    }
    
    // Reset mock players
    mockPlayers = [
        createMockPlayer('red', 'red', 'red-joker', 0, 0),
        createMockPlayer('blue', 'blue', 'black-joker', 3, 3)
    ];
    
    // Reset mock game state
    mockGameState = {
        board: mockBoard,
        players: mockPlayers,
        currentPlayer: 'red',
        gameStatus: 'playing',
        moveHistory: [],
        lastMoveTimestamp: null,
        playerMoveStats: {},
        gameProgress: {}
    };
    
    // Update context with fresh game state
    context.gameState = mockGameState;
    
    // Reset mock functions
    mockGetCardAtPosition.mockClear();
    mockGetPlayerById.mockClear();
    
    // Setup default mock implementations
    mockGetCardAtPosition.mockImplementation((row, col) => {
        if (row >= 0 && row < 4 && col >= 0 && col < 4 && mockBoard[row] && mockBoard[row][col]) {
            return mockBoard[row][col];
        }
        return null;
    });
    
    mockGetPlayerById.mockImplementation((playerId) => {
        return mockPlayers.find(p => p.id === playerId) || null;
    });
    
    // Re-inject the mocks into the context
    context.getCardAtPosition = mockGetCardAtPosition;
    context.getPlayerById = mockGetPlayerById;
});

describe('updateBoardStateAfterMove', () => {
    const sampleMoveData = {
        startingPosition: { row: 0, col: 0 },
        destinationPosition: { row: 0, col: 1 },
        path: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
        playerId: 'red',
        cardType: 'A',
        distance: 1,
        timestamp: '2024-01-01T00:00:00.000Z'
    };

    it('should successfully update board state with valid move data', () => {
        const result = updateBoardStateAfterMove(sampleMoveData);
        
        expect(result.success).toBe(true);
        expect(result.reason).toBe('Board state updated successfully');
        expect(result.updates).toBeDefined();
        expect(result.updates.playerPositions).toBeDefined();
        expect(result.updates.cardStates).toBeDefined();
        expect(result.updates.metadata).toBeDefined();
    });

    it('should handle player position update failure', () => {
        // Mock getCardAtPosition to return null for destination
        mockGetCardAtPosition.mockImplementation((row, col) => {
            if (row === 0 && col === 1) return null; // destination card not found
            return mockBoard[row] && mockBoard[row][col] ? mockBoard[row][col] : null;
        });
        
        const result = updateBoardStateAfterMove(sampleMoveData);
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Destination card not found');
    });

    it('should handle card states update failure', () => {
        // Create a path through collapsed card
        const badMoveData = {
            ...sampleMoveData,
            path: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }]
        };
        
        // Make intermediate card collapsed
        mockBoard[0][1].collapsed = true;
        
        const result = updateBoardStateAfterMove(badMoveData);
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Path passes through collapsed card');
    });

    it('should handle errors and return error result', () => {
        // Mock getCardAtPosition to throw error
        mockGetCardAtPosition.mockImplementation(() => {
            throw new Error('Test error');
        });
        
        const result = updateBoardStateAfterMove(sampleMoveData);
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Test error'); // Error could come from any sub-function
    });

    it('should validate board state consistency and log warnings', () => {
        // Create inconsistent state - player on board but not in player list
        mockBoard[1][1].hasPlayer = true;
        mockBoard[1][1].playerId = 'nonexistent';
        
        const result = updateBoardStateAfterMove(sampleMoveData);
        
        expect(result.success).toBe(true); // Should still succeed
        expect(consoleLogs.some(log => log.includes('WARN'))).toBe(true);
    });

    it('should log successful update message', () => {
        updateBoardStateAfterMove(sampleMoveData);
        
        expect(consoleLogs.some(log => log.includes('Updating board state after move'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Board state updated successfully after move'))).toBe(true);
    });
});

describe('updatePlayerPositionsOnBoard', () => {
    const startingPosition = { row: 0, col: 0 };
    const destinationPosition = { row: 0, col: 1 };
    const playerId = 'red';

    it('should successfully update player positions', () => {
        // Setup starting card with player
        mockBoard[0][0].hasPlayer = true;
        mockBoard[0][0].playerId = 'red';
        
        const result = updatePlayerPositionsOnBoard(startingPosition, destinationPosition, playerId);
        
        expect(result.success).toBe(true);
        expect(result.reason).toBe('Player positions updated on board');
        expect(result.startingPosition).toEqual(startingPosition);
        expect(result.destinationPosition).toEqual(destinationPosition);
        expect(result.playerId).toBe(playerId);
        
        // Check that starting position is cleared
        expect(mockBoard[0][0].hasPlayer).toBe(false);
        expect(mockBoard[0][0].playerId).toBeNull();
        
        // Check that destination position is set
        expect(mockBoard[0][1].hasPlayer).toBe(true);
        expect(mockBoard[0][1].playerId).toBe(playerId);
    });

    it('should handle missing destination card', () => {
        mockGetCardAtPosition.mockImplementation((row, col) => {
            if (row === 0 && col === 1) return null; // destination not found
            return mockBoard[row] && mockBoard[row][col] ? mockBoard[row][col] : null;
        });
        
        const result = updatePlayerPositionsOnBoard(startingPosition, destinationPosition, playerId);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Destination card not found on board');
    });

    it('should handle missing starting card gracefully', () => {
        mockGetCardAtPosition.mockImplementation((row, col) => {
            if (row === 0 && col === 0) return null; // starting not found
            return mockBoard[row] && mockBoard[row][col] ? mockBoard[row][col] : null;
        });
        
        const result = updatePlayerPositionsOnBoard(startingPosition, destinationPosition, playerId);
        
        expect(result.success).toBe(true); // Should still succeed for destination
        expect(mockBoard[0][1].hasPlayer).toBe(true);
        expect(mockBoard[0][1].playerId).toBe(playerId);
    });

    it('should handle errors and return error result', () => {
        mockGetCardAtPosition.mockImplementation(() => {
            throw new Error('Test error');
        });
        
        const result = updatePlayerPositionsOnBoard(startingPosition, destinationPosition, playerId);
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Player position update error: Test error');
    });

    it('should log position update messages', () => {
        updatePlayerPositionsOnBoard(startingPosition, destinationPosition, playerId);
        
        expect(consoleLogs.some(log => log.includes('Updating player positions for red'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Removed player from starting position'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Added player to destination position'))).toBe(true);
    });
});

describe('updateCardStatesAfterMove', () => {
    const startingPosition = { row: 0, col: 0 };
    const destinationPosition = { row: 0, col: 2 };
    const path = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }];
    const playerId = 'red';

    it('should successfully update card states', () => {
        const result = updateCardStatesAfterMove(startingPosition, destinationPosition, path, playerId);
        
        expect(result.success).toBe(true);
        expect(result.reason).toBe('Card states updated successfully');
        expect(result.updates).toHaveLength(3); // mark_for_collapse, set_occupied, validate_not_collapsed
        
        expect(result.updates[0].action).toBe('mark_for_collapse');
        expect(result.updates[0].position).toEqual(startingPosition);
        
        expect(result.updates[1].action).toBe('set_occupied');
        expect(result.updates[1].position).toEqual(destinationPosition);
        expect(result.updates[1].playerId).toBe(playerId);
        
        expect(result.updates[2].action).toBe('validate_not_collapsed');
        expect(result.updates[2].position).toEqual({ row: 0, col: 1 });
    });

    it('should fail when path passes through collapsed card', () => {
        // Make intermediate card collapsed
        mockBoard[0][1].collapsed = true;
        
        const result = updateCardStatesAfterMove(startingPosition, destinationPosition, path, playerId);
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Path passes through collapsed card at (0, 1)');
    });

    it('should handle missing destination card', () => {
        mockGetCardAtPosition.mockImplementation((row, col) => {
            if (row === 0 && col === 2) return null; // destination not found
            return mockBoard[row] && mockBoard[row][col] ? mockBoard[row][col] : null;
        });
        
        const result = updateCardStatesAfterMove(startingPosition, destinationPosition, path, playerId);
        
        expect(result.success).toBe(true); // Should still succeed
        expect(result.updates).toHaveLength(2); // Only mark_for_collapse and validate_not_collapsed
    });

    it('should handle path with only start and end positions', () => {
        const shortPath = [{ row: 0, col: 0 }, { row: 0, col: 1 }];
        
        const result = updateCardStatesAfterMove(startingPosition, { row: 0, col: 1 }, shortPath, playerId);
        
        expect(result.success).toBe(true);
        expect(result.updates).toHaveLength(2); // No intermediate positions to validate
    });

    it('should handle errors and return error result', () => {
        mockGetCardAtPosition.mockImplementation(() => {
            throw new Error('Test error');
        });
        
        const result = updateCardStatesAfterMove(startingPosition, destinationPosition, path, playerId);
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Card state update error: Test error');
    });

    it('should log card states update messages', () => {
        updateCardStatesAfterMove(startingPosition, destinationPosition, path, playerId);
        
        expect(consoleLogs.some(log => log.includes('Updating card states after move'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Card states updated:'))).toBe(true);
    });
});

describe('updateGameMetadataAfterMove', () => {
    const moveData = {
        playerId: 'red',
        distance: 2,
        cardType: 'A',
        timestamp: '2024-01-01T00:00:00.000Z'
    };

    beforeEach(() => {
        mockGameState.moveHistory = ['move1', 'move2']; // Mock existing moves
    });

    it('should successfully update game metadata', () => {
        const result = updateGameMetadataAfterMove(moveData);
        
        expect(result.success).toBe(true);
        expect(result.reason).toBe('Game metadata updated successfully');
        expect(result.metadata).toBeDefined();
        
        expect(mockGameState.lastMoveTimestamp).toBe(moveData.timestamp);
        expect(mockGameState.playerMoveStats.red).toBeDefined();
        expect(mockGameState.playerMoveStats.red.totalMoves).toBe(1);
        expect(mockGameState.playerMoveStats.red.totalDistance).toBe(2);
        expect(mockGameState.playerMoveStats.red.numberedCardMoves).toBe(1);
        expect(mockGameState.playerMoveStats.red.jokerMoves).toBe(0);
        
        expect(mockGameState.gameProgress.totalMoves).toBe(2);
        expect(mockGameState.gameProgress.currentTurn).toBe('red');
        expect(mockGameState.gameProgress.lastMove.playerId).toBe('red');
    });

    it('should track joker moves separately', () => {
        const jokerMoveData = {
            ...moveData,
            cardType: 'red-joker'
        };
        
        updateGameMetadataAfterMove(jokerMoveData);
        
        expect(mockGameState.playerMoveStats.red.jokerMoves).toBe(1);
        expect(mockGameState.playerMoveStats.red.numberedCardMoves).toBe(0);
    });

    it('should track black joker moves', () => {
        const blackJokerMoveData = {
            ...moveData,
            cardType: 'black-joker'
        };
        
        updateGameMetadataAfterMove(blackJokerMoveData);
        
        expect(mockGameState.playerMoveStats.red.jokerMoves).toBe(1);
        expect(mockGameState.playerMoveStats.red.numberedCardMoves).toBe(0);
    });

    it('should initialize player stats if not exists', () => {
        // Clear existing stats
        mockGameState.playerMoveStats = {};
        
        updateGameMetadataAfterMove(moveData);
        
        expect(mockGameState.playerMoveStats.red).toBeDefined();
        expect(mockGameState.playerMoveStats.red.totalMoves).toBe(1);
        expect(mockGameState.playerMoveStats.red.totalDistance).toBe(2);
    });

    it('should accumulate stats for multiple moves', () => {
        // First move
        updateGameMetadataAfterMove(moveData);
        
        // Second move
        const secondMove = { ...moveData, distance: 3 };
        updateGameMetadataAfterMove(secondMove);
        
        expect(mockGameState.playerMoveStats.red.totalMoves).toBe(2);
        expect(mockGameState.playerMoveStats.red.totalDistance).toBe(5);
    });

    it('should handle errors and return error result', () => {
        // Corrupt game state to cause error
        mockGameState.moveHistory = null;
        
        const result = updateGameMetadataAfterMove(moveData);
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Metadata update error:');
    });

    it('should log metadata update messages', () => {
        updateGameMetadataAfterMove(moveData);
        
        expect(consoleLogs.some(log => log.includes('Updating game metadata after move'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Game metadata updated:'))).toBe(true);
    });
});

describe('validateBoardStateConsistency', () => {
    it('should pass validation for consistent board state', () => {
        // Setup consistent state
        mockBoard[0][0].hasPlayer = true;
        mockBoard[0][0].playerId = 'red';
        mockBoard[3][3].hasPlayer = true;
        mockBoard[3][3].playerId = 'blue';
        
        const result = validateBoardStateConsistency();
        
        expect(result.valid).toBe(true);
        expect(result.issues).toHaveLength(0);
        expect(result.playerPositions.red).toEqual({ row: 0, col: 0 });
        expect(result.playerPositions.blue).toEqual({ row: 3, col: 3 });
    });

    it('should detect missing cards', () => {
        mockBoard[1][1] = null;
        
        const result = validateBoardStateConsistency();
        
        expect(result.valid).toBe(false);
        expect(result.issues.some(issue => issue.includes('Missing card at position (1, 1)'))).toBe(true);
    });

    it('should detect player at multiple positions', () => {
        mockBoard[0][0].hasPlayer = true;
        mockBoard[0][0].playerId = 'red';
        mockBoard[1][1].hasPlayer = true;
        mockBoard[1][1].playerId = 'red';
        
        const result = validateBoardStateConsistency();
        
        expect(result.valid).toBe(false);
        expect(result.issues.some(issue => issue.includes('Player red found at multiple positions'))).toBe(true);
    });

    it('should detect position mismatch between board and player object', () => {
        mockBoard[0][0].hasPlayer = true;
        mockBoard[0][0].playerId = 'red';
        
        // Mock player to return different position
        const mockPlayer = mockPlayers.find(p => p.id === 'red');
        mockPlayer.getPosition.mockReturnValue({ row: 1, col: 1 });
        
        const result = validateBoardStateConsistency();
        
        expect(result.valid).toBe(false);
        expect(result.issues.some(issue => issue.includes('position mismatch'))).toBe(true);
    });

    it('should detect card with hasPlayer but no playerId', () => {
        mockBoard[0][0].hasPlayer = true;
        mockBoard[0][0].playerId = null;
        
        const result = validateBoardStateConsistency();
        
        expect(result.valid).toBe(false);
        expect(result.issues.some(issue => issue.includes('marked as having player but no playerId set'))).toBe(true);
    });

    it('should detect card with playerId but no hasPlayer flag', () => {
        mockBoard[0][0].hasPlayer = false;
        mockBoard[0][0].playerId = 'red';
        
        const result = validateBoardStateConsistency();
        
        expect(result.valid).toBe(false);
        expect(result.issues.some(issue => issue.includes('has playerId but not marked as having player'))).toBe(true);
    });

    it('should detect player referenced on board but not in player list', () => {
        mockBoard[0][0].hasPlayer = true;
        mockBoard[0][0].playerId = 'nonexistent';
        
        const result = validateBoardStateConsistency();
        
        expect(result.valid).toBe(false);
        expect(result.issues.some(issue => issue.includes('referenced on board but not found in player list'))).toBe(true);
    });

    it('should detect player claiming to be placed but not on board', () => {
        const mockPlayer = mockPlayers.find(p => p.id === 'red');
        mockPlayer.isPlaced.mockReturnValue(true);
        mockPlayer.getPosition.mockReturnValue({ row: 1, col: 1 });
        
        // Don't put player on board
        const result = validateBoardStateConsistency();
        
        expect(result.valid).toBe(false);
        expect(result.issues.some(issue => issue.includes('claims to be placed but not found on board'))).toBe(true);
    });

    it('should handle errors and return invalid result', () => {
        mockGetCardAtPosition.mockImplementation(() => {
            throw new Error('Test error');
        });
        
        const result = validateBoardStateConsistency();
        
        expect(result.valid).toBe(false);
        expect(result.issues.some(issue => issue.includes('Validation error: Test error'))).toBe(true);
    });

    it('should handle missing game state gracefully', () => {
        context.gameState = null;
        
        const result = validateBoardStateConsistency();
        
        expect(result.valid).toBe(false); // Should fail without game state
        expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should log validation messages', () => {
        // Setup clean state for successful validation
        mockBoard[0][0].hasPlayer = true;
        mockBoard[0][0].playerId = 'red';
        mockBoard[3][3].hasPlayer = true;
        mockBoard[3][3].playerId = 'blue';
        
        validateBoardStateConsistency();
        
        expect(consoleLogs.some(log => log.includes('Validating board state consistency'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Board state consistency validation passed'))).toBe(true);
    });
});

describe('getBoardStateSnapshot', () => {
    beforeEach(() => {
        mockGameState.gameStatus = 'playing';
        mockGameState.currentPlayer = 'red';
        mockGameState.moveHistory = ['move1', 'move2'];
        mockGameState.gameProgress = { test: 'data' };
        mockGameState.playerMoveStats = { red: { totalMoves: 1 } };
    });

    it('should create complete board state snapshot', () => {
        const snapshot = getBoardStateSnapshot();
        
        expect(snapshot).toBeDefined();
        expect(snapshot.timestamp).toBeDefined();
        expect(snapshot.gameStatus).toBe('playing');
        expect(snapshot.currentPlayer).toBe('red');
        expect(snapshot.board).toHaveLength(4);
        expect(snapshot.board[0]).toHaveLength(4);
        expect(snapshot.players).toHaveLength(2);
        expect(snapshot.metadata.moveCount).toBe(2);
        expect(snapshot.metadata.gameProgress).toEqual({ test: 'data' });
        expect(snapshot.metadata.playerStats).toEqual({ red: { totalMoves: 1 } });
    });

    it('should capture board card properties correctly', () => {
        mockBoard[1][1].collapsed = true;
        mockBoard[1][1].hasPlayer = true;
        mockBoard[1][1].playerId = 'red';
        mockBoard[1][1].type = '4';
        
        const snapshot = getBoardStateSnapshot();
        
        const snapshotCard = snapshot.board[1][1];
        expect(snapshotCard.type).toBe('4');
        expect(snapshotCard.position).toEqual({ row: 1, col: 1 });
        expect(snapshotCard.collapsed).toBe(true);
        expect(snapshotCard.hasPlayer).toBe(true);
        expect(snapshotCard.playerId).toBe('red');
    });

    it('should capture player states correctly', () => {
        const mockPlayer = mockPlayers.find(p => p.id === 'red');
        mockPlayer.getPosition.mockReturnValue({ row: 2, col: 2 });
        mockPlayer.isPlaced.mockReturnValue(true);
        mockPlayer.isActive = false;
        
        const snapshot = getBoardStateSnapshot();
        
        const snapshotPlayer = snapshot.players.find(p => p.id === 'red');
        expect(snapshotPlayer.id).toBe('red');
        expect(snapshotPlayer.color).toBe('red');
        expect(snapshotPlayer.startingCard).toBe('red-joker');
        expect(snapshotPlayer.position).toEqual({ row: 2, col: 2 });
        expect(snapshotPlayer.isActive).toBe(false);
        expect(snapshotPlayer.isPlaced).toBe(true);
    });

    it('should handle missing board gracefully', () => {
        mockBoard[1][1] = null;
        
        const snapshot = getBoardStateSnapshot();
        
        expect(snapshot).toBeDefined();
        expect(snapshot.board[1][1]).toBeUndefined();
    });

    it('should handle missing players gracefully', () => {
        mockGameState.players = null;
        
        const snapshot = getBoardStateSnapshot();
        
        expect(snapshot).toBeDefined();
        expect(snapshot.players).toEqual([]);
    });

    it('should handle errors and return null', () => {
        mockGetCardAtPosition.mockImplementation(() => {
            throw new Error('Test error');
        });
        
        const snapshot = getBoardStateSnapshot();
        
        expect(snapshot).toBeNull();
    });

    it('should log snapshot creation messages', () => {
        getBoardStateSnapshot();
        
        expect(consoleLogs.some(log => log.includes('Creating board state snapshot'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Board state snapshot created'))).toBe(true);
    });
});

describe('restoreBoardStateFromSnapshot', () => {
    let validSnapshot;

    beforeEach(() => {
        validSnapshot = {
            timestamp: '2024-01-01T00:00:00.000Z',
            gameStatus: 'playing',
            currentPlayer: 'blue',
            board: [],
            players: [
                {
                    id: 'red',
                    color: 'red',
                    startingCard: 'red-joker',
                    position: { row: 1, col: 1 },
                    isActive: false,
                    isPlaced: true
                },
                {
                    id: 'blue',
                    color: 'blue',
                    startingCard: 'black-joker',
                    position: { row: 2, col: 2 },
                    isActive: true,
                    isPlaced: true
                }
            ]
        };

        // Create snapshot board
        for (let row = 0; row < 4; row++) {
            validSnapshot.board[row] = [];
            for (let col = 0; col < 4; col++) {
                validSnapshot.board[row][col] = {
                    type: 'A',
                    position: { row, col },
                    collapsed: row === 0 && col === 0, // Make one collapsed
                    hasPlayer: (row === 1 && col === 1) || (row === 2 && col === 2),
                    playerId: (row === 1 && col === 1) ? 'red' : (row === 2 && col === 2) ? 'blue' : null
                };
            }
        }
    });

    it('should successfully restore board state from snapshot', () => {
        const result = restoreBoardStateFromSnapshot(validSnapshot);
        
        expect(result.success).toBe(true);
        expect(result.reason).toBe('Board state restored successfully');
        
        // Check board state restored
        expect(mockBoard[0][0].collapsed).toBe(true);
        expect(mockBoard[1][1].hasPlayer).toBe(true);
        expect(mockBoard[1][1].playerId).toBe('red');
        expect(mockBoard[2][2].hasPlayer).toBe(true);
        expect(mockBoard[2][2].playerId).toBe('blue');
        
        // Check game state restored
        expect(mockGameState.gameStatus).toBe('playing');
        expect(mockGameState.currentPlayer).toBe('blue');
    });

    it('should restore player positions', () => {
        const mockRedPlayer = mockPlayers.find(p => p.id === 'red');
        const mockBluePlayer = mockPlayers.find(p => p.id === 'blue');
        
        restoreBoardStateFromSnapshot(validSnapshot);
        
        expect(mockRedPlayer.setPosition).toHaveBeenCalledWith(1, 1);
        expect(mockRedPlayer.isActive).toBe(false);
        expect(mockBluePlayer.setPosition).toHaveBeenCalledWith(2, 2);
        expect(mockBluePlayer.isActive).toBe(true);
    });

    it('should handle invalid snapshot data', () => {
        const result = restoreBoardStateFromSnapshot(null);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Invalid snapshot data');
    });

    it('should handle missing snapshot board', () => {
        const invalidSnapshot = { players: [] };
        
        const result = restoreBoardStateFromSnapshot(invalidSnapshot);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Invalid snapshot data');
    });

    it('should handle missing snapshot players', () => {
        const invalidSnapshot = { board: [] };
        
        const result = restoreBoardStateFromSnapshot(invalidSnapshot);
        
        expect(result.success).toBe(false);
        expect(result.reason).toBe('Invalid snapshot data');
    });

    it('should handle missing current board card', () => {
        mockBoard[1][1] = null;
        
        const result = restoreBoardStateFromSnapshot(validSnapshot);
        
        expect(result.success).toBe(true); // Should still succeed
    });

    it('should handle missing player by id', () => {
        mockGetPlayerById.mockImplementation((playerId) => {
            if (playerId === 'red') return null; // Red player not found
            return mockPlayers.find(p => p.id === playerId) || null;
        });
        
        const result = restoreBoardStateFromSnapshot(validSnapshot);
        
        expect(result.success).toBe(true); // Should still succeed
    });

    it('should handle errors and return error result', () => {
        mockGetCardAtPosition.mockImplementation(() => {
            throw new Error('Test error');
        });
        
        const result = restoreBoardStateFromSnapshot(validSnapshot);
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Restore error: Test error');
    });

    it('should log restore messages', () => {
        restoreBoardStateFromSnapshot(validSnapshot);
        
        expect(consoleLogs.some(log => log.includes('Restoring board state from snapshot'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Board state restored from snapshot'))).toBe(true);
    });
});

describe('clearAllPlayerPositionsFromBoard', () => {
    beforeEach(() => {
        // Setup board with players
        mockBoard[0][0].hasPlayer = true;
        mockBoard[0][0].playerId = 'red';
        mockBoard[1][1].hasPlayer = true;
        mockBoard[1][1].playerId = 'blue';
        mockBoard[2][2].hasPlayer = true;
        mockBoard[2][2].playerId = 'green';
    });

    it('should successfully clear all player positions', () => {
        const result = clearAllPlayerPositionsFromBoard();
        
        expect(result.success).toBe(true);
        expect(result.reason).toBe('Cleared 3 player positions');
        expect(result.clearedCount).toBe(3);
        
        // Check all positions cleared
        expect(mockBoard[0][0].hasPlayer).toBe(false);
        expect(mockBoard[0][0].playerId).toBeNull();
        expect(mockBoard[1][1].hasPlayer).toBe(false);
        expect(mockBoard[1][1].playerId).toBeNull();
        expect(mockBoard[2][2].hasPlayer).toBe(false);
        expect(mockBoard[2][2].playerId).toBeNull();
    });

    it('should handle board with no players', () => {
        // Clear players first
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                mockBoard[row][col].hasPlayer = false;
                mockBoard[row][col].playerId = null;
            }
        }
        
        const result = clearAllPlayerPositionsFromBoard();
        
        expect(result.success).toBe(true);
        expect(result.clearedCount).toBe(0);
    });

    it('should handle missing cards gracefully', () => {
        mockBoard[1][1] = null;
        
        const result = clearAllPlayerPositionsFromBoard();
        
        expect(result.success).toBe(true);
        expect(result.clearedCount).toBe(2); // Only 2 players cleared
    });

    it('should handle errors and return error result', () => {
        mockGetCardAtPosition.mockImplementation(() => {
            throw new Error('Test error');
        });
        
        const result = clearAllPlayerPositionsFromBoard();
        
        expect(result.success).toBe(false);
        expect(result.reason).toContain('Clear error: Test error');
    });

    it('should log clear messages', () => {
        clearAllPlayerPositionsFromBoard();
        
        expect(consoleLogs.some(log => log.includes('Clearing all player positions from board'))).toBe(true);
        expect(consoleLogs.some(log => log.includes('Cleared 3 player positions from board'))).toBe(true);
    });
});