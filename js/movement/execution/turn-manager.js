// Collapsi Game - Turn Management System
// Task 4.4: Add automatic turn switching after successful move execution

// Main function to handle turn switching after move completion
function switchTurnAfterMoveCompletion(moveData) {
    console.log('Processing turn switch after move completion:', moveData.playerId);
    
    try {
        // Validate that the move was completed successfully
        const moveValidation = validateMoveCompletionForTurnSwitch(moveData);
        if (!moveValidation.valid) {
            return {
                success: false,
                reason: moveValidation.reason
            };
        }
        
        // Check if game has ended before switching turns
        const gameEndCheck = checkGameEndBeforeTurnSwitch();
        if (gameEndCheck.gameEnded) {
            console.log('Game ended, no turn switch needed:', gameEndCheck.winner);
            return {
                success: true,
                reason: 'Game ended, turn switch not needed',
                gameEnded: true,
                winner: gameEndCheck.winner
            };
        }
        
        // Perform the turn switch
        const switchResult = performTurnSwitch(moveData);
        if (!switchResult.success) {
            return switchResult;
        }
        
        // Update UI to reflect new current player
        const uiUpdateResult = updateTurnSwitchUI(switchResult.newCurrentPlayer);
        if (!uiUpdateResult.success) {
            console.warn('UI update failed but turn switch succeeded:', uiUpdateResult.reason);
        }
        
        // Check if new current player has valid moves
        const validMovesCheck = checkNewPlayerValidMoves(switchResult.newCurrentPlayer);
        if (!validMovesCheck.hasValidMoves) {
            console.log('New current player has no valid moves, game ends');
            return handleGameEndAfterTurnSwitch(switchResult.previousPlayer);
        }
        
        console.log(`Turn switched from ${moveData.playerId} to ${switchResult.newCurrentPlayer.id}`);
        return {
            success: true,
            reason: 'Turn switched successfully',
            previousPlayer: moveData.playerId,
            newCurrentPlayer: switchResult.newCurrentPlayer.id,
            turnNumber: gameState.moveHistory.length
        };
        
    } catch (error) {
        console.error('Error switching turn after move:', error.message);
        return {
            success: false,
            reason: `Turn switch error: ${error.message}`
        };
    }
}

// Validate that move was completed successfully for turn switching
function validateMoveCompletionForTurnSwitch(moveData) {
    console.log('Validating move completion for turn switch');
    
    try {
        // Check that move data is complete
        if (!moveData || !moveData.playerId || !moveData.startingPosition || !moveData.destinationPosition) {
            return {
                valid: false,
                reason: 'Incomplete move data provided'
            };
        }
        
        // Check that player actually moved to a different position
        const startPos = moveData.startingPosition;
        const endPos = moveData.destinationPosition;
        
        if (startPos.row === endPos.row && startPos.col === endPos.col) {
            return {
                valid: false,
                reason: 'Player did not move to a different position'
            };
        }
        
        // Check that move was added to history
        const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
        if (!lastMove || lastMove.playerId !== moveData.playerId) {
            return {
                valid: false,
                reason: 'Move not properly recorded in history'
            };
        }
        
        // Check that starting card was collapsed
        const startingCard = getCardAtPosition(startPos.row, startPos.col);
        if (!startingCard || !startingCard.collapsed) {
            return {
                valid: false,
                reason: 'Starting card was not collapsed after move'
            };
        }
        
        return {
            valid: true,
            reason: 'Move completion validated for turn switch'
        };
        
    } catch (error) {
        console.error('Error validating move completion:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Check if game has ended before switching turns
function checkGameEndBeforeTurnSwitch() {
    console.log('Checking if game has ended before turn switch');
    
    try {
        // Check if we already have a winner
        if (gameState.winner) {
            return {
                gameEnded: true,
                winner: gameState.winner,
                reason: 'Game already has a winner'
            };
        }
        
        // Check if game status indicates it's ended
        if (gameState.gameStatus === 'ended') {
            return {
                gameEnded: true,
                winner: gameState.winner,
                reason: 'Game status indicates game has ended'
            };
        }
        
        return {
            gameEnded: false,
            reason: 'Game is still active'
        };
        
    } catch (error) {
        console.error('Error checking game end:', error.message);
        return {
            gameEnded: false,
            reason: 'Unable to determine game status'
        };
    }
}

// Perform the actual turn switch
function performTurnSwitch(moveData) {
    console.log(`Performing turn switch from player ${gameState.currentPlayer}`);
    
    try {
        const previousPlayerIndex = gameState.currentPlayer;
        const previousPlayer = gameState.players[previousPlayerIndex];
        
        if (!previousPlayer) {
            return {
                success: false,
                reason: 'Previous player not found'
            };
        }
        
        // Switch to next player
        gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
        const newCurrentPlayer = gameState.players[gameState.currentPlayer];
        
        if (!newCurrentPlayer) {
            // Rollback the switch
            gameState.currentPlayer = previousPlayerIndex;
            return {
                success: false,
                reason: 'New current player not found'
            };
        }
        
        // Clear movement state for the new turn
        gameState.currentMovePath = [];
        gameState.jokerMoveState = null;
        
        // Update turn metadata
        updateTurnMetadata(previousPlayer, newCurrentPlayer, moveData);
        
        console.log(`Turn switched: ${previousPlayer.id} -> ${newCurrentPlayer.id}`);
        return {
            success: true,
            reason: 'Turn switched successfully',
            previousPlayer: previousPlayer,
            newCurrentPlayer: newCurrentPlayer,
            turnIndex: gameState.currentPlayer
        };
        
    } catch (error) {
        console.error('Error performing turn switch:', error.message);
        return {
            success: false,
            reason: `Turn switch operation error: ${error.message}`
        };
    }
}

// Update turn metadata after switch
function updateTurnMetadata(previousPlayer, newCurrentPlayer, moveData) {
    console.log('Updating turn metadata');
    
    try {
        // Initialize turn tracking if not exists
        if (!gameState.turnHistory) {
            gameState.turnHistory = [];
        }
        
        // Record the completed turn
        gameState.turnHistory.push({
            playerId: previousPlayer.id,
            turnNumber: gameState.moveHistory.length,
            startTime: gameState.currentTurnStartTime || new Date().toISOString(),
            endTime: new Date().toISOString(),
            moveData: moveData,
            collapsedCards: getCollapsedCardCount()
        });
        
        // Set start time for new turn
        gameState.currentTurnStartTime = new Date().toISOString();
        
        // Update player turn counts
        if (!gameState.playerTurnStats) {
            gameState.playerTurnStats = {};
        }
        
        if (!gameState.playerTurnStats[previousPlayer.id]) {
            gameState.playerTurnStats[previousPlayer.id] = {
                totalTurns: 0,
                totalMoveDistance: 0,
                averageTurnTime: 0
            };
        }
        
        const playerStats = gameState.playerTurnStats[previousPlayer.id];
        playerStats.totalTurns++;
        playerStats.totalMoveDistance += moveData.distance || 0;
        
        // Calculate average turn time
        const lastTurn = gameState.turnHistory[gameState.turnHistory.length - 1];
        const turnDuration = new Date(lastTurn.endTime) - new Date(lastTurn.startTime);
        playerStats.averageTurnTime = (playerStats.averageTurnTime * (playerStats.totalTurns - 1) + turnDuration) / playerStats.totalTurns;
        
        console.log('Turn metadata updated');
        
    } catch (error) {
        console.error('Error updating turn metadata:', error.message);
    }
}

// Update UI to reflect turn switch
function updateTurnSwitchUI(newCurrentPlayer) {
    console.log(`Updating UI for turn switch to ${newCurrentPlayer.id}`);
    
    try {
        // Update current player indicator
        const result = highlightCurrentPlayerPawn();
        if (!result) {
            return {
                success: false,
                reason: 'Failed to highlight current player pawn'
            };
        }
        
        // Update turn indicator in UI
        updateTurnIndicatorUI(newCurrentPlayer);
        
        // Clear any path highlighting from previous turn
        clearPathHighlighting();
        
        // Update game status display
        updateGameStatusDisplay();
        
        console.log('Turn switch UI updated');
        return {
            success: true,
            reason: 'UI updated successfully for turn switch'
        };
        
    } catch (error) {
        console.error('Error updating turn switch UI:', error.message);
        return {
            success: false,
            reason: `UI update error: ${error.message}`
        };
    }
}

// Update turn indicator in UI
function updateTurnIndicatorUI(currentPlayer) {
    console.log(`Updating turn indicator for ${currentPlayer.id}`);
    
    try {
        // Find turn indicator elements
        const turnIndicators = document.querySelectorAll('.turn-indicator, .current-player-indicator');
        
        turnIndicators.forEach(indicator => {
            indicator.textContent = `Current Player: ${currentPlayer.color.charAt(0).toUpperCase() + currentPlayer.color.slice(1)}`;
            indicator.className = `turn-indicator current-player-${currentPlayer.color}`;
        });
        
        // Update player status elements
        const playerElements = document.querySelectorAll('.player-status');
        playerElements.forEach(element => {
            const playerId = element.dataset.playerId;
            if (playerId === currentPlayer.id) {
                element.classList.add('active-player');
                element.classList.remove('inactive-player');
            } else {
                element.classList.add('inactive-player');
                element.classList.remove('active-player');
            }
        });
        
        console.log('Turn indicator UI updated');
        
    } catch (error) {
        console.error('Error updating turn indicator UI:', error.message);
    }
}

// Update game status display
function updateGameStatusDisplay() {
    console.log('Updating game status display');
    
    try {
        const gameStatus = getGameStatus();
        const statusElements = document.querySelectorAll('.game-status, .game-info');
        
        statusElements.forEach(element => {
            if (element.querySelector('.move-count')) {
                element.querySelector('.move-count').textContent = `Moves: ${gameStatus.moveCount}`;
            }
            
            if (element.querySelector('.collapsed-cards')) {
                element.querySelector('.collapsed-cards').textContent = `Collapsed: ${getCollapsedCardCount()}`;
            }
            
            if (element.querySelector('.game-state')) {
                element.querySelector('.game-state').textContent = `Status: ${gameStatus.status}`;
            }
        });
        
        console.log('Game status display updated');
        
    } catch (error) {
        console.error('Error updating game status display:', error.message);
    }
}

// Check if new current player has valid moves
function checkNewPlayerValidMoves(newCurrentPlayer) {
    console.log(`Checking valid moves for new current player: ${newCurrentPlayer.id}`);
    
    try {
        // Get player's current position
        if (!newCurrentPlayer.isPlaced()) {
            return {
                hasValidMoves: false,
                reason: 'Player is not placed on board'
            };
        }
        
        const playerPosition = newCurrentPlayer.getPosition();
        const startingCard = getCardAtPosition(playerPosition.row, playerPosition.col);
        
        if (!startingCard) {
            return {
                hasValidMoves: false,
                reason: 'Starting card not found'
            };
        }
        
        if (startingCard.collapsed) {
            return {
                hasValidMoves: false,
                reason: 'Player is on a collapsed card'
            };
        }
        
        // For now, return true - full implementation would check all possible moves
        // This would integrate with the movement validation system
        return {
            hasValidMoves: true,
            reason: 'Player has potential valid moves',
            startingCardType: startingCard.type,
            playerPosition: playerPosition
        };
        
    } catch (error) {
        console.error('Error checking valid moves:', error.message);
        return {
            hasValidMoves: true, // Default to true to prevent premature game end
            reason: 'Unable to check valid moves'
        };
    }
}

// Handle game end after turn switch (when new player has no moves)
function handleGameEndAfterTurnSwitch(winningPlayer) {
    console.log(`Handling game end after turn switch, winner: ${winningPlayer.id}`);
    
    try {
        // Set game status to ended
        gameState.gameStatus = 'ended';
        gameState.winner = winningPlayer.id;
        gameState.gameEndTimestamp = new Date().toISOString();
        gameState.gameEndReason = 'No valid moves for next player';
        
        // Record final game statistics
        recordFinalGameStatistics();
        
        // Update UI for game end
        updateGameEndUI(winningPlayer);
        
        console.log(`Game ended, winner: ${winningPlayer.id}`);
        return {
            success: true,
            reason: 'Game ended successfully',
            gameEnded: true,
            winner: winningPlayer.id,
            endReason: gameState.gameEndReason
        };
        
    } catch (error) {
        console.error('Error handling game end after turn switch:', error.message);
        return {
            success: false,
            reason: `Game end handling error: ${error.message}`
        };
    }
}

// Record final game statistics
function recordFinalGameStatistics() {
    console.log('Recording final game statistics');
    
    try {
        gameState.finalStatistics = {
            totalMoves: gameState.moveHistory.length,
            totalTurns: gameState.turnHistory ? gameState.turnHistory.length : 0,
            collapsedCards: getCollapsedCardCount(),
            gameDuration: gameState.gameEndTimestamp && gameState.gameStartTimestamp ? 
                new Date(gameState.gameEndTimestamp) - new Date(gameState.gameStartTimestamp) : null,
            winner: gameState.winner,
            playerStats: gameState.playerTurnStats,
            collapseStats: getCollapseStatistics()
        };
        
        console.log('Final game statistics:', gameState.finalStatistics);
        
    } catch (error) {
        console.error('Error recording final statistics:', error.message);
    }
}

// Update UI for game end
function updateGameEndUI(winningPlayer) {
    console.log(`Updating UI for game end, winner: ${winningPlayer.id}`);
    
    try {
        // Show game end message
        const gameEndElements = document.querySelectorAll('.game-end-message, .winner-display');
        gameEndElements.forEach(element => {
            element.textContent = `Game Over! Winner: ${winningPlayer.color.charAt(0).toUpperCase() + winningPlayer.color.slice(1)}`;
            element.classList.add('visible', `winner-${winningPlayer.color}`);
        });
        
        // Disable further interactions
        const gameBoard = document.getElementById('game-board');
        if (gameBoard) {
            gameBoard.classList.add('game-ended');
        }
        
        // Clear current player highlighting
        clearPawnHighlights();
        
        console.log('Game end UI updated');
        
    } catch (error) {
        console.error('Error updating game end UI:', error.message);
    }
}

// Get turn statistics
function getTurnStatistics() {
    console.log('Getting turn statistics');
    
    try {
        return {
            currentPlayer: gameState.currentPlayer,
            totalTurns: gameState.turnHistory ? gameState.turnHistory.length : 0,
            playerTurnStats: gameState.playerTurnStats || {},
            currentTurnStartTime: gameState.currentTurnStartTime,
            turnHistory: gameState.turnHistory || []
        };
        
    } catch (error) {
        console.error('Error getting turn statistics:', error.message);
        return {
            currentPlayer: -1,
            totalTurns: 0,
            playerTurnStats: {},
            currentTurnStartTime: null,
            turnHistory: []
        };
    }
}

console.log('Turn management system loaded');