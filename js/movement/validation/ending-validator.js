// Collapsi Game - Ending Validation
// Validation for move ending positions and occupation rules

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