// Collapsi Game - Utility Functions and Helpers
// Shared utilities across the game

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

// Utility functions for board position validation
function isValidPosition(row, col) {
    return row >= 0 && row < 4 && col >= 0 && col < 4;
}

// Check if a card exists at the given position
function cardExistsAt(row, col) {
    if (!isValidPosition(row, col)) {
        return false;
    }
    
    if (!gameState || !gameState.board || !gameState.board[row] || !gameState.board[row][col]) {
        return false;
    }
    
    return true;
}

// Update the visual display of a card
function updateCardDisplay(row, col, card) {
    const cardElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!cardElement) {
        console.error(`Card element not found at (${row}, ${col})`);
        return false;
    }
    
    // Update collapsed state
    if (card.collapsed) {
        cardElement.classList.add('collapsed');
    } else {
        cardElement.classList.remove('collapsed');
    }
    
    // Update player pawn display
    const existingPawn = cardElement.querySelector('.player-pawn');
    
    if (card.hasPlayer && card.playerId) {
        // Add or update player pawn
        if (!existingPawn) {
            const pawnElement = document.createElement('div');
            pawnElement.className = `player-pawn ${card.playerId}`;
            pawnElement.textContent = '●';
            cardElement.appendChild(pawnElement);
        } else {
            // Update existing pawn
            existingPawn.className = `player-pawn ${card.playerId}`;
        }
        
        // Add player class to card for styling
        cardElement.classList.add('has-player', `player-${card.playerId}`);
    } else {
        // Remove player pawn
        if (existingPawn) {
            existingPawn.remove();
        }
        
        // Remove player classes
        cardElement.classList.remove('has-player', 'player-red', 'player-blue');
    }
    
    return true;
}

console.log('Utility functions loaded');