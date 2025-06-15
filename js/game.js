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
    try {
        if (!deck || !Array.isArray(deck)) {
            throw new Error('Invalid deck provided for shuffling');
        }
        
        if (deck.length !== 16) {
            throw new Error(`Invalid deck size: ${deck.length}. Expected: 16`);
        }
        
        const shuffled = [...deck]; // Create a copy to avoid mutating original
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
        }
        
        console.log('Deck shuffled:', shuffled);
        return shuffled;
    } catch (error) {
        console.error('Error shuffling deck:', error.message);
        logInitializationError('shuffleDeck', error);
        return null;
    }
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

// Error logging system for initialization failures
let initializationErrors = [];

function logInitializationError(functionName, error) {
    const errorLog = {
        timestamp: new Date().toISOString(),
        function: functionName,
        error: error.message || error,
        stack: error.stack || 'No stack trace available',
        gameState: gameState ? JSON.stringify(gameState, null, 2) : 'Game state not available'
    };
    
    initializationErrors.push(errorLog);
    console.error(`Initialization error in ${functionName}:`, errorLog);
    
    // Keep only last 10 errors to prevent memory issues
    if (initializationErrors.length > 10) {
        initializationErrors.shift();
    }
}

function getInitializationErrors() {
    return [...initializationErrors];
}

function clearInitializationErrors() {
    initializationErrors = [];
    console.log('Initialization error log cleared');
}

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

// Convert 1D shuffled deck to 4x4 2D board array
function convertDeckToBoard(shuffledDeck) {
    console.log('Converting 1D deck to 4x4 board...');
    
    try {
        if (shuffledDeck.length !== 16) {
            throw new Error(`Invalid deck size: ${shuffledDeck.length}. Expected: 16`);
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
    } catch (error) {
        console.error('Error converting deck to board:', error.message);
        logInitializationError('convertDeckToBoard', error);
        return null;
    }
}

// Function to manually test different board configurations for development
function createTestBoardConfiguration(configName) {
    console.log(`Creating test board configuration: ${configName}`);
    
    let testDeck;
    
    switch (configName) {
        case 'jokers-adjacent':
            // Place jokers next to each other for easy testing
            testDeck = [
                'red-joker', 'black-joker', 'A', 'A',
                'A', 'A', '2', '2',
                '2', '2', '3', '3',
                '3', '3', '4', '4'
            ];
            break;
            
        case 'jokers-corners':
            // Place jokers in opposite corners
            testDeck = [
                'red-joker', 'A', 'A', 'black-joker',
                'A', '2', '2', '2',
                '2', '3', '3', '3',
                '3', '4', '4', 'A'
            ];
            break;
            
        case 'high-cards-center':
            // Place high value cards in center for movement testing
            testDeck = [
                'red-joker', 'A', 'A', 'black-joker',
                'A', '4', '4', 'A',
                '2', '3', '3', '2',
                '2', '2', '3', '3'
            ];
            break;
            
        case 'alternating-pattern':
            // Create alternating pattern for visual testing
            testDeck = [
                'red-joker', 'A', '2', '3',
                '4', 'black-joker', 'A', '2',
                '3', '4', 'A', '2',
                '3', '4', 'A', '3'
            ];
            break;
            
        case 'random':
        default:
            // Use normal shuffle
            testDeck = shuffleDeck(CARD_DECK);
            break;
    }
    
    console.log(`Test configuration '${configName}' deck:`, testDeck);
    return testDeck;
}

// Function to test specific game scenarios
function testGameScenario(scenarioName) {
    console.log(`Testing game scenario: ${scenarioName}`);
    
    try {
        // Reset game state
        const shuffledDeck = initializeNewGame();
        if (!shuffledDeck) {
            throw new Error('Failed to initialize new game');
        }
        
        // Create test board
        const testDeck = createTestBoardConfiguration(scenarioName);
        if (!testDeck) {
            throw new Error(`Failed to create test configuration: ${scenarioName}`);
        }
        
        gameState.board = convertDeckToBoard(testDeck);
        if (!gameState.board) {
            throw new Error('Failed to convert test deck to board');
        }
        
        // Set up players
        gameState.players = createPlayers();
        if (!setupPlayerJokerAssignments()) {
            throw new Error('Failed to set up player joker assignments');
        }
        
        // Place players
        const placementSuccess = placePlayersOnJokers();
        if (!placementSuccess) {
            throw new Error('Failed to place players on jokers');
        }
        
        console.log(`Scenario '${scenarioName}' set up successfully`);
        console.log('Player positions:', getAllPlayerPositions());
        return true;
    } catch (error) {
        console.error(`Failed to set up scenario '${scenarioName}':`, error.message);
        logInitializationError('testGameScenario', error);
        return false;
    }
}

// Function to validate board configuration
function validateBoardConfiguration(board) {
    console.log('Validating board configuration...');
    
    const validations = {
        correctSize: board && board.length === 4 && board.every(row => row.length === 4),
        hasRedJoker: false,
        hasBlackJoker: false,
        correctCardCount: true,
        allPositionsValid: true
    };
    
    const cardCounts = {};
    
    // Check each position and count cards
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (!board[row] || !board[row][col]) {
                validations.allPositionsValid = false;
                continue;
            }
            
            const card = board[row][col];
            const cardType = card.type;
            
            // Count cards
            cardCounts[cardType] = (cardCounts[cardType] || 0) + 1;
            
            // Check for jokers
            if (cardType === 'red-joker') validations.hasRedJoker = true;
            if (cardType === 'black-joker') validations.hasBlackJoker = true;
            
            // Validate position matches
            if (card.position.row !== row || card.position.col !== col) {
                validations.allPositionsValid = false;
            }
        }
    }
    
    // Validate expected card counts
    const expectedCounts = {
        'red-joker': 1,
        'black-joker': 1,
        'A': 4,
        '2': 4,
        '3': 4,
        '4': 2
    };
    
    for (const [cardType, expectedCount] of Object.entries(expectedCounts)) {
        if (cardCounts[cardType] !== expectedCount) {
            validations.correctCardCount = false;
            console.error(`Invalid count for ${cardType}: expected ${expectedCount}, got ${cardCounts[cardType] || 0}`);
        }
    }
    
    console.log('Board validation results:', validations);
    console.log('Card counts:', cardCounts);
    
    const isValid = Object.values(validations).every(v => v === true);
    console.log(`Board configuration: ${isValid ? 'VALID' : 'INVALID'}`);
    
    return { isValid, validations, cardCounts };
}

// Function to run development tests
function runDevelopmentTests() {
    console.log('Running comprehensive development tests...');
    
    const testScenarios = ['jokers-adjacent', 'jokers-corners', 'high-cards-center', 'alternating-pattern', 'random'];
    const testResults = {};
    
    testScenarios.forEach(scenario => {
        console.log(`\n--- Testing scenario: ${scenario} ---`);
        
        const scenarioSuccess = testGameScenario(scenario);
        const boardValidation = validateBoardConfiguration(gameState.board);
        
        testResults[scenario] = {
            scenarioSetup: scenarioSuccess,
            boardValidation: boardValidation.isValid,
            overall: scenarioSuccess && boardValidation.isValid
        };
        
        console.log(`Scenario ${scenario}: ${testResults[scenario].overall ? 'PASS' : 'FAIL'}`);
    });
    
    console.log('\n--- Development Test Summary ---');
    console.log(testResults);
    
    const allPassing = Object.values(testResults).every(result => result.overall);
    console.log(`Overall development tests: ${allPassing ? 'PASSING' : 'FAILING'}`);
    
    return testResults;
}

// Function to test game state serialization for localStorage compatibility
function testGameStateSerialization() {
    console.log('Testing game state serialization for localStorage compatibility...');
    
    try {
        // Create a test game state
        const testDeck = initializeNewGame();
        if (!testDeck) {
            throw new Error('Failed to initialize test game');
        }
        
        gameState.board = convertDeckToBoard(testDeck);
        gameState.players = createPlayers();
        setupPlayerJokerAssignments();
        placePlayersOnJokers();
        
        // Test serialization
        console.log('Original game state:', gameState);
        
        const serialized = JSON.stringify(gameState);
        console.log('Serialized game state length:', serialized.length, 'characters');
        
        // Test deserialization
        const deserialized = JSON.parse(serialized);
        console.log('Deserialized game state:', deserialized);
        
        // Validate deserialized state
        const validation = {
            boardSize: deserialized.board && deserialized.board.length === 4,
            playersCount: deserialized.players && deserialized.players.length === 2,
            currentPlayerValid: typeof deserialized.currentPlayer === 'number',
            gameStatusExists: typeof deserialized.gameStatus === 'string',
            moveHistoryArray: Array.isArray(deserialized.moveHistory),
            playerPositions: deserialized.players && deserialized.players.every(p => 
                typeof p.position === 'object' && 
                typeof p.position.row === 'number' && 
                typeof p.position.col === 'number'
            )
        };
        
        console.log('Serialization validation:', validation);
        
        const isValid = Object.values(validation).every(v => v === true);
        console.log(`Game state serialization: ${isValid ? 'COMPATIBLE' : 'INCOMPATIBLE'}`);
        
        // Test localStorage compatibility
        if (typeof Storage !== 'undefined') {
            const testKey = 'collapsi_test_serialization';
            
            try {
                localStorage.setItem(testKey, serialized);
                const retrieved = localStorage.getItem(testKey);
                const retrievedParsed = JSON.parse(retrieved);
                
                const storageTest = JSON.stringify(retrievedParsed) === serialized;
                console.log(`localStorage compatibility: ${storageTest ? 'COMPATIBLE' : 'INCOMPATIBLE'}`);
                
                // Clean up test data
                localStorage.removeItem(testKey);
                
                return { serialization: isValid, localStorage: storageTest };
            } catch (storageError) {
                console.error('localStorage test failed:', storageError.message);
                return { serialization: isValid, localStorage: false };
            }
        } else {
            console.warn('localStorage not available in this environment');
            return { serialization: isValid, localStorage: null };
        }
    } catch (error) {
        console.error('Game state serialization test failed:', error.message);
        logInitializationError('testGameStateSerialization', error);
        return { serialization: false, localStorage: false };
    }
}

// Function to save game state to localStorage
function saveGameState() {
    console.log('Saving game state to localStorage...');
    
    try {
        if (typeof Storage === 'undefined') {
            throw new Error('localStorage not available');
        }
        
        const serialized = JSON.stringify(gameState);
        localStorage.setItem('collapsi_game_state', serialized);
        localStorage.setItem('collapsi_save_timestamp', new Date().toISOString());
        
        console.log('Game state saved successfully');
        return true;
    } catch (error) {
        console.error('Failed to save game state:', error.message);
        logInitializationError('saveGameState', error);
        return false;
    }
}

// Function to load game state from localStorage
function loadGameState() {
    console.log('Loading game state from localStorage...');
    
    try {
        if (typeof Storage === 'undefined') {
            throw new Error('localStorage not available');
        }
        
        const saved = localStorage.getItem('collapsi_game_state');
        if (!saved) {
            console.log('No saved game state found');
            return null;
        }
        
        const timestamp = localStorage.getItem('collapsi_save_timestamp');
        console.log('Found saved game from:', timestamp);
        
        const loadedState = JSON.parse(saved);
        
        // Validate loaded state structure
        if (!loadedState.board || !loadedState.players) {
            throw new Error('Invalid saved game state structure');
        }
        
        // Restore game state
        Object.assign(gameState, loadedState);
        
        console.log('Game state loaded successfully:', gameState);
        return loadedState;
    } catch (error) {
        console.error('Failed to load game state:', error.message);
        logInitializationError('loadGameState', error);
        return null;
    }
}

// Function to clear saved game state
function clearSavedGameState() {
    console.log('Clearing saved game state...');
    
    try {
        if (typeof Storage !== 'undefined') {
            localStorage.removeItem('collapsi_game_state');
            localStorage.removeItem('collapsi_save_timestamp');
            console.log('Saved game state cleared');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to clear saved game state:', error.message);
        return false;
    }
}

// Test the initialization and board conversion
console.log('Testing game initialization and board conversion:');
const initializedDeck = initializeNewGame();
const testBoard = convertDeckToBoard(initializedDeck);
console.log('Final board structure:', testBoard);