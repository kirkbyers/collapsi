// Collapsi Game - Board Management and Validation
// Handles board creation, conversion, and validation logic

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

// Get card at specific position
function getCardAtPosition(row, col) {
    try {
        if (!gameState.board || !gameState.board[row] || !gameState.board[row][col]) {
            return null;
        }
        return gameState.board[row][col];
    } catch (error) {
        console.error('Error getting card at position:', error.message);
        return null;
    }
}

// Mark card as collapsed (face-down)
function collapseCard(row, col) {
    try {
        const card = getCardAtPosition(row, col);
        if (card) {
            card.collapsed = true;
            console.log(`Card at (${row},${col}) collapsed`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error collapsing card:', error.message);
        return false;
    }
}

// Check if card is collapsed
function isCardCollapsedAtPosition(row, col) {
    const card = getCardAtPosition(row, col);
    return card ? card.collapsed : false;
}

// Update player occupation on board
function updatePlayerOnBoard(row, col, playerId, occupied = true) {
    try {
        const card = getCardAtPosition(row, col);
        if (card) {
            card.hasPlayer = occupied;
            card.playerId = occupied ? playerId : null;
            console.log(`Board position (${row},${col}) ${occupied ? 'occupied by' : 'vacated from'} player: ${playerId}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating player on board:', error.message);
        return false;
    }
}

// Render the board to DOM
function renderBoardToDOM(board) {
    console.log('Rendering board to DOM...');
    
    try {
        if (!board || board.length !== 4) {
            throw new Error('Invalid board structure');
        }
        
        const gameBoardElement = document.getElementById('game-board');
        if (!gameBoardElement) {
            throw new Error('Game board element not found');
        }
        
        // Clear existing board content
        gameBoardElement.innerHTML = '';
        
        // Create board grid
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const card = board[row][col];
                const cardElement = document.createElement('div');
                
                cardElement.className = 'card';
                cardElement.dataset.row = row;
                cardElement.dataset.col = col;
                cardElement.dataset.type = card.type;
                
                // Add card type class for styling
                if (card.type === 'red-joker') {
                    cardElement.classList.add('red-joker');
                } else if (card.type === 'black-joker') {
                    cardElement.classList.add('black-joker');
                } else {
                    cardElement.classList.add(`card-${card.type.toLowerCase()}`);
                }
                
                // Add collapsed class if card is collapsed
                if (card.collapsed) {
                    cardElement.classList.add('collapsed');
                }
                
                // Set card content with proper display
                const cardText = document.createElement('span');
                cardText.className = 'card-text';
                
                if (card.type === 'red-joker') {
                    cardText.textContent = '🃏'; // Red joker emoji
                } else if (card.type === 'black-joker') {
                    cardText.textContent = '🃏'; // Black joker emoji (same as red, styling will differentiate)
                } else {
                    cardText.textContent = card.type;
                }
                
                cardElement.appendChild(cardText);
                
                // Add player pawn if present
                if (card.hasPlayer && card.playerId) {
                    const pawnElement = document.createElement('div');
                    pawnElement.className = `player-pawn ${card.playerId}`;
                    pawnElement.textContent = '●'; // Player marker
                    cardElement.appendChild(pawnElement);
                }
                
                gameBoardElement.appendChild(cardElement);
            }
        }
        
        console.log('Board rendered successfully');
        return true;
    } catch (error) {
        console.error('Error rendering board to DOM:', error.message);
        return false;
    }
}