// Collapsi Game - Player Management and Positioning System

// Player class definition with position tracking and properties
class Player {
    constructor(id, color, startingCard) {
        this.id = id;
        this.color = color;
        this.startingCard = startingCard;
        this.position = { row: -1, col: -1 }; // Initialize as not placed
        this.isActive = true;
    }
    
    // Set player position
    setPosition(row, col) {
        if (typeof row !== 'number' || typeof col !== 'number') {
            console.error('Position coordinates must be numbers');
            return false;
        }
        
        if (row < 0 || row >= 4 || col < 0 || col >= 4) {
            console.error(`Position out of bounds: (${row}, ${col})`);
            return false;
        }
        
        this.position = { row, col };
        console.log(`Player ${this.id} moved to position (${row}, ${col})`);
        return true;
    }
    
    // Get current position
    getPosition() {
        return { ...this.position };
    }
    
    // Check if player is placed on the board
    isPlaced() {
        return this.position.row >= 0 && this.position.col >= 0;
    }
    
    // Get player info for debugging
    getInfo() {
        return {
            id: this.id,
            color: this.color,
            startingCard: this.startingCard,
            position: this.position,
            isActive: this.isActive,
            isPlaced: this.isPlaced()
        };
    }
}

// Function to create player objects for the game
function createPlayers() {
    console.log('Creating player objects...');
    
    const players = [
        new Player('red', 'red', 'red-joker'),
        new Player('blue', 'blue', 'black-joker')
    ];
    
    console.log('Players created:', players.map(p => p.getInfo()));
    return players;
}

// Function to get player by ID
function getPlayerById(playerId) {
    if (!gameState || !gameState.players) {
        console.error('Game state or players not initialized');
        return null;
    }
    
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
        console.error(`Player with ID '${playerId}' not found`);
        return null;
    }
    
    return player;
}

// Function to get current active player
function getCurrentPlayer() {
    if (!gameState || !gameState.players || typeof gameState.currentPlayer !== 'number') {
        console.error('Game state not properly initialized');
        return null;
    }
    
    if (gameState.currentPlayer < 0 || gameState.currentPlayer >= gameState.players.length) {
        console.error('Current player index out of bounds');
        return null;
    }
    
    return gameState.players[gameState.currentPlayer];
}

// Function to switch to the next player
function switchToNextPlayer() {
    if (!gameState || !gameState.players) {
        console.error('Game state not initialized');
        return false;
    }
    
    const previousPlayer = gameState.currentPlayer;
    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
    
    console.log(`Switched from player ${previousPlayer} to player ${gameState.currentPlayer}`);
    console.log('Current player:', getCurrentPlayer()?.getInfo());
    
    return true;
}

// Function to get all player positions
function getAllPlayerPositions() {
    if (!gameState || !gameState.players) {
        console.error('Game state not initialized');
        return [];
    }
    
    return gameState.players.map(player => ({
        id: player.id,
        color: player.color,
        position: player.getPosition(),
        isPlaced: player.isPlaced()
    }));
}

// Function to find joker card positions on the board
function findJokerPositions(board) {
    const jokerPositions = {};
    
    if (!board || board.length !== 4) {
        console.error('Invalid board for finding joker positions');
        return jokerPositions;
    }
    
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (board[row][col]) {
                const cardType = board[row][col].type;
                if (cardType === 'red-joker' || cardType === 'black-joker') {
                    jokerPositions[cardType] = { row, col };
                    console.log(`Found ${cardType} at position (${row}, ${col})`);
                }
            }
        }
    }
    
    return jokerPositions;
}

// Function to automatically place players on their respective joker cards
function placePlayersOnJokers() {
    console.log('Placing players on their starting joker cards...');
    
    if (!gameState || !gameState.board || !gameState.players) {
        console.error('Game state not properly initialized for player placement');
        return false;
    }
    
    // Find joker positions on the current board
    const jokerPositions = findJokerPositions(gameState.board);
    
    if (!jokerPositions['red-joker'] || !jokerPositions['black-joker']) {
        console.error('Could not find both joker cards on the board');
        return false;
    }
    
    let playersPlaced = 0;
    
    // Place each player on their starting joker
    gameState.players.forEach(player => {
        const jokerPosition = jokerPositions[player.startingCard];
        
        if (jokerPosition) {
            // Set player position
            player.setPosition(jokerPosition.row, jokerPosition.col);
            
            // Update the board card to show the player
            const card = gameState.board[jokerPosition.row][jokerPosition.col];
            card.hasPlayer = true;
            card.playerId = player.id;
            
            console.log(`Placed ${player.id} player on ${player.startingCard} at (${jokerPosition.row}, ${jokerPosition.col})`);
            playersPlaced++;
        } else {
            console.error(`Could not find starting card ${player.startingCard} for player ${player.id}`);
        }
    });
    
    if (playersPlaced === gameState.players.length) {
        console.log('All players successfully placed on their starting jokers');
        return true;
    } else {
        console.error(`Only ${playersPlaced} out of ${gameState.players.length} players were placed`);
        return false;
    }
}

// Function to remove all players from the board (for game reset)
function removeAllPlayersFromBoard() {
    console.log('Removing all players from board...');
    
    if (!gameState || !gameState.board || !gameState.players) {
        console.error('Game state not initialized');
        return false;
    }
    
    // Clear player positions
    gameState.players.forEach(player => {
        player.position = { row: -1, col: -1 };
    });
    
    // Clear board player references
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (gameState.board[row][col]) {
                gameState.board[row][col].hasPlayer = false;
                gameState.board[row][col].playerId = null;
            }
        }
    }
    
    console.log('All players removed from board');
    return true;
}

// Function to check if a position has a player
function hasPlayerAt(row, col) {
    if (!isValidPosition(row, col)) {
        return false;
    }
    
    if (!gameState || !gameState.board || !cardExistsAt(row, col)) {
        return false;
    }
    
    return gameState.board[row][col].hasPlayer;
}

// Function to get player at specific position
function getPlayerAt(row, col) {
    if (!hasPlayerAt(row, col)) {
        return null;
    }
    
    const playerId = gameState.board[row][col].playerId;
    return getPlayerById(playerId);
}

// Function to identify which player starts on which joker card
function identifyPlayerJokerAssignments() {
    console.log('Identifying player-joker assignments...');
    
    const assignments = {
        'red-joker': null,
        'black-joker': null
    };
    
    if (!gameState || !gameState.players) {
        console.error('Game state or players not initialized');
        return assignments;
    }
    
    gameState.players.forEach(player => {
        if (player.startingCard === 'red-joker') {
            assignments['red-joker'] = {
                playerId: player.id,
                playerColor: player.color,
                startingCard: player.startingCard
            };
        } else if (player.startingCard === 'black-joker') {
            assignments['black-joker'] = {
                playerId: player.id,
                playerColor: player.color,
                startingCard: player.startingCard
            };
        }
    });
    
    console.log('Player-joker assignments:', assignments);
    return assignments;
}

// Function to verify player-joker assignments follow game rules
function verifyPlayerJokerAssignments() {
    console.log('Verifying player-joker assignments...');
    
    const assignments = identifyPlayerJokerAssignments();
    const errors = [];
    
    // Check that red player is on red joker
    if (!assignments['red-joker'] || assignments['red-joker'].playerColor !== 'red') {
        errors.push('Red player must start on red-joker card');
    }
    
    // Check that blue player is on black joker
    if (!assignments['black-joker'] || assignments['black-joker'].playerColor !== 'blue') {
        errors.push('Blue player must start on black-joker card');
    }
    
    // Check that both jokers have assigned players
    if (!assignments['red-joker']) {
        errors.push('No player assigned to red-joker');
    }
    
    if (!assignments['black-joker']) {
        errors.push('No player assigned to black-joker');
    }
    
    if (errors.length > 0) {
        console.error('Player-joker assignment errors:', errors);
        return { valid: false, errors };
    }
    
    console.log('Player-joker assignments are valid');
    return { valid: true, assignments };
}

// Function to get the player assigned to a specific joker card
function getPlayerByJoker(jokerType) {
    if (jokerType !== 'red-joker' && jokerType !== 'black-joker') {
        console.error('Invalid joker type:', jokerType);
        return null;
    }
    
    if (!gameState || !gameState.players) {
        console.error('Game state not initialized');
        return null;
    }
    
    const player = gameState.players.find(p => p.startingCard === jokerType);
    if (!player) {
        console.error(`No player found for ${jokerType}`);
        return null;
    }
    
    console.log(`Player ${player.id} (${player.color}) is assigned to ${jokerType}`);
    return player;
}

// Function to get the joker card type for a specific player
function getJokerByPlayer(playerId) {
    const player = getPlayerById(playerId);
    if (!player) {
        console.error(`Player ${playerId} not found`);
        return null;
    }
    
    if (player.startingCard !== 'red-joker' && player.startingCard !== 'black-joker') {
        console.error(`Player ${playerId} does not have a valid starting joker card`);
        return null;
    }
    
    console.log(`Player ${playerId} starts on ${player.startingCard}`);
    return player.startingCard;
}

// Function to validate and setup correct player-joker assignments
function setupPlayerJokerAssignments() {
    console.log('Setting up player-joker assignments...');
    
    if (!gameState || !gameState.players) {
        console.error('Game state not initialized');
        return false;
    }
    
    let redPlayer = null;
    let bluePlayer = null;
    
    // Find red and blue players
    gameState.players.forEach(player => {
        if (player.color === 'red') {
            redPlayer = player;
        } else if (player.color === 'blue') {
            bluePlayer = player;
        }
    });
    
    if (!redPlayer || !bluePlayer) {
        console.error('Could not find both red and blue players');
        return false;
    }
    
    // Assign correct starting cards
    redPlayer.startingCard = 'red-joker';
    bluePlayer.startingCard = 'black-joker';
    
    console.log('Player-joker assignments set up correctly:');
    console.log(`${redPlayer.id} (${redPlayer.color}) -> ${redPlayer.startingCard}`);
    console.log(`${bluePlayer.id} (${bluePlayer.color}) -> ${bluePlayer.startingCard}`);
    
    return verifyPlayerJokerAssignments().valid;
}

// Function to render player pawns visually on the board
function renderPlayerPawns() {
    console.log('Rendering player pawns on board...');
    
    if (!gameState || !gameState.players) {
        console.error('Game state not initialized for pawn rendering');
        return false;
    }
    
    let pawnsRendered = 0;
    
    gameState.players.forEach(player => {
        if (player.isPlaced()) {
            const position = player.getPosition();
            
            // Update the board card to show the player pawn
            if (cardExistsAt(position.row, position.col)) {
                const card = gameState.board[position.row][position.col];
                card.hasPlayer = true;
                card.playerId = player.id;
                
                // Update the visual display
                updateCardDisplay(position.row, position.col, card);
                
                console.log(`Rendered ${player.color} pawn at (${position.row}, ${position.col})`);
                pawnsRendered++;
            }
        }
    });
    
    console.log(`${pawnsRendered} player pawns rendered`);
    return pawnsRendered === gameState.players.filter(p => p.isPlaced()).length;
}

// Function to move a player pawn to a new position
function movePlayerPawn(playerId, newRow, newCol) {
    console.log(`Moving ${playerId} pawn to (${newRow}, ${newCol})`);
    
    const player = getPlayerById(playerId);
    if (!player) {
        console.error(`Player ${playerId} not found`);
        return false;
    }
    
    if (!isValidPosition(newRow, newCol)) {
        console.error(`Invalid position for pawn move: (${newRow}, ${newCol})`);
        return false;
    }
    
    // Remove player from current position
    if (player.isPlaced()) {
        const oldPosition = player.getPosition();
        if (cardExistsAt(oldPosition.row, oldPosition.col)) {
            const oldCard = gameState.board[oldPosition.row][oldPosition.col];
            oldCard.hasPlayer = false;
            oldCard.playerId = null;
            updateCardDisplay(oldPosition.row, oldPosition.col, oldCard);
        }
    }
    
    // Place player at new position
    player.setPosition(newRow, newCol);
    
    if (cardExistsAt(newRow, newCol)) {
        const newCard = gameState.board[newRow][newCol];
        newCard.hasPlayer = true;
        newCard.playerId = playerId;
        updateCardDisplay(newRow, newCol, newCard);
    }
    
    console.log(`${playerId} pawn moved successfully`);
    return true;
}

// Function to remove player pawn from board visually
function removePlayerPawn(playerId) {
    console.log(`Removing ${playerId} pawn from board`);
    
    const player = getPlayerById(playerId);
    if (!player) {
        console.error(`Player ${playerId} not found`);
        return false;
    }
    
    if (!player.isPlaced()) {
        console.log(`Player ${playerId} is not placed on board`);
        return true;
    }
    
    const position = player.getPosition();
    
    // Remove from board card
    if (cardExistsAt(position.row, position.col)) {
        const card = gameState.board[position.row][position.col];
        card.hasPlayer = false;
        card.playerId = null;
        updateCardDisplay(position.row, position.col, card);
    }
    
    // Reset player position
    player.position = { row: -1, col: -1 };
    
    console.log(`${playerId} pawn removed successfully`);
    return true;
}

// Function to highlight current player's pawn
function highlightCurrentPlayerPawn() {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) {
        console.error('No current player to highlight');
        return false;
    }
    
    if (!currentPlayer.isPlaced()) {
        console.log('Current player is not placed on board');
        return false;
    }
    
    const position = currentPlayer.getPosition();
    const cardElement = document.querySelector(`[data-row="${position.row}"][data-col="${position.col}"]`);
    
    if (!cardElement) {
        console.error(`Card element not found for current player at (${position.row}, ${position.col})`);
        return false;
    }
    
    // Remove highlight from all cards first
    document.querySelectorAll('.card.current-player').forEach(card => {
        card.classList.remove('current-player');
    });
    
    // Add highlight to current player's card
    cardElement.classList.add('current-player');
    
    console.log(`Highlighted ${currentPlayer.id} pawn at (${position.row}, ${position.col})`);
    return true;
}

// Function to clear all pawn highlights
function clearPawnHighlights() {
    document.querySelectorAll('.card.current-player').forEach(card => {
        card.classList.remove('current-player');
    });
    console.log('Cleared all pawn highlights');
}

// Function to update all player pawn positions visually
function updateAllPlayerPawns() {
    console.log('Updating all player pawn positions...');
    
    // First clear all existing player references on cards
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (cardExistsAt(row, col)) {
                const card = gameState.board[row][col];
                card.hasPlayer = false;
                card.playerId = null;
            }
        }
    }
    
    // Then re-render all player pawns
    return renderPlayerPawns();
}

console.log('Player management functions loaded');