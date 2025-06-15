// Collapsi Game - Joker Completion
// Joker turn completion, early completion options, and state transitions

// Get available early completion options for joker
function getJokerEarlyCompletionOptions(jokerState) {
    console.log('Getting joker early completion options');
    
    try {
        if (!jokerState || !jokerState.isActive) {
            return {
                canComplete: false,
                reason: 'No active joker movement'
            };
        }
        
        const spacesMoved = jokerState.movePath.length - 1;
        const canCompleteEarly = spacesMoved >= 1 && spacesMoved < 4;
        const mustComplete = jokerState.remainingDistance <= 0;
        
        return {
            canComplete: canCompleteEarly || mustComplete,
            canCompleteEarly: canCompleteEarly,
            mustComplete: mustComplete,
            spacesMoved: spacesMoved,
            remainingDistance: jokerState.remainingDistance,
            validDistances: getValidJokerDistances(spacesMoved),
            reason: canCompleteEarly ? 
                `Can end turn after ${spacesMoved} space${spacesMoved !== 1 ? 's' : ''}` :
                mustComplete ? 
                    'Must end turn (maximum distance reached)' :
                    'Must move at least 1 space before ending turn'
        };
    } catch (error) {
        console.error('Error getting early completion options:', error.message);
        return {
            canComplete: false,
            reason: `Error: ${error.message}`
        };
    }
}

// Get valid distance options for joker at current state
function getValidJokerDistances(currentDistance) {
    const validDistances = [];
    
    // If already moved, can complete at current distance
    if (currentDistance >= 1 && currentDistance <= 4) {
        validDistances.push(currentDistance);
    }
    
    // Can continue moving if not at maximum
    if (currentDistance < 4) {
        for (let distance = currentDistance + 1; distance <= 4; distance++) {
            validDistances.push(distance);
        }
    }
    
    return validDistances;
}

// Force early completion when no valid moves remain
function checkForForcedJokerCompletion(jokerState) {
    console.log('Checking for forced joker completion');
    
    try {
        if (!jokerState || !jokerState.isActive) {
            return {
                forced: false,
                reason: 'No active joker movement'
            };
        }
        
        const spacesMoved = jokerState.movePath.length - 1;
        const hasMovesRemaining = hasValidJokerMovesRemaining(jokerState);
        const atMaxDistance = jokerState.remainingDistance <= 0;
        
        // Must complete if at max distance or no valid moves
        const forcedCompletion = atMaxDistance || (!hasMovesRemaining && spacesMoved >= 1);
        
        return {
            forced: forcedCompletion,
            reason: atMaxDistance ? 
                'Maximum distance reached (4 spaces)' :
                !hasMovesRemaining ? 
                    'No valid moves remaining' :
                    'Can continue movement or complete turn',
            spacesMoved: spacesMoved,
            hasMovesRemaining: hasMovesRemaining,
            atMaxDistance: atMaxDistance
        };
    } catch (error) {
        console.error('Error checking forced completion:', error.message);
        return {
            forced: true,
            reason: `Error occurred: ${error.message}`
        };
    }
}

// Initiate early turn completion
function initiateJokerEarlyCompletion() {
    console.log('Initiating joker early completion');
    
    try {
        if (!gameState.jokerMoveState || !gameState.jokerMoveState.isActive) {
            return {
                success: false,
                reason: 'No active joker movement to complete'
            };
        }
        
        const jokerState = gameState.jokerMoveState;
        const options = getJokerEarlyCompletionOptions(jokerState);
        
        if (!options.canComplete) {
            return {
                success: false,
                reason: options.reason
            };
        }
        
        // Complete the movement
        const completion = completeJokerMovement();
        
        if (completion.success) {
            console.log('Joker early completion successful:', completion.summary);
            return {
                success: true,
                summary: completion.summary,
                earlyCompletion: true,
                spacesMoved: completion.summary.spacesMoved
            };
        } else {
            return {
                success: false,
                reason: completion.reason
            };
        }
    } catch (error) {
        console.error('Error during early completion:', error.message);
        return {
            success: false,
            reason: `Early completion error: ${error.message}`
        };
    }
}

// Get turn completion UI state for joker
function getJokerTurnCompletionUIState(jokerState) {
    if (!jokerState || !jokerState.isActive) {
        return {
            showCompletionOption: false,
            completionRequired: false,
            completionText: ''
        };
    }
    
    const spacesMoved = jokerState.movePath.length - 1;
    const options = getJokerEarlyCompletionOptions(jokerState);
    const forced = checkForForcedJokerCompletion(jokerState);
    
    return {
        showCompletionOption: options.canComplete,
        completionRequired: forced.forced,
        completionText: forced.forced ? 
            `End Turn (${forced.reason})` :
            options.canCompleteEarly ?
                `End Turn (${spacesMoved} space${spacesMoved !== 1 ? 's' : ''})` :
                'Complete Move',
        canContinue: !forced.forced && jokerState.remainingDistance > 0,
        remainingMoves: jokerState.remainingDistance,
        spacesMoved: spacesMoved
    };
}

// Complete joker movement and clean up state
function completeJokerMovement() {
    console.log('Completing joker movement');
    
    try {
        if (!gameState.jokerMoveState || !gameState.jokerMoveState.isActive) {
            throw new Error('No active joker movement to complete');
        }
        
        const jokerState = gameState.jokerMoveState;
        const summary = getJokerMovementSummary(jokerState);
        
        // Validate the final move
        if (summary.spacesMoved < 1) {
            throw new Error('Joker must move at least 1 space');
        }
        
        if (summary.spacesMoved > 4) {
            throw new Error('Joker cannot move more than 4 spaces');
        }
        
        // Store the completed move in history
        const moveRecord = {
            type: 'joker-move',
            playerId: jokerState.playerId,
            startingPosition: jokerState.startingPosition,
            endingPosition: jokerState.currentPosition,
            path: jokerState.movePath,
            distance: summary.spacesMoved,
            timestamp: new Date().toISOString()
        };
        
        gameState.moveHistory.push(moveRecord);
        
        // Clear joker movement state
        gameState.jokerMoveState = null;
        
        console.log('Joker movement completed:', summary);
        return {
            success: true,
            summary: summary,
            moveRecord: moveRecord
        };
    } catch (error) {
        console.error('Error completing joker movement:', error.message);
        return {
            success: false,
            reason: `Completion error: ${error.message}`
        };
    }
}

// Cancel joker movement and reset state
function cancelJokerMovement() {
    console.log('Cancelling joker movement');
    
    if (gameState.jokerMoveState) {
        const summary = getJokerMovementSummary(gameState.jokerMoveState);
        gameState.jokerMoveState = null;
        
        console.log('Joker movement cancelled:', summary);
        return summary;
    }
    
    return null;
}

// Handle joker turn completion and state cleanup
function handleJokerTurnCompletion() {
    console.log('Handling joker turn completion');
    
    try {
        if (!gameState.jokerMoveState || !gameState.jokerMoveState.isActive) {
            return {
                success: false,
                reason: 'No active joker movement to complete'
            };
        }
        
        const jokerState = gameState.jokerMoveState;
        
        // Validate final movement
        const validation = validateJokerMovementComprehensive(jokerState);
        if (!validation.valid) {
            return {
                success: false,
                reason: `Invalid joker movement: ${validation.reason}`
            };
        }
        
        // Complete the movement
        const completion = completeJokerMovement();
        if (!completion.success) {
            return {
                success: false,
                reason: completion.reason
            };
        }
        
        // Collapse the starting card
        const startingPos = jokerState.startingPosition;
        if (!collapseCard(startingPos.row, startingPos.col)) {
            console.warn('Failed to collapse starting card after joker movement');
        }
        
        // Update move history
        addMoveToHistory(completion.moveRecord);
        
        // Switch to next player
        switchToNextPlayer();
        
        // Check for game end
        const gameEnded = checkGameEnd();
        
        console.log('Joker turn completed successfully:', {
            spacesMoved: completion.summary.spacesMoved,
            gameEnded: gameEnded
        });
        
        return {
            success: true,
            summary: completion.summary,
            gameEnded: gameEnded,
            nextPlayer: getCurrentPlayer()?.id
        };
    } catch (error) {
        console.error('Error handling joker turn completion:', error.message);
        return {
            success: false,
            reason: `Turn completion error: ${error.message}`
        };
    }
}

// Transition joker movement state based on current conditions
function transitionJokerMovementState() {
    console.log('Transitioning joker movement state');
    
    try {
        if (!gameState.jokerMoveState || !gameState.jokerMoveState.isActive) {
            return {
                state: 'inactive',
                reason: 'No active joker movement'
            };
        }
        
        const jokerState = gameState.jokerMoveState;
        const spacesMoved = jokerState.movePath.length - 1;
        const hasValidMoves = hasValidJokerMovesRemaining(jokerState);
        const atMaxDistance = jokerState.remainingDistance <= 0;
        
        // Determine current state based on conditions
        if (spacesMoved === 0) {
            return {
                state: 'starting',
                reason: 'Joker movement just started, no moves made yet',
                canEndTurn: false,
                mustContinue: true
            };
        } else if (atMaxDistance) {
            return {
                state: 'must_complete',
                reason: 'Maximum distance reached, must end turn',
                canEndTurn: true,
                mustEndTurn: true
            };
        } else if (!hasValidMoves) {
            return {
                state: 'forced_completion',
                reason: 'No valid moves remaining, must end turn',
                canEndTurn: true,
                mustEndTurn: true
            };
        } else if (spacesMoved >= 1 && spacesMoved < 4) {
            return {
                state: 'can_continue_or_complete',
                reason: `Moved ${spacesMoved} space${spacesMoved !== 1 ? 's' : ''}, can continue or end turn`,
                canEndTurn: true,
                canContinue: true
            };
        } else {
            return {
                state: 'invalid',
                reason: `Invalid joker state: ${spacesMoved} spaces moved`
            };
        }
    } catch (error) {
        console.error('Error transitioning joker movement state:', error.message);
        return {
            state: 'error',
            reason: `State transition error: ${error.message}`
        };
    }
}

// Get current joker movement state information
function getJokerMovementStateInfo() {
    if (!gameState.jokerMoveState || !gameState.jokerMoveState.isActive) {
        return {
            active: false,
            state: 'inactive'
        };
    }
    
    const jokerState = gameState.jokerMoveState;
    const stateTransition = transitionJokerMovementState();
    const completionOptions = getJokerEarlyCompletionOptions(jokerState);
    const uiState = getJokerTurnCompletionUIState(jokerState);
    
    return {
        active: true,
        playerId: jokerState.playerId,
        spacesMoved: jokerState.movePath.length - 1,
        remainingDistance: jokerState.remainingDistance,
        currentPosition: jokerState.currentPosition,
        state: stateTransition.state,
        stateReason: stateTransition.reason,
        completionOptions: completionOptions,
        uiState: uiState,
        validNextSteps: getValidJokerMoveSteps(jokerState)
    };
}