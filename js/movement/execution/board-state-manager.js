// Collapsi Game - Board State Management System
// Task 4.2: Update game board state after completed moves

// Update complete board state after a move
function updateBoardStateAfterMove(moveData) {
    console.log('Updating board state after move:', moveData);
    
    try {
        const { startingPosition, destinationPosition, path, playerId, cardType } = moveData;
        
        // Update player positions on the board
        const playerUpdateResult = updatePlayerPositionsOnBoard(startingPosition, destinationPosition, playerId);
        if (!playerUpdateResult.success) {
            return playerUpdateResult;
        }
        
        // Update card states (collapsed/occupied status)
        const cardUpdateResult = updateCardStatesAfterMove(startingPosition, destinationPosition, path, playerId);
        if (!cardUpdateResult.success) {
            return cardUpdateResult;
        }
        
        // Update game metadata
        const metadataResult = updateGameMetadataAfterMove(moveData);
        if (!metadataResult.success) {
            return metadataResult;
        }
        
        // Validate board state consistency
        const validationResult = validateBoardStateConsistency();
        if (!validationResult.valid) {
            console.warn('Board state inconsistency detected:', validationResult.issues);
        }
        
        console.log('Board state updated successfully after move');
        return {
            success: true,
            reason: 'Board state updated successfully',
            updates: {
                playerPositions: playerUpdateResult,
                cardStates: cardUpdateResult,
                metadata: metadataResult
            }
        };
        
    } catch (error) {
        console.error('Error updating board state:', error.message);
        return {
            success: false,
            reason: `Board state update error: ${error.message}`
        };
    }
}

// Update player positions on the board data structure
function updatePlayerPositionsOnBoard(startingPosition, destinationPosition, playerId) {
    console.log(`Updating player positions for ${playerId}`);
    
    try {
        // Remove player from starting position
        const startingCard = getCardAtPosition(startingPosition.row, startingPosition.col);
        if (startingCard) {
            startingCard.hasPlayer = false;
            startingCard.playerId = null;
            console.log(`Removed player from starting position (${startingPosition.row}, ${startingPosition.col})`);
        }
        
        // Add player to destination position
        const destinationCard = getCardAtPosition(destinationPosition.row, destinationPosition.col);
        if (destinationCard) {
            destinationCard.hasPlayer = true;
            destinationCard.playerId = playerId;
            console.log(`Added player to destination position (${destinationPosition.row}, ${destinationPosition.col})`);
        } else {
            return {
                success: false,
                reason: 'Destination card not found on board'
            };
        }
        
        return {
            success: true,
            reason: 'Player positions updated on board',
            startingPosition,
            destinationPosition,
            playerId
        };
        
    } catch (error) {
        console.error('Error updating player positions on board:', error.message);
        return {
            success: false,
            reason: `Player position update error: ${error.message}`
        };
    }
}

// Update card states after a move (collapsed status, occupation, etc.)
function updateCardStatesAfterMove(startingPosition, destinationPosition, path, playerId) {
    console.log('Updating card states after move');
    
    try {
        const updates = [];
        
        // Mark starting card as collapsed (it will be handled by card collapse function)
        // Here we just track that it needs to be collapsed
        updates.push({
            position: startingPosition,
            action: 'mark_for_collapse',
            reason: 'Starting card after move completion'
        });
        
        // Update destination card occupation
        const destinationCard = getCardAtPosition(destinationPosition.row, destinationPosition.col);
        if (destinationCard) {
            destinationCard.hasPlayer = true;
            destinationCard.playerId = playerId;
            updates.push({
                position: destinationPosition,
                action: 'set_occupied',
                playerId: playerId,
                reason: 'Player moved to this position'
            });
        }
        
        // Validate all path positions are not collapsed
        for (let i = 1; i < path.length - 1; i++) { // Skip start and end
            const pathPosition = path[i];
            const pathCard = getCardAtPosition(pathPosition.row, pathPosition.col);
            
            if (pathCard && pathCard.collapsed) {
                return {
                    success: false,
                    reason: `Path passes through collapsed card at (${pathPosition.row}, ${pathPosition.col})`
                };
            }
            
            updates.push({
                position: pathPosition,
                action: 'validate_not_collapsed',
                reason: 'Path validation'
            });
        }
        
        console.log('Card states updated:', updates);
        return {
            success: true,
            reason: 'Card states updated successfully',
            updates: updates
        };
        
    } catch (error) {
        console.error('Error updating card states:', error.message);
        return {
            success: false,
            reason: `Card state update error: ${error.message}`
        };
    }
}

// Update game metadata after a move
function updateGameMetadataAfterMove(moveData) {
    console.log('Updating game metadata after move');
    
    try {
        // Update move counter
        const moveCount = gameState.moveHistory.length;
        
        // Update last move timestamp
        gameState.lastMoveTimestamp = moveData.timestamp;
        
        // Update player move counts
        if (!gameState.playerMoveStats) {
            gameState.playerMoveStats = {};
        }
        
        if (!gameState.playerMoveStats[moveData.playerId]) {
            gameState.playerMoveStats[moveData.playerId] = {
                totalMoves: 0,
                totalDistance: 0,
                jokerMoves: 0,
                numberedCardMoves: 0
            };
        }
        
        const playerStats = gameState.playerMoveStats[moveData.playerId];
        playerStats.totalMoves++;
        playerStats.totalDistance += moveData.distance;
        
        if (moveData.cardType === 'red-joker' || moveData.cardType === 'black-joker') {
            playerStats.jokerMoves++;
        } else {
            playerStats.numberedCardMoves++;
        }
        
        // Update game progress tracking
        gameState.gameProgress = {
            totalMoves: moveCount,
            currentTurn: gameState.currentPlayer,
            lastMove: {
                playerId: moveData.playerId,
                distance: moveData.distance,
                cardType: moveData.cardType,
                timestamp: moveData.timestamp
            }
        };
        
        console.log('Game metadata updated:', {
            moveCount,
            playerStats: gameState.playerMoveStats,
            gameProgress: gameState.gameProgress
        });
        
        return {
            success: true,
            reason: 'Game metadata updated successfully',
            metadata: gameState.gameProgress
        };
        
    } catch (error) {
        console.error('Error updating game metadata:', error.message);
        return {
            success: false,
            reason: `Metadata update error: ${error.message}`
        };
    }
}

// Validate board state consistency after updates
function validateBoardStateConsistency() {
    console.log('Validating board state consistency');
    
    try {
        const issues = [];
        const playerPositions = {};
        
        // Check each board position
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const card = getCardAtPosition(row, col);
                
                if (!card) {
                    issues.push(`Missing card at position (${row}, ${col})`);
                    continue;
                }
                
                // Validate player position consistency
                if (card.hasPlayer && card.playerId) {
                    if (playerPositions[card.playerId]) {
                        issues.push(`Player ${card.playerId} found at multiple positions`);
                    } else {
                        playerPositions[card.playerId] = { row, col };
                    }
                    
                    // Check if player object position matches board position
                    const player = getPlayerById(card.playerId);
                    if (player) {
                        const playerPos = player.getPosition();
                        if (playerPos.row !== row || playerPos.col !== col) {
                            issues.push(`Player ${card.playerId} position mismatch: board(${row},${col}) vs player(${playerPos.row},${playerPos.col})`);
                        }
                    } else {
                        issues.push(`Player ${card.playerId} referenced on board but not found in player list`);
                    }
                }
                
                // Validate card properties
                if (card.hasPlayer && !card.playerId) {
                    issues.push(`Card at (${row}, ${col}) marked as having player but no playerId set`);
                }
                
                if (!card.hasPlayer && card.playerId) {
                    issues.push(`Card at (${row}, ${col}) has playerId but not marked as having player`);
                }
            }
        }
        
        // Check that all players are on the board
        if (gameState.players) {
            gameState.players.forEach(player => {
                if (player.isPlaced()) {
                    const pos = player.getPosition();
                    if (!playerPositions[player.id]) {
                        issues.push(`Player ${player.id} claims to be placed but not found on board`);
                    }
                }
            });
        }
        
        const isValid = issues.length === 0;
        
        if (isValid) {
            console.log('Board state consistency validation passed');
        } else {
            console.warn('Board state consistency issues found:', issues);
        }
        
        return {
            valid: isValid,
            issues: issues,
            playerPositions: playerPositions
        };
        
    } catch (error) {
        console.error('Error validating board state consistency:', error.message);
        return {
            valid: false,
            issues: [`Validation error: ${error.message}`]
        };
    }
}

// Get complete board state snapshot
function getBoardStateSnapshot() {
    console.log('Creating board state snapshot');
    
    try {
        const snapshot = {
            timestamp: new Date().toISOString(),
            gameStatus: gameState.gameStatus,
            currentPlayer: gameState.currentPlayer,
            board: [],
            players: [],
            metadata: {
                moveCount: gameState.moveHistory.length,
                gameProgress: gameState.gameProgress,
                playerStats: gameState.playerMoveStats
            }
        };
        
        // Capture board state
        for (let row = 0; row < 4; row++) {
            snapshot.board[row] = [];
            for (let col = 0; col < 4; col++) {
                const card = getCardAtPosition(row, col);
                if (card) {
                    snapshot.board[row][col] = {
                        type: card.type,
                        position: { ...card.position },
                        collapsed: card.collapsed,
                        hasPlayer: card.hasPlayer,
                        playerId: card.playerId
                    };
                }
            }
        }
        
        // Capture player states
        if (gameState.players) {
            snapshot.players = gameState.players.map(player => ({
                id: player.id,
                color: player.color,
                startingCard: player.startingCard,
                position: player.getPosition(),
                isActive: player.isActive,
                isPlaced: player.isPlaced()
            }));
        }
        
        console.log('Board state snapshot created');
        return snapshot;
        
    } catch (error) {
        console.error('Error creating board state snapshot:', error.message);
        return null;
    }
}

// Restore board state from snapshot (for rollback/undo)
function restoreBoardStateFromSnapshot(snapshot) {
    console.log('Restoring board state from snapshot');
    
    try {
        if (!snapshot || !snapshot.board || !snapshot.players) {
            return {
                success: false,
                reason: 'Invalid snapshot data'
            };
        }
        
        // Restore board state
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const snapshotCard = snapshot.board[row][col];
                const currentCard = getCardAtPosition(row, col);
                
                if (currentCard && snapshotCard) {
                    currentCard.collapsed = snapshotCard.collapsed;
                    currentCard.hasPlayer = snapshotCard.hasPlayer;
                    currentCard.playerId = snapshotCard.playerId;
                }
            }
        }
        
        // Restore player positions
        snapshot.players.forEach(snapshotPlayer => {
            const player = getPlayerById(snapshotPlayer.id);
            if (player) {
                player.setPosition(snapshotPlayer.position.row, snapshotPlayer.position.col);
                player.isActive = snapshotPlayer.isActive;
            }
        });
        
        // Restore game state
        gameState.gameStatus = snapshot.gameStatus;
        gameState.currentPlayer = snapshot.currentPlayer;
        
        console.log('Board state restored from snapshot');
        return {
            success: true,
            reason: 'Board state restored successfully'
        };
        
    } catch (error) {
        console.error('Error restoring board state from snapshot:', error.message);
        return {
            success: false,
            reason: `Restore error: ${error.message}`
        };
    }
}

// Clear all player positions from board (for game reset)
function clearAllPlayerPositionsFromBoard() {
    console.log('Clearing all player positions from board');
    
    try {
        let clearedPositions = 0;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const card = getCardAtPosition(row, col);
                if (card && card.hasPlayer) {
                    card.hasPlayer = false;
                    card.playerId = null;
                    clearedPositions++;
                }
            }
        }
        
        console.log(`Cleared ${clearedPositions} player positions from board`);
        return {
            success: true,
            reason: `Cleared ${clearedPositions} player positions`,
            clearedCount: clearedPositions
        };
        
    } catch (error) {
        console.error('Error clearing player positions from board:', error.message);
        return {
            success: false,
            reason: `Clear error: ${error.message}`
        };
    }
}

console.log('Board state management system loaded');