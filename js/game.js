// Collapsi Game - Core Game Logic and State Management

// Define the complete card deck as per game rules
const CARD_DECK = [
    'red-joker',
    'black-joker', 
    'A', 'A', 'A', 'A',
    '2', '2', '2', '2', 
    '3', '3', '3', '3',
    '4', '4'
];

console.log('Card deck initialized:', CARD_DECK);
console.log('Total cards:', CARD_DECK.length);

// Game state object structure
let gameState = {
    board: [], // 4x4 array of card objects
    players: [
        {
            id: 'red',
            color: 'red',
            position: { row: -1, col: -1 }, // Will be set during initialization
            startingCard: 'red-joker'
        },
        {
            id: 'blue', 
            color: 'blue',
            position: { row: -1, col: -1 }, // Will be set during initialization
            startingCard: 'black-joker'
        }
    ],
    currentPlayer: 0, // Index of current player (0 = red, 1 = blue)
    gameStatus: 'setup', // 'setup', 'playing', 'ended'
    moveHistory: [], // Array of move objects for future undo/replay
    winner: null, // Will be set when game ends
    currentMovePath: [], // Track current turn's movement path
    jokerMoveState: null // Track joker movement progress
};

console.log('Game state initialized:', gameState);

// Initialize new game function
function initializeNewGame() {
    console.log('Initializing new game...');
    
    try {
        // Reset game state to default values
        gameState.board = [];
        gameState.players[0].position = { row: -1, col: -1 };
        gameState.players[1].position = { row: -1, col: -1 };
        gameState.currentPlayer = 0; // Red player starts first
        gameState.gameStatus = 'setup';
        gameState.moveHistory = [];
        gameState.winner = null;
        gameState.currentMovePath = [];
        gameState.jokerMoveState = null;
        
        // Shuffle the deck and prepare for board conversion
        const shuffledDeck = shuffleDeck(CARD_DECK);
        
        if (!shuffledDeck || shuffledDeck.length !== 16) {
            throw new Error('Failed to create valid shuffled deck');
        }
        
        console.log('Game initialized with shuffled deck:', shuffledDeck);
        console.log('Current game state:', gameState);
        
        return shuffledDeck;
    } catch (error) {
        console.error('Error initializing new game:', error.message);
        logInitializationError('initializeNewGame', error);
        return null;
    }
}

// Get current player object
function getCurrentPlayer() {
    return gameState.players[gameState.currentPlayer];
}

// Switch to next player
function switchToNextPlayer() {
    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
    gameState.currentMovePath = [];
    gameState.jokerMoveState = null;
    console.log(`Switched to player: ${getCurrentPlayer().id}`);
}

// Check if game has ended (no legal moves available)
function checkGameEnd() {
    const currentPlayer = getCurrentPlayer();
    const legalMoves = getAllPossibleMoves(currentPlayer);
    
    if (legalMoves.length === 0) {
        gameState.gameStatus = 'ended';
        // Winner is the OTHER player (who made the last valid move)
        const previousPlayerIndex = (gameState.currentPlayer - 1 + gameState.players.length) % gameState.players.length;
        gameState.winner = gameState.players[previousPlayerIndex].id;
        console.log(`Game ended! Winner: ${gameState.winner}`);
        return true;
    }
    
    return false;
}

// Get all possible moves for a player
function getAllPossibleMoves(player) {
    // This will be implemented when we have movement validation
    // For now, return empty array
    return [];
}

// Add move to history
function addMoveToHistory(move) {
    gameState.moveHistory.push({
        ...move,
        timestamp: new Date().toISOString(),
        playerTurn: gameState.currentPlayer
    });
}

// Get game status information
function getGameStatus() {
    return {
        status: gameState.gameStatus,
        currentPlayer: getCurrentPlayer(),
        winner: gameState.winner,
        moveCount: gameState.moveHistory.length,
        canMove: gameState.gameStatus === 'playing' && !gameState.winner
    };
}

// Start the game (after setup is complete)
function startGame() {
    if (gameState.gameStatus === 'setup' && gameState.board.length === 4) {
        gameState.gameStatus = 'playing';
        console.log('Game started! Current player:', getCurrentPlayer().id);
        return true;
    }
    return false;
}

// Test the initialization and board conversion
console.log('Testing game initialization and board conversion:');
const initializedDeck = initializeNewGame();
const testBoard = convertDeckToBoard(initializedDeck);
console.log('Final board structure:', testBoard);

// Test movement distance validation
console.log('\nTesting movement distance validation:');
console.log('A card with 1 space:', validateMovementDistance('A', 1));
console.log('A card with 2 spaces:', validateMovementDistance('A', 2));
console.log('2 card with 2 spaces:', validateMovementDistance('2', 2));
console.log('Joker with 3 spaces:', validateMovementDistance('red-joker', 3));
console.log('Joker with 5 spaces:', validateMovementDistance('red-joker', 5));

// Test orthogonal movement validation
console.log('\nTesting orthogonal movement validation:');
console.log('Up step:', isOrthogonalStep({row: 1, col: 1}, {row: 0, col: 1}));
console.log('Diagonal step:', isOrthogonalStep({row: 1, col: 1}, {row: 0, col: 0}));
console.log('Multi-space step:', isOrthogonalStep({row: 1, col: 1}, {row: 3, col: 1}));

const testPath1 = [{row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 1}];
const testPath2 = [{row: 0, col: 0}, {row: 1, col: 1}];
console.log('Valid orthogonal path:', validateOrthogonalPath(testPath1));
console.log('Invalid diagonal path:', validateOrthogonalPath(testPath2));

// Test wraparound calculations
console.log('\nTesting wraparound calculations:');
console.log('Up from (0,1):', calculateWraparoundPosition({row: 0, col: 1}, 'up'));
console.log('Left from (1,0):', calculateWraparoundPosition({row: 1, col: 0}, 'left'));
console.log('Down from (3,2):', calculateWraparoundPosition({row: 3, col: 2}, 'down'));
console.log('Right from (2,3):', calculateWraparoundPosition({row: 2, col: 3}, 'right'));

console.log('\nTesting wraparound step detection:');
console.log('Normal step:', isWraparoundStep({row: 1, col: 1}, {row: 1, col: 2}));
console.log('Wraparound left edge:', isWraparoundStep({row: 1, col: 0}, {row: 1, col: 3}));
console.log('Wraparound top edge:', isWraparoundStep({row: 0, col: 1}, {row: 3, col: 1}));

console.log('\nTesting adjacent positions:');
console.log('Corner position (0,0):', getAdjacentPositions({row: 0, col: 0}));
console.log('Center position (1,1):', getAdjacentPositions({row: 1, col: 1}));

// Test path validation for revisited cards
console.log('\nTesting path validation for revisited cards:');
const validPath = [{row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 1}, {row: 1, col: 2}];
const invalidPath = [{row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 1}, {row: 0, col: 1}]; // revisits (0,1)
console.log('Valid path (no revisits):', validateNoRevisitedCards(validPath));
console.log('Invalid path (revisits):', validateNoRevisitedCards(invalidPath));

console.log('\nTesting comprehensive path validation:');
console.log('Valid complete path:', validateCompletePath(validPath));
console.log('Invalid complete path:', validateCompletePath(invalidPath));

console.log('\nTesting next position validation:');
const currentPath = [{row: 0, col: 0}, {row: 0, col: 1}];
console.log('Valid next position:', isValidNextPosition(currentPath, {row: 0, col: 2}));
console.log('Invalid next position (revisit):', isValidNextPosition(currentPath, {row: 0, col: 0}));

// Test move ending validation
console.log('\nTesting move ending validation:');

// Create test players
const testPlayers = [
    { id: 'red', position: { row: 1, col: 1 } },
    { id: 'blue', position: { row: 2, col: 2 } }
];

console.log('Valid ending (different position):', validateNotEndingOnStartingCard({row: 0, col: 0}, {row: 0, col: 1}));
console.log('Invalid ending (same position):', validateNotEndingOnStartingCard({row: 0, col: 0}, {row: 0, col: 0}));

console.log('Valid ending (unoccupied):', validateNotEndingOnOccupiedPosition({row: 3, col: 3}, null, testPlayers, 'red'));
console.log('Invalid ending (occupied):', validateNotEndingOnOccupiedPosition({row: 2, col: 2}, null, testPlayers, 'red'));

console.log('Comprehensive validation (valid):', validateMoveEnding({row: 0, col: 0}, {row: 3, col: 3}, null, testPlayers, 'red'));
console.log('Comprehensive validation (invalid):', validateMoveEnding({row: 0, col: 0}, {row: 0, col: 0}, null, testPlayers, 'red'));

// Run performance benchmarks
console.log('\nRunning performance benchmarks:');
benchmarkValidationPerformance();