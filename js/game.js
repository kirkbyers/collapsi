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

// Movement validation functions for Phase 3

// Get the movement distance value for a card type
function getCardMovementDistance(cardType) {
    console.log(`Getting movement distance for card type: ${cardType}`);
    
    try {
        if (!cardType) {
            throw new Error('Card type is required');
        }
        
        // Jokers allow flexible movement (1-4 spaces)
        if (cardType === 'red-joker' || cardType === 'black-joker') {
            return { type: 'joker', allowedDistances: [1, 2, 3, 4] };
        }
        
        // Numbered cards require exact movement
        switch (cardType) {
            case 'A':
                return { type: 'fixed', distance: 1 };
            case '2':
                return { type: 'fixed', distance: 2 };
            case '3':
                return { type: 'fixed', distance: 3 };
            case '4':
                return { type: 'fixed', distance: 4 };
            default:
                throw new Error(`Unknown card type: ${cardType}`);
        }
    } catch (error) {
        console.error('Error getting card movement distance:', error.message);
        return null;
    }
}

// Validate that a movement distance matches the starting card requirements
function validateMovementDistance(startingCardType, plannedDistance) {
    console.log(`Validating movement distance: ${plannedDistance} for card type: ${startingCardType}`);
    
    try {
        if (!startingCardType || typeof plannedDistance !== 'number') {
            throw new Error('Starting card type and planned distance are required');
        }
        
        if (plannedDistance < 1 || plannedDistance > 4) {
            return {
                valid: false,
                reason: `Invalid distance: ${plannedDistance}. Must be between 1 and 4.`
            };
        }
        
        const cardMovement = getCardMovementDistance(startingCardType);
        if (!cardMovement) {
            return {
                valid: false,
                reason: `Unable to determine movement rules for card type: ${startingCardType}`
            };
        }
        
        // Handle joker cards (flexible movement)
        if (cardMovement.type === 'joker') {
            const isValidJokerDistance = cardMovement.allowedDistances.includes(plannedDistance);
            return {
                valid: isValidJokerDistance,
                reason: isValidJokerDistance ? 
                    `Valid joker movement: ${plannedDistance} spaces` :
                    `Invalid joker movement: ${plannedDistance}. Must be 1, 2, 3, or 4 spaces.`
            };
        }
        
        // Handle fixed distance cards (exact movement required)
        if (cardMovement.type === 'fixed') {
            const isExactMatch = cardMovement.distance === plannedDistance;
            return {
                valid: isExactMatch,
                reason: isExactMatch ?
                    `Valid exact movement: ${plannedDistance} spaces` :
                    `Invalid movement: ${plannedDistance}. Card '${startingCardType}' requires exactly ${cardMovement.distance} spaces.`
            };
        }
        
        return {
            valid: false,
            reason: `Unknown movement type for card: ${startingCardType}`
        };
    } catch (error) {
        console.error('Error validating movement distance:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Test the initialization and board conversion
console.log('Testing game initialization and board conversion:');
const initializedDeck = initializeNewGame();
const testBoard = convertDeckToBoard(initializedDeck);
console.log('Final board structure:', testBoard);

// Orthogonal movement validation functions

// Check if a single movement step is orthogonal (up/down/left/right only)
function isOrthogonalStep(fromPosition, toPosition) {
    console.log(`Checking orthogonal step from ${JSON.stringify(fromPosition)} to ${JSON.stringify(toPosition)}`);
    
    try {
        if (!fromPosition || !toPosition) {
            throw new Error('Both from and to positions are required');
        }
        
        if (typeof fromPosition.row !== 'number' || typeof fromPosition.col !== 'number' ||
            typeof toPosition.row !== 'number' || typeof toPosition.col !== 'number') {
            throw new Error('Position coordinates must be numbers');
        }
        
        const rowDiff = Math.abs(toPosition.row - fromPosition.row);
        const colDiff = Math.abs(toPosition.col - fromPosition.col);
        
        // Valid orthogonal move: exactly one coordinate changes by exactly 1
        const isOrthogonal = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
        
        return {
            valid: isOrthogonal,
            rowDiff,
            colDiff,
            reason: isOrthogonal ? 
                'Valid orthogonal movement' : 
                `Invalid movement: diagonal or multi-space step (row diff: ${rowDiff}, col diff: ${colDiff})`
        };
    } catch (error) {
        console.error('Error checking orthogonal step:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Validate that a complete movement path consists only of orthogonal steps
function validateOrthogonalPath(path) {
    console.log('Validating orthogonal path:', path);
    
    try {
        if (!path || !Array.isArray(path)) {
            throw new Error('Path must be an array of positions');
        }
        
        if (path.length < 2) {
            return {
                valid: true,
                reason: 'Path too short to validate (less than 2 positions)'
            };
        }
        
        // Check each step in the path
        for (let i = 0; i < path.length - 1; i++) {
            const fromPos = path[i];
            const toPos = path[i + 1];
            
            const stepValidation = isOrthogonalStep(fromPos, toPos);
            if (!stepValidation.valid) {
                return {
                    valid: false,
                    failedStep: i + 1,
                    reason: `Step ${i + 1} invalid: ${stepValidation.reason}`
                };
            }
        }
        
        return {
            valid: true,
            totalSteps: path.length - 1,
            reason: `All ${path.length - 1} steps are valid orthogonal movements`
        };
    } catch (error) {
        console.error('Error validating orthogonal path:', error.message);
        return {
            valid: false,
            reason: `Path validation error: ${error.message}`
        };
    }
}

// Get the direction of movement between two adjacent positions
function getMovementDirection(fromPosition, toPosition) {
    try {
        if (!fromPosition || !toPosition) {
            throw new Error('Both positions are required');
        }
        
        const rowDiff = toPosition.row - fromPosition.row;
        const colDiff = toPosition.col - fromPosition.col;
        
        // Check for valid orthogonal movement
        if (Math.abs(rowDiff) + Math.abs(colDiff) !== 1) {
            return {
                valid: false,
                reason: 'Not an adjacent orthogonal movement'
            };
        }
        
        // Determine direction
        if (rowDiff === -1) return { valid: true, direction: 'up', vector: { row: -1, col: 0 } };
        if (rowDiff === 1) return { valid: true, direction: 'down', vector: { row: 1, col: 0 } };
        if (colDiff === -1) return { valid: true, direction: 'left', vector: { row: 0, col: -1 } };
        if (colDiff === 1) return { valid: true, direction: 'right', vector: { row: 0, col: 1 } };
        
        return {
            valid: false,
            reason: 'Unable to determine movement direction'
        };
    } catch (error) {
        console.error('Error getting movement direction:', error.message);
        return {
            valid: false,
            reason: `Direction error: ${error.message}`
        };
    }
}

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

// Wraparound edge calculation functions

// Calculate the next position with wraparound for a 4x4 board
function calculateWraparoundPosition(position, direction) {
    console.log(`Calculating wraparound position from ${JSON.stringify(position)} in direction: ${direction}`);
    
    try {
        if (!position || typeof position.row !== 'number' || typeof position.col !== 'number') {
            throw new Error('Invalid position provided');
        }
        
        if (position.row < 0 || position.row >= 4 || position.col < 0 || position.col >= 4) {
            throw new Error(`Position out of bounds: ${JSON.stringify(position)}`);
        }
        
        let newRow = position.row;
        let newCol = position.col;
        
        // Apply direction movement with wraparound using modulo arithmetic
        switch (direction) {
            case 'up':
                newRow = (position.row - 1 + 4) % 4; // Wrap from row 0 to row 3
                break;
            case 'down':
                newRow = (position.row + 1) % 4; // Wrap from row 3 to row 0
                break;
            case 'left':
                newCol = (position.col - 1 + 4) % 4; // Wrap from col 0 to col 3
                break;
            case 'right':
                newCol = (position.col + 1) % 4; // Wrap from col 3 to col 0
                break;
            default:
                throw new Error(`Invalid direction: ${direction}`);
        }
        
        const wrappedPosition = { row: newRow, col: newCol };
        const didWrap = newRow !== position.row + (direction === 'up' ? -1 : direction === 'down' ? 1 : 0) ||
                       newCol !== position.col + (direction === 'left' ? -1 : direction === 'right' ? 1 : 0);
        
        console.log(`Wraparound result: ${JSON.stringify(wrappedPosition)}, wrapped: ${didWrap}`);
        
        return {
            position: wrappedPosition,
            wrapped: didWrap,
            direction: direction
        };
    } catch (error) {
        console.error('Error calculating wraparound position:', error.message);
        return null;
    }
}

// Check if a movement step involves wraparound
function isWraparoundStep(fromPosition, toPosition) {
    console.log(`Checking wraparound step from ${JSON.stringify(fromPosition)} to ${JSON.stringify(toPosition)}`);
    
    try {
        if (!fromPosition || !toPosition) {
            throw new Error('Both positions are required');
        }
        
        // Check if positions are adjacent considering wraparound
        const rowDiff = toPosition.row - fromPosition.row;
        const colDiff = toPosition.col - fromPosition.col;
        
        // Check for direct adjacency (no wraparound)
        if ((Math.abs(rowDiff) === 1 && colDiff === 0) || (rowDiff === 0 && Math.abs(colDiff) === 1)) {
            return {
                isWraparound: false,
                direction: getMovementDirection(fromPosition, toPosition).direction,
                reason: 'Direct adjacent movement, no wraparound'
            };
        }
        
        // Check for wraparound adjacency
        const isVerticalWrap = (rowDiff === 3 || rowDiff === -3) && colDiff === 0;
        const isHorizontalWrap = rowDiff === 0 && (colDiff === 3 || colDiff === -3);
        
        if (isVerticalWrap) {
            const direction = rowDiff === 3 ? 'up' : 'down'; // 3 -> -1 (up), -3 -> 1 (down) 
            return {
                isWraparound: true,
                direction: direction,
                reason: `Vertical wraparound: ${direction}`
            };
        }
        
        if (isHorizontalWrap) {
            const direction = colDiff === 3 ? 'left' : 'right'; // 3 -> -1 (left), -3 -> 1 (right)
            return {
                isWraparound: true,
                direction: direction,
                reason: `Horizontal wraparound: ${direction}`
            };
        }
        
        return {
            isWraparound: false,
            direction: null,
            reason: 'Not an adjacent movement (with or without wraparound)'
        };
    } catch (error) {
        console.error('Error checking wraparound step:', error.message);
        return {
            isWraparound: false,
            direction: null,
            reason: `Error: ${error.message}`
        };
    }
}

// Get all possible adjacent positions from a given position including wraparound
function getAdjacentPositions(position) {
    console.log(`Getting adjacent positions for ${JSON.stringify(position)}`);
    
    try {
        if (!position || typeof position.row !== 'number' || typeof position.col !== 'number') {
            throw new Error('Invalid position provided');
        }
        
        const directions = ['up', 'down', 'left', 'right'];
        const adjacentPositions = [];
        
        directions.forEach(direction => {
            const result = calculateWraparoundPosition(position, direction);
            if (result) {
                adjacentPositions.push({
                    position: result.position,
                    direction: direction,
                    wrapped: result.wrapped
                });
            }
        });
        
        console.log(`Found ${adjacentPositions.length} adjacent positions:`, adjacentPositions);
        return adjacentPositions;
    } catch (error) {
        console.error('Error getting adjacent positions:', error.message);
        return [];
    }
}

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

// Path validation functions to prevent revisiting cards

// Check if a position has already been visited in the current path
function isPositionVisited(position, visitedPositions) {
    try {
        if (!position || !Array.isArray(visitedPositions)) {
            throw new Error('Position and visited positions array are required');
        }
        
        // Check if this exact position exists in the visited list
        return visitedPositions.some(visited => 
            visited.row === position.row && visited.col === position.col
        );
    } catch (error) {
        console.error('Error checking if position is visited:', error.message);
        return true; // Default to "visited" to prevent invalid moves
    }
}

// Validate that a path doesn't revisit any cards during a single turn
function validateNoRevisitedCards(path) {
    console.log('Validating path for revisited cards:', path);
    
    try {
        if (!path || !Array.isArray(path)) {
            throw new Error('Path must be an array of positions');
        }
        
        if (path.length <= 1) {
            return {
                valid: true,
                reason: 'Path too short to have revisited cards'
            };
        }
        
        const visitedPositions = new Set();
        
        // Check each position in the path
        for (let i = 0; i < path.length; i++) {
            const position = path[i];
            
            if (!position || typeof position.row !== 'number' || typeof position.col !== 'number') {
                return {
                    valid: false,
                    reason: `Invalid position at step ${i}: ${JSON.stringify(position)}`
                };
            }
            
            // Create a unique key for this position
            const positionKey = `${position.row},${position.col}`;
            
            // Check if we've already visited this position
            if (visitedPositions.has(positionKey)) {
                return {
                    valid: false,
                    revisitedPosition: position,
                    revisitedAtStep: i,
                    reason: `Position ${JSON.stringify(position)} revisited at step ${i}`
                };
            }
            
            // Add this position to visited set
            visitedPositions.add(positionKey);
        }
        
        return {
            valid: true,
            totalUniquePositions: visitedPositions.size,
            reason: `Path valid: ${visitedPositions.size} unique positions, no revisits`
        };
    } catch (error) {
        console.error('Error validating path for revisited cards:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Get all positions that would be invalid to visit next (already visited)
function getInvalidNextPositions(currentPath) {
    console.log('Getting invalid next positions for current path:', currentPath);
    
    try {
        if (!currentPath || !Array.isArray(currentPath)) {
            return [];
        }
        
        // Return all positions already in the path
        return currentPath.map(pos => ({
            row: pos.row,
            col: pos.col,
            reason: 'Already visited in current turn'
        }));
    } catch (error) {
        console.error('Error getting invalid next positions:', error.message);
        return [];
    }
}

// Check if a proposed next position is valid (not already visited)
function isValidNextPosition(currentPath, proposedPosition) {
    console.log(`Checking if position ${JSON.stringify(proposedPosition)} is valid for path:`, currentPath);
    
    try {
        if (!proposedPosition || typeof proposedPosition.row !== 'number' || typeof proposedPosition.col !== 'number') {
            return {
                valid: false,
                reason: 'Invalid proposed position'
            };
        }
        
        if (!currentPath || !Array.isArray(currentPath)) {
            return {
                valid: true,
                reason: 'No current path to check against'
            };
        }
        
        // Check if the proposed position has already been visited
        const alreadyVisited = currentPath.some(pos => 
            pos.row === proposedPosition.row && pos.col === proposedPosition.col
        );
        
        return {
            valid: !alreadyVisited,
            reason: alreadyVisited ? 
                `Position ${JSON.stringify(proposedPosition)} already visited in current turn` :
                'Position not yet visited, valid to move to'
        };
    } catch (error) {
        console.error('Error checking if next position is valid:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Create a comprehensive path validation function
function validateCompletePath(path) {
    console.log('Running comprehensive path validation:', path);
    
    try {
        if (!path || !Array.isArray(path)) {
            return {
                valid: false,
                reason: 'Path must be an array'
            };
        }
        
        if (path.length < 2) {
            return {
                valid: true,
                reason: 'Path too short to validate'
            };
        }
        
        // Run all validation checks
        const orthogonalCheck = validateOrthogonalPath(path);
        const revisitCheck = validateNoRevisitedCards(path);
        
        // Combine results
        const isValid = orthogonalCheck.valid && revisitCheck.valid;
        
        return {
            valid: isValid,
            orthogonalValid: orthogonalCheck.valid,
            noRevisitsValid: revisitCheck.valid,
            pathLength: path.length,
            totalSteps: path.length - 1,
            reason: isValid ? 
                'Path passes all validation checks' :
                `Path validation failed: ${!orthogonalCheck.valid ? orthogonalCheck.reason : ''} ${!revisitCheck.valid ? revisitCheck.reason : ''}`
        };
    } catch (error) {
        console.error('Error in comprehensive path validation:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

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

// Validation functions for starting card and occupied positions

// Check if a position is occupied by a player
function isPositionOccupied(position, gameBoard, players) {
    console.log(`Checking if position ${JSON.stringify(position)} is occupied`);
    
    try {
        if (!position || typeof position.row !== 'number' || typeof position.col !== 'number') {
            throw new Error('Invalid position provided');
        }
        
        if (!players || !Array.isArray(players)) {
            return {
                occupied: false,
                reason: 'No players provided'
            };
        }
        
        // Check if any player is at this position
        const occupyingPlayer = players.find(player => 
            player.position && 
            player.position.row === position.row && 
            player.position.col === position.col
        );
        
        if (occupyingPlayer) {
            return {
                occupied: true,
                occupiedBy: occupyingPlayer.id,
                reason: `Position occupied by player: ${occupyingPlayer.id}`
            };
        }
        
        // Also check the board state for hasPlayer flag if available
        if (gameBoard && gameBoard[position.row] && gameBoard[position.row][position.col]) {
            const card = gameBoard[position.row][position.col];
            if (card.hasPlayer) {
                return {
                    occupied: true,
                    occupiedBy: card.playerId || 'unknown',
                    reason: `Position marked as occupied on board by: ${card.playerId || 'unknown'}`
                };
            }
        }
        
        return {
            occupied: false,
            reason: 'Position is not occupied'
        };
    } catch (error) {
        console.error('Error checking if position is occupied:', error.message);
        return {
            occupied: true, // Default to occupied to prevent invalid moves
            reason: `Error checking occupation: ${error.message}`
        };
    }
}

// Validate that move doesn't end on starting card
function validateNotEndingOnStartingCard(startingPosition, endingPosition) {
    console.log(`Validating move doesn't end on starting card: start ${JSON.stringify(startingPosition)}, end ${JSON.stringify(endingPosition)}`);
    
    try {
        if (!startingPosition || !endingPosition) {
            throw new Error('Both starting and ending positions are required');
        }
        
        const isSamePosition = startingPosition.row === endingPosition.row && 
                              startingPosition.col === endingPosition.col;
        
        return {
            valid: !isSamePosition,
            reason: isSamePosition ? 
                'Cannot end move on starting card' :
                'Move ending position is different from starting position'
        };
    } catch (error) {
        console.error('Error validating ending position:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Validate that move doesn't end on an occupied position
function validateNotEndingOnOccupiedPosition(endingPosition, gameBoard, players, currentPlayerId) {
    console.log(`Validating move doesn't end on occupied position: ${JSON.stringify(endingPosition)}`);
    
    try {
        if (!endingPosition || typeof endingPosition.row !== 'number' || typeof endingPosition.col !== 'number') {
            throw new Error('Valid ending position is required');
        }
        
        const occupationCheck = isPositionOccupied(endingPosition, gameBoard, players);
        
        // If not occupied, move is valid
        if (!occupationCheck.occupied) {
            return {
                valid: true,
                reason: 'Position is not occupied'
            };
        }
        
        // If occupied by current player, that should not happen in normal gameplay but check anyway
        if (occupationCheck.occupiedBy === currentPlayerId) {
            return {
                valid: false,
                reason: `Cannot end on position occupied by current player: ${currentPlayerId}`
            };
        }
        
        // If occupied by opponent, move is invalid
        return {
            valid: false,
            occupiedBy: occupationCheck.occupiedBy,
            reason: `Position occupied by opponent: ${occupationCheck.occupiedBy}`
        };
    } catch (error) {
        console.error('Error validating ending on occupied position:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Comprehensive move ending validation
function validateMoveEnding(startingPosition, endingPosition, gameBoard, players, currentPlayerId) {
    console.log(`Comprehensive move ending validation from ${JSON.stringify(startingPosition)} to ${JSON.stringify(endingPosition)}`);
    
    try {
        // Check starting card rule
        const startingCardCheck = validateNotEndingOnStartingCard(startingPosition, endingPosition);
        
        // Check occupied position rule
        const occupiedCheck = validateNotEndingOnOccupiedPosition(endingPosition, gameBoard, players, currentPlayerId);
        
        // Combine results
        const isValid = startingCardCheck.valid && occupiedCheck.valid;
        
        return {
            valid: isValid,
            startingCardValid: startingCardCheck.valid,
            occupiedPositionValid: occupiedCheck.valid,
            occupiedBy: occupiedCheck.occupiedBy,
            reason: isValid ? 
                'Move ending position is valid' :
                `Move ending invalid: ${!startingCardCheck.valid ? startingCardCheck.reason : ''} ${!occupiedCheck.valid ? occupiedCheck.reason : ''}`
        };
    } catch (error) {
        console.error('Error in comprehensive move ending validation:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Check if a position has a collapsed card (face-down)
function isCardCollapsed(position, gameBoard) {
    try {
        if (!position || !gameBoard) {
            return {
                collapsed: false,
                reason: 'Position or board not provided'
            };
        }
        
        if (position.row < 0 || position.row >= 4 || position.col < 0 || position.col >= 4) {
            return {
                collapsed: false,
                reason: 'Position out of bounds'
            };
        }
        
        const card = gameBoard[position.row] && gameBoard[position.row][position.col];
        if (!card) {
            return {
                collapsed: false,
                reason: 'Card not found at position'
            };
        }
        
        return {
            collapsed: card.collapsed || false,
            cardType: card.type,
            reason: card.collapsed ? 'Card is collapsed (face-down)' : 'Card is not collapsed'
        };
    } catch (error) {
        console.error('Error checking if card is collapsed:', error.message);
        return {
            collapsed: true, // Default to collapsed to prevent invalid moves
            reason: `Error checking collapse state: ${error.message}`
        };
    }
}

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

// Performance optimization functions for <100ms validation

// Optimized move validation with early exit and caching
function validateMoveOptimized(startingPosition, path, distance, startingCardType, gameBoard, players, currentPlayerId) {
    const startTime = performance.now();
    console.log('Starting optimized move validation');
    
    try {
        if (!startingPosition || !path || !Array.isArray(path) || path.length < 2) {
            return {
                valid: false,
                reason: 'Invalid input parameters',
                executionTime: performance.now() - startTime
            };
        }
        
        // Early validation checks (fastest first)
        
        // 1. Quick distance check (no complex path walking needed)
        const distanceValidation = validateMovementDistance(startingCardType, distance);
        if (!distanceValidation.valid) {
            return {
                valid: false,
                reason: distanceValidation.reason,
                executionTime: performance.now() - startTime
            };
        }
        
        // 2. Quick ending position check (before full path validation)
        const endingPosition = path[path.length - 1];
        const endingValidation = validateMoveEnding(startingPosition, endingPosition, gameBoard, players, currentPlayerId);
        if (!endingValidation.valid) {
            return {
                valid: false,
                reason: endingValidation.reason,
                executionTime: performance.now() - startTime
            };
        }
        
        // 3. Path length check (should match distance)
        if (path.length - 1 !== distance) {
            return {
                valid: false,
                reason: `Path length ${path.length - 1} doesn't match required distance ${distance}`,
                executionTime: performance.now() - startTime
            };
        }
        
        // 4. Optimized path validation (stop on first error)
        const pathValidation = validateCompletePathOptimized(path);
        if (!pathValidation.valid) {
            return {
                valid: false,
                reason: pathValidation.reason,
                executionTime: performance.now() - startTime
            };
        }
        
        const executionTime = performance.now() - startTime;
        console.log(`Optimized validation completed in ${executionTime.toFixed(2)}ms`);
        
        return {
            valid: true,
            reason: 'All validations passed',
            executionTime: executionTime,
            pathLength: path.length,
            distance: distance
        };
    } catch (error) {
        const executionTime = performance.now() - startTime;
        console.error('Error in optimized move validation:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`,
            executionTime: executionTime
        };
    }
}

// Optimized path validation with early exit
function validateCompletePathOptimized(path) {
    try {
        if (!path || path.length < 2) {
            return { valid: true, reason: 'Path too short to validate' };
        }
        
        const visitedSet = new Set();
        
        // Combined validation loop (single pass)
        for (let i = 0; i < path.length; i++) {
            const position = path[i];
            
            // Validate position format
            if (!position || typeof position.row !== 'number' || typeof position.col !== 'number') {
                return {
                    valid: false,
                    reason: `Invalid position at step ${i}`
                };
            }
            
            // Check for revisits
            const posKey = `${position.row},${position.col}`;
            if (visitedSet.has(posKey)) {
                return {
                    valid: false,
                    reason: `Position revisited at step ${i}`
                };
            }
            visitedSet.add(posKey);
            
            // Check orthogonal movement (if not first position)
            if (i > 0) {
                const prevPos = path[i - 1];
                const rowDiff = Math.abs(position.row - prevPos.row);
                const colDiff = Math.abs(position.col - prevPos.col);
                
                // Quick orthogonal check (direct adjacency or wraparound)
                const isDirect = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
                const isWrap = (rowDiff === 3 && colDiff === 0) || (rowDiff === 0 && colDiff === 3);
                
                if (!isDirect && !isWrap) {
                    return {
                        valid: false,
                        reason: `Invalid orthogonal step at ${i}`
                    };
                }
            }
        }
        
        return {
            valid: true,
            reason: `Path valid: ${path.length - 1} steps`
        };
    } catch (error) {
        return {
            valid: false,
            reason: `Path validation error: ${error.message}`
        };
    }
}

// Performance benchmark function
function benchmarkValidationPerformance() {
    console.log('Running validation performance benchmarks...');
    
    const testCases = [
        {
            name: 'Short path (1 step)',
            path: [{row: 0, col: 0}, {row: 0, col: 1}],
            distance: 1,
            cardType: 'A'
        },
        {
            name: 'Medium path (3 steps)',
            path: [{row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 1}, {row: 1, col: 2}],
            distance: 3,
            cardType: '3'
        },
        {
            name: 'Long path (4 steps with wraparound)',
            path: [{row: 0, col: 0}, {row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}, {row: 3, col: 3}],
            distance: 4,
            cardType: '4'
        }
    ];
    
    const results = {};
    
    testCases.forEach(testCase => {
        const iterations = 100; // Run multiple times for average
        const times = [];
        
        for (let i = 0; i < iterations; i++) {
            const result = validateMoveOptimized(
                testCase.path[0],
                testCase.path,
                testCase.distance,
                testCase.cardType,
                null, // No board for benchmark
                [], // No players for benchmark
                'test'
            );
            times.push(result.executionTime);
        }
        
        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const maxTime = Math.max(...times);
        const minTime = Math.min(...times);
        
        results[testCase.name] = {
            averageMs: avgTime.toFixed(3),
            maxMs: maxTime.toFixed(3),
            minMs: minTime.toFixed(3),
            under100ms: maxTime < 100
        };
        
        console.log(`${testCase.name}: avg ${avgTime.toFixed(2)}ms, max ${maxTime.toFixed(2)}ms (under 100ms: ${maxTime < 100})`);
    });
    
    const allUnder100 = Object.values(results).every(r => r.under100ms);
    console.log(`\nPerformance target (< 100ms): ${allUnder100 ? 'ACHIEVED' : 'NOT ACHIEVED'}`);
    
    return results;
}

// Cached validation for repeated position checks
const positionValidationCache = new Map();

function isPositionValidCached(position, gameBoard, players, cacheKey) {
    const key = cacheKey || `${position.row},${position.col}`;
    
    if (positionValidationCache.has(key)) {
        return positionValidationCache.get(key);
    }
    
    const result = {
        occupied: isPositionOccupied(position, gameBoard, players).occupied,
        collapsed: gameBoard ? isCardCollapsed(position, gameBoard).collapsed : false
    };
    
    // Cache for short duration (clear on game state change)
    positionValidationCache.set(key, result);
    
    // Auto-clear cache after 1000 entries to prevent memory issues
    if (positionValidationCache.size > 1000) {
        positionValidationCache.clear();
    }
    
    return result;
}

function clearValidationCache() {
    positionValidationCache.clear();
    console.log('Validation cache cleared');
}

console.log('Comprehensive validation (valid):', validateMoveEnding({row: 0, col: 0}, {row: 3, col: 3}, null, testPlayers, 'red'));
console.log('Comprehensive validation (invalid):', validateMoveEnding({row: 0, col: 0}, {row: 0, col: 0}, null, testPlayers, 'red'));

// Run performance benchmarks
console.log('\nRunning performance benchmarks:');
benchmarkValidationPerformance();