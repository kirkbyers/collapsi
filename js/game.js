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

// Fisher-Yates shuffle algorithm for randomizing card order
function shuffleDeck(deck) {
    const shuffled = [...deck]; // Create a copy to avoid mutating original
    
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }
    
    console.log('Deck shuffled:', shuffled);
    return shuffled;
}

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
    winner: null // Will be set when game ends
};

console.log('Game state initialized:', gameState);

// Initialize new game function
function initializeNewGame() {
    console.log('Initializing new game...');
    
    // Reset game state to default values
    gameState.board = [];
    gameState.players[0].position = { row: -1, col: -1 };
    gameState.players[1].position = { row: -1, col: -1 };
    gameState.currentPlayer = 0; // Red player starts first
    gameState.gameStatus = 'setup';
    gameState.moveHistory = [];
    gameState.winner = null;
    
    // Shuffle the deck and prepare for board conversion
    const shuffledDeck = shuffleDeck(CARD_DECK);
    
    console.log('Game initialized with shuffled deck:', shuffledDeck);
    console.log('Current game state:', gameState);
    
    return shuffledDeck;
}

// Convert 1D shuffled deck to 4x4 2D board array
function convertDeckToBoard(shuffledDeck) {
    console.log('Converting 1D deck to 4x4 board...');
    
    if (shuffledDeck.length !== 16) {
        console.error('Invalid deck size:', shuffledDeck.length, 'Expected: 16');
        return null;
    }
    
    const board = [];
    let deckIndex = 0;
    
    // Create 4x4 board with card objects
    for (let row = 0; row < 4; row++) {
        board[row] = [];
        for (let col = 0; col < 4; col++) {
            board[row][col] = {
                type: shuffledDeck[deckIndex],
                position: { row, col },
                collapsed: false, // Face-up initially
                hasPlayer: false,
                playerId: null
            };
            deckIndex++;
        }
    }
    
    console.log('Board created:', board);
    return board;
}

// Test the initialization and board conversion
console.log('Testing game initialization and board conversion:');
const initializedDeck = initializeNewGame();
const testBoard = convertDeckToBoard(initializedDeck);
console.log('Final board structure:', testBoard);