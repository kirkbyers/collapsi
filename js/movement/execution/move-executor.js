// Collapsi Game - Move Execution System
// Task 4.1: Create immediate move execution on valid destination selection

// Main move execution function
function executeMoveToDestination(startingPosition, destinationPosition, path, cardType, gameBoard, players, currentPlayerId) {
    console.log('Executing move to destination:', {
        start: startingPosition,
        destination: destinationPosition,
        path: path,
        cardType: cardType,
        playerId: currentPlayerId
    });
    
    try {
        // Validate the complete move before execution
        const distance = path.length - 1;
        const validation = validateCompleteGameMove(
            startingPosition, 
            destinationPosition, 
            path, 
            distance, 
            cardType, 
            gameBoard, 
            players, 
            currentPlayerId
        );
        
        if (!validation.valid) {
            console.error('Move validation failed:', validation.reason);
            return {
                success: false,
                reason: validation.reason,
                type: validation.type || 'validation'
            };
        }
        
        // Execute the move
        const executionResult = performMoveExecution(startingPosition, destinationPosition, path, currentPlayerId);
        
        if (!executionResult.success) {
            console.error('Move execution failed:', executionResult.reason);
            return executionResult;
        }
        
        // Update game state after successful move
        const stateUpdateResult = updateGameStateAfterMove(startingPosition, destinationPosition, path, currentPlayerId);
        
        if (!stateUpdateResult.success) {
            console.error('Game state update failed:', stateUpdateResult.reason);
            // Attempt to rollback the move
            rollbackMove(startingPosition, destinationPosition, currentPlayerId);
            return stateUpdateResult;
        }
        
        console.log('Move executed successfully');
        return {
            success: true,
            reason: 'Move completed successfully',
            moveData: {
                startingPosition,
                destinationPosition,
                path,
                distance,
                cardType,
                playerId: currentPlayerId,
                timestamp: new Date().toISOString()
            }
        };
        
    } catch (error) {
        console.error('Error executing move:', error.message);
        return {
            success: false,
            reason: `Execution error: ${error.message}`,
            type: 'error'
        };
    }
}

// Perform the actual move execution (update player position)
function performMoveExecution(startingPosition, destinationPosition, path, currentPlayerId) {
    console.log(`Performing move execution for player ${currentPlayerId}`);
    
    try {
        // Get current player
        const player = getPlayerById(currentPlayerId);
        if (!player) {
            return {
                success: false,
                reason: `Player ${currentPlayerId} not found`
            };
        }
        
        // Verify current position matches starting position
        const currentPosition = player.getPosition();
        if (currentPosition.row !== startingPosition.row || currentPosition.col !== startingPosition.col) {
            return {
                success: false,
                reason: 'Player position does not match starting position'
            };
        }
        
        // Remove player from current position on board
        const removeResult = updatePlayerOnBoard(startingPosition.row, startingPosition.col, currentPlayerId, false);
        if (!removeResult) {
            return {
                success: false,
                reason: 'Failed to remove player from starting position'
            };
        }
        
        // Move player to destination position
        const moveResult = movePlayerPawn(currentPlayerId, destinationPosition.row, destinationPosition.col);
        if (!moveResult) {
            // Rollback: restore player to starting position
            updatePlayerOnBoard(startingPosition.row, startingPosition.col, currentPlayerId, true);
            return {
                success: false,
                reason: 'Failed to move player to destination'
            };
        }
        
        console.log(`Player ${currentPlayerId} moved from (${startingPosition.row},${startingPosition.col}) to (${destinationPosition.row},${destinationPosition.col})`);
        return {
            success: true,
            reason: 'Player position updated successfully'
        };
        
    } catch (error) {
        console.error('Error in move execution:', error.message);
        return {
            success: false,
            reason: `Move execution error: ${error.message}`
        };
    }
}

// Update game state after successful move
function updateGameStateAfterMove(startingPosition, destinationPosition, path, currentPlayerId) {
    console.log('Updating game state after move');
    
    try {
        // Add move to history
        const moveRecord = {
            playerId: currentPlayerId,
            startingPosition: startingPosition,
            destinationPosition: destinationPosition,
            path: path,
            distance: path.length - 1,
            timestamp: new Date().toISOString()
        };
        
        addMoveToHistory(moveRecord);
        
        // Clear current move path
        gameState.currentMovePath = [];
        
        // Reset joker movement state if it was a joker move
        if (gameState.jokerMoveState && gameState.jokerMoveState.playerId === currentPlayerId) {
            gameState.jokerMoveState = null;
        }
        
        console.log('Game state updated after move');
        return {
            success: true,
            reason: 'Game state updated successfully'
        };
        
    } catch (error) {
        console.error('Error updating game state:', error.message);
        return {
            success: false,
            reason: `Game state update error: ${error.message}`
        };
    }
}

// Rollback a move (in case of errors)
function rollbackMove(startingPosition, destinationPosition, currentPlayerId) {
    console.log(`Rolling back move for player ${currentPlayerId}`);
    
    try {
        // Remove player from destination
        updatePlayerOnBoard(destinationPosition.row, destinationPosition.col, currentPlayerId, false);
        
        // Restore player to starting position
        const player = getPlayerById(currentPlayerId);
        if (player) {
            player.setPosition(startingPosition.row, startingPosition.col);
            updatePlayerOnBoard(startingPosition.row, startingPosition.col, currentPlayerId, true);
        }
        
        console.log('Move rollback completed');
        return true;
    } catch (error) {
        console.error('Error during move rollback:', error.message);
        return false;
    }
}

// Execute move based on UI click/touch interaction
function executeClickToMove(clickedRow, clickedCol) {
    console.log(`Processing click-to-move to position (${clickedRow}, ${clickedCol})`);
    
    try {
        // Get current player
        const currentPlayer = getCurrentPlayer();
        if (!currentPlayer) {
            console.error('No current player available');
            return {
                success: false,
                reason: 'No current player available'
            };
        }
        
        // Get current player position
        const startingPosition = currentPlayer.getPosition();
        if (!currentPlayer.isPlaced()) {
            console.error('Current player is not placed on board');
            return {
                success: false,
                reason: 'Current player is not placed on board'
            };
        }
        
        // Get starting card type
        const startingCard = getCardAtPosition(startingPosition.row, startingPosition.col);
        if (!startingCard) {
            console.error('Starting card not found');
            return {
                success: false,
                reason: 'Starting card not found'
            };
        }
        
        const destinationPosition = { row: clickedRow, col: clickedCol };
        
        // For now, we need to calculate the path
        // This is a simplified implementation - in a full implementation,
        // we'd use the path that was built during user interaction
        const path = calculateSimplePath(startingPosition, destinationPosition);
        
        if (!path || path.length < 2) {
            return {
                success: false,
                reason: 'Invalid path calculated'
            };
        }
        
        // Execute the move
        return executeMoveToDestination(
            startingPosition,
            destinationPosition,
            path,
            startingCard.type,
            gameState.board,
            gameState.players,
            currentPlayer.id
        );
        
    } catch (error) {
        console.error('Error in click-to-move execution:', error.message);
        return {
            success: false,
            reason: `Click-to-move error: ${error.message}`
        };
    }
}

// Calculate a simple path between two positions (temporary implementation)
function calculateSimplePath(startPos, endPos) {
    console.log('Calculating simple path from', startPos, 'to', endPos);
    
    try {
        const path = [startPos];
        let currentPos = { ...startPos };
        
        // Simple orthogonal pathfinding
        // Move horizontally first, then vertically
        while (currentPos.row !== endPos.row || currentPos.col !== endPos.col) {
            let nextPos = { ...currentPos };
            
            // Move horizontally
            if (currentPos.col !== endPos.col) {
                if (currentPos.col < endPos.col) {
                    nextPos.col = (currentPos.col + 1) % 4;
                } else {
                    nextPos.col = (currentPos.col - 1 + 4) % 4;
                }
            }
            // Move vertically if horizontal movement is done
            else if (currentPos.row !== endPos.row) {
                if (currentPos.row < endPos.row) {
                    nextPos.row = (currentPos.row + 1) % 4;
                } else {
                    nextPos.row = (currentPos.row - 1 + 4) % 4;
                }
            }
            
            path.push(nextPos);
            currentPos = nextPos;
            
            // Prevent infinite loops
            if (path.length > 10) {
                console.warn('Path calculation exceeded maximum length');
                break;
            }
        }
        
        console.log('Calculated path:', path);
        return path;
        
    } catch (error) {
        console.error('Error calculating path:', error.message);
        return null;
    }
}

// Check if a move execution is currently in progress
function isMoveExecutionInProgress() {
    return gameState.moveExecutionInProgress || false;
}

// Set move execution in progress flag
function setMoveExecutionInProgress(inProgress) {
    gameState.moveExecutionInProgress = inProgress;
    console.log(`Move execution in progress: ${inProgress}`);
}

// Execute move with UI feedback
function executeMoveWithFeedback(startingPosition, destinationPosition, path, cardType, currentPlayerId) {
    console.log('Executing move with UI feedback');
    
    // Set execution in progress
    setMoveExecutionInProgress(true);
    
    try {
        // Show loading/executing state
        showMoveExecutionFeedback(true);
        
        // Execute the move
        const result = executeMoveToDestination(
            startingPosition,
            destinationPosition,
            path,
            cardType,
            gameState.board,
            gameState.players,
            currentPlayerId
        );
        
        // Show result feedback
        if (result.success) {
            showMoveSuccessFeedback();
        } else {
            showMoveErrorFeedback(result.reason);
        }
        
        return result;
        
    } finally {
        // Clear execution in progress
        setMoveExecutionInProgress(false);
        
        // Hide loading feedback
        setTimeout(() => {
            showMoveExecutionFeedback(false);
        }, 500);
    }
}

// Show move execution feedback in UI
function showMoveExecutionFeedback(show) {
    try {
        // This would integrate with the UI system
        // For now, just log the feedback
        if (show) {
            console.log('🔄 Executing move...');
        } else {
            console.log('✅ Move execution completed');
        }
    } catch (error) {
        console.error('Error showing move execution feedback:', error.message);
    }
}

// Show move success feedback
function showMoveSuccessFeedback() {
    try {
        console.log('✅ Move executed successfully!');
        // This would integrate with UI notifications
    } catch (error) {
        console.error('Error showing success feedback:', error.message);
    }
}

// Show move error feedback
function showMoveErrorFeedback(reason) {
    try {
        console.log('❌ Move execution failed:', reason);
        // This would integrate with UI error notifications
    } catch (error) {
        console.error('Error showing error feedback:', error.message);
    }
}

console.log('Move execution system loaded');