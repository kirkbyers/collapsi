// Collapsi Game - Joker State Management
// Core joker movement state and lifecycle management

// Helper function to get card at a position
function getCardAt(position) {
    if (!position || typeof position.row !== 'number' || typeof position.col !== 'number') {
        return null;
    }
    return getCardAtPosition(position.row, position.col);
}

// Initialize joker movement state for a player
function initializeJokerMovement(player, position) {
    try {
        if (!player || !position) {
            console.log('Cannot initialize joker movement: missing player or position');
            throw new Error('Player and position are required');
        }
        
        console.log(`Initializing joker movement for player ${player.id} at position ${JSON.stringify(position)}`);
        
        const startingCard = getCardAt(position);
        if (!startingCard || (startingCard.type !== 'red-joker' && startingCard.type !== 'black-joker')) {
            throw new Error('Player must be on a joker card to initialize joker movement');
        }
        
        const jokerState = {
            playerId: player.id,
            startingPosition: { ...position },
            currentPosition: { ...position },
            maxDistance: 4, // Jokers can move 1-4 spaces
            remainingDistance: 4, // How many more spaces can be moved
            movePath: [{ ...position }], // Path taken so far
            canEndTurn: true, // Jokers can end turn early
            isActive: true
        };
        
        // Store in game state
        gameState.jokerMoveState = jokerState;
        
        console.log('Joker movement initialized:', jokerState);
        return jokerState;
    } catch (error) {
        console.error('Error initializing joker movement:', error.message);
        return null;
    }
}

// Check if a position is valid for the next joker move step
function isValidJokerMoveStep(jokerState, targetPosition) {
    console.log(`Checking if position ${JSON.stringify(targetPosition)} is valid for joker move`);
    
    try {
        if (!jokerState || !jokerState.isActive) {
            return {
                valid: false,
                reason: 'No active joker movement state'
            };
        }
        
        if (jokerState.remainingDistance <= 0) {
            return {
                valid: false,
                reason: 'No remaining movement distance'
            };
        }
        
        // Check if target is adjacent to current position
        const adjacentCheck = isOrthogonalStep(jokerState.currentPosition, targetPosition);
        if (!adjacentCheck.valid) {
            return {
                valid: false,
                reason: 'Target position is not adjacent (orthogonal movement only)'
            };
        }
        
        // Check if target position has already been visited
        const visitedCheck = isValidNextPosition(jokerState.movePath, targetPosition);
        if (!visitedCheck.valid) {
            return {
                valid: false,
                reason: 'Target position already visited in this turn'
            };
        }
        
        // Check if target position is occupied or collapsed
        const occupiedCheck = isPositionOccupied(targetPosition, gameState.board, gameState.players);
        if (occupiedCheck.occupied) {
            return {
                valid: false,
                reason: `Target position occupied by ${occupiedCheck.occupiedBy}`
            };
        }
        
        const collapsedCheck = isCardCollapsed(targetPosition, gameState.board);
        if (collapsedCheck.collapsed) {
            return {
                valid: false,
                reason: 'Target position has collapsed card'
            };
        }
        
        return {
            valid: true,
            reason: 'Valid joker move step'
        };
    } catch (error) {
        console.error('Error checking joker move step:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Execute a single joker movement step
function executeJokerMoveStep(targetPosition) {
    console.log(`Executing joker move step to ${JSON.stringify(targetPosition)}`);
    
    try {
        if (!gameState.jokerMoveState || !gameState.jokerMoveState.isActive) {
            throw new Error('No active joker movement state');
        }
        
        const jokerState = gameState.jokerMoveState;
        
        // Validate the move step
        const validation = isValidJokerMoveStep(jokerState, targetPosition);
        if (!validation.valid) {
            return {
                success: false,
                reason: validation.reason
            };
        }
        
        // Update joker state
        jokerState.currentPosition = { ...targetPosition };
        jokerState.movePath.push({ ...targetPosition });
        jokerState.remainingDistance--;
        
        // Check if joker has reached maximum distance
        if (jokerState.remainingDistance <= 0) {
            jokerState.canEndTurn = true; // Must end turn when max distance reached
        }
        
        console.log('Joker move step executed:', {
            newPosition: jokerState.currentPosition,
            remainingDistance: jokerState.remainingDistance,
            pathLength: jokerState.movePath.length
        });
        
        return {
            success: true,
            newPosition: jokerState.currentPosition,
            remainingDistance: jokerState.remainingDistance,
            canEndTurn: jokerState.canEndTurn,
            mustEndTurn: jokerState.remainingDistance <= 0
        };
    } catch (error) {
        console.error('Error executing joker move step:', error.message);
        return {
            success: false,
            reason: `Execution error: ${error.message}`
        };
    }
}

// Get all valid next positions for joker movement
function getValidJokerMoveSteps(jokerState) {
    console.log('Getting valid joker move steps');
    
    try {
        if (!jokerState || !jokerState.isActive || jokerState.remainingDistance <= 0) {
            return [];
        }
        
        const adjacentPositions = getAdjacentPositions(jokerState.currentPosition);
        const validSteps = [];
        
        adjacentPositions.forEach(adjacent => {
            const validation = isValidJokerMoveStep(jokerState, adjacent.position);
            if (validation.valid) {
                validSteps.push({
                    position: adjacent.position,
                    direction: adjacent.direction,
                    wrapped: adjacent.wrapped
                });
            }
        });
        
        console.log(`Found ${validSteps.length} valid joker move steps`);
        return validSteps;
    } catch (error) {
        console.error('Error getting valid joker move steps:', error.message);
        return [];
    }
}

// Check if joker can end turn early
function canEndJokerTurnEarly(jokerState) {
    if (!jokerState || !jokerState.isActive) {
        return false;
    }
    
    // Jokers can end turn early if they've moved at least 1 space
    const hasMovedAtLeast1Space = jokerState.movePath.length > 1;
    
    return hasMovedAtLeast1Space && jokerState.canEndTurn;
}

// Check if joker has valid moves remaining
function hasValidJokerMovesRemaining(jokerState) {
    if (!jokerState || !jokerState.isActive || jokerState.remainingDistance <= 0) {
        return false;
    }
    
    const validNextSteps = getValidJokerMoveSteps(jokerState);
    return validNextSteps.length > 0;
}

// Get joker movement summary
function getJokerMovementSummary(jokerState) {
    if (!jokerState) {
        return null;
    }
    
    return {
        playerId: jokerState.playerId,
        startingPosition: jokerState.startingPosition,
        currentPosition: jokerState.currentPosition,
        spacesMoved: jokerState.movePath.length - 1,
        remainingDistance: jokerState.remainingDistance,
        canEndTurn: jokerState.canEndTurn,
        mustEndTurn: jokerState.remainingDistance <= 0,
        movePath: [...jokerState.movePath]
    };
}

// Update joker movement state after each step
function updateJokerMovementState(targetPosition) {
    console.log('Updating joker movement state');
    
    try {
        if (!gameState.jokerMoveState || !gameState.jokerMoveState.isActive) {
            throw new Error('No active joker movement state to update');
        }
        
        const jokerState = gameState.jokerMoveState;
        const stepResult = executeJokerMoveStep(targetPosition);
        
        if (!stepResult.success) {
            return {
                success: false,
                reason: stepResult.reason,
                state: 'step_failed'
            };
        }
        
        // Update player position on the board
        const player = getCurrentPlayer();
        if (player) {
            movePlayerPawn(player.id, targetPosition.row, targetPosition.col);
        }
        
        // Clear the validation cache since board state changed
        clearValidationCache();
        
        // Determine next state
        let nextState = 'in_progress';
        if (jokerState.remainingDistance <= 0) {
            nextState = 'must_complete';
        } else if (!hasValidJokerMovesRemaining(jokerState)) {
            nextState = 'forced_completion';
        }
        
        return {
            success: true,
            newPosition: stepResult.newPosition,
            remainingDistance: stepResult.remainingDistance,
            spacesMoved: jokerState.movePath.length - 1,
            state: nextState,
            canEndTurn: stepResult.canEndTurn,
            mustEndTurn: stepResult.mustEndTurn
        };
    } catch (error) {
        console.error('Error updating joker movement state:', error.message);
        return {
            success: false,
            reason: `State update error: ${error.message}`,
            state: 'error'
        };
    }
}

// Reset joker movement state (for cancellation or errors)
function resetJokerMovementState() {
    console.log('Resetting joker movement state');
    
    try {
        if (gameState.jokerMoveState) {
            const summary = getJokerMovementSummary(gameState.jokerMoveState);
            gameState.jokerMoveState = null;
            
            // Clear validation cache
            clearValidationCache();
            
            console.log('Joker movement state reset:', summary);
            return {
                success: true,
                previousState: summary
            };
        }
        
        return {
            success: true,
            previousState: null
        };
    } catch (error) {
        console.error('Error resetting joker movement state:', error.message);
        return {
            success: false,
            reason: `Reset error: ${error.message}`
        };
    }
}

// Check if current player is on a joker and can start joker movement
function canStartJokerMovement() {
    try {
        const currentPlayer = getCurrentPlayer();
        if (!currentPlayer || !currentPlayer.isPlaced()) {
            return {
                canStart: false,
                reason: 'No current player or player not placed'
            };
        }
        
        const position = currentPlayer.getPosition();
        const card = getCardAt(position);
        
        if (!card) {
            return {
                canStart: false,
                reason: 'No card found at player position'
            };
        }
        
        const isJoker = card.type === 'red-joker' || card.type === 'black-joker';
        
        return {
            canStart: isJoker,
            reason: isJoker ? 
                `Player on ${card.type}, can start joker movement` :
                `Player on ${card.type}, not a joker card`,
            cardType: card.type,
            position: position
        };
    } catch (error) {
        console.error('Error checking if can start joker movement:', error.message);
        return {
            canStart: false,
            reason: `Check error: ${error.message}`
        };
    }
}

// Start joker movement for current player
function startJokerMovement() {
    console.log('Starting joker movement for current player');
    
    try {
        const canStart = canStartJokerMovement();
        if (!canStart.canStart) {
            return {
                success: false,
                reason: canStart.reason
            };
        }
        
        const currentPlayer = getCurrentPlayer();
        const position = currentPlayer.getPosition();
        
        const jokerState = initializeJokerMovement(currentPlayer, position);
        if (!jokerState) {
            return {
                success: false,
                reason: 'Failed to initialize joker movement'
            };
        }
        
        console.log('Joker movement started successfully');
        return {
            success: true,
            jokerState: jokerState,
            stateInfo: getJokerMovementStateInfo()
        };
    } catch (error) {
        console.error('Error starting joker movement:', error.message);
        return {
            success: false,
            reason: `Start error: ${error.message}`
        };
    }
}