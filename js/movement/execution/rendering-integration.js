// Collapsi Game - Rendering Integration System
// Task 4.5: Integrate move execution with existing board rendering system

// Main integration function to execute move with full rendering updates
function executeMovWithRendering(startingPosition, destinationPosition, path, cardType, currentPlayerId) {
    console.log('Executing move with full rendering integration');
    
    try {
        // Create move execution context
        const executionContext = createMoveExecutionContext(
            startingPosition, 
            destinationPosition, 
            path, 
            cardType, 
            currentPlayerId
        );
        
        if (!executionContext.valid) {
            return {
                success: false,
                reason: executionContext.reason
            };
        }
        
        // Execute the move with rendering coordination
        const result = executeCoordinatedMove(executionContext);
        
        if (result.success) {
            console.log('Move executed successfully with rendering updates');
        } else {
            console.error('Move execution with rendering failed:', result.reason);
        }
        
        return result;
        
    } catch (error) {
        console.error('Error in move execution with rendering:', error.message);
        return {
            success: false,
            reason: `Rendering integration error: ${error.message}`
        };
    }
}

// Create move execution context with all necessary data
function createMoveExecutionContext(startingPosition, destinationPosition, path, cardType, currentPlayerId) {
    console.log('Creating move execution context');
    
    try {
        const context = {
            moveData: {
                startingPosition,
                destinationPosition,
                path,
                cardType,
                playerId: currentPlayerId,
                distance: path.length - 1,
                timestamp: new Date().toISOString()
            },
            gameState: {
                board: gameState.board,
                players: gameState.players,
                currentPlayer: gameState.currentPlayer
            },
            renderingSteps: [],
            valid: true
        };
        
        // Validate context
        const validation = validateExecutionContext(context);
        if (!validation.valid) {
            context.valid = false;
            context.reason = validation.reason;
        }
        
        return context;
        
    } catch (error) {
        console.error('Error creating execution context:', error.message);
        return {
            valid: false,
            reason: `Context creation error: ${error.message}`
        };
    }
}

// Validate move execution context
function validateExecutionContext(context) {
    console.log('Validating move execution context');
    
    try {
        const { moveData, gameState } = context;
        
        // Validate move data
        if (!moveData.startingPosition || !moveData.destinationPosition || !moveData.path) {
            return {
                valid: false,
                reason: 'Missing required move data'
            };
        }
        
        // Validate game state
        if (!gameState.board || !gameState.players) {
            return {
                valid: false,
                reason: 'Invalid game state'
            };
        }
        
        // Validate player
        const player = getPlayerById(moveData.playerId);
        if (!player) {
            return {
                valid: false,
                reason: 'Player not found'
            };
        }
        
        return {
            valid: true,
            reason: 'Context validation passed'
        };
        
    } catch (error) {
        console.error('Error validating execution context:', error.message);
        return {
            valid: false,
            reason: `Context validation error: ${error.message}`
        };
    }
}

// Execute coordinated move with step-by-step rendering
function executeCoordinatedMove(context) {
    console.log('Executing coordinated move with rendering');
    
    try {
        const { moveData } = context;
        
        // Step 1: Pre-execution rendering setup
        const preExecutionResult = handlePreExecutionRendering(context);
        if (!preExecutionResult.success) {
            return preExecutionResult;
        }
        
        // Step 2: Execute the actual move
        const moveExecutionResult = executeMoveToDestination(
            moveData.startingPosition,
            moveData.destinationPosition,
            moveData.path,
            moveData.cardType,
            context.gameState.board,
            context.gameState.players,
            moveData.playerId
        );
        
        if (!moveExecutionResult.success) {
            // Rollback rendering changes
            rollbackRenderingChanges(context);
            return moveExecutionResult;
        }
        
        // Step 3: Post-execution rendering updates
        const postExecutionResult = handlePostExecutionRendering(context, moveExecutionResult);
        if (!postExecutionResult.success) {
            console.warn('Post-execution rendering failed but move succeeded:', postExecutionResult.reason);
        }
        
        // Step 4: Complete integration tasks
        const integrationResult = completeRenderingIntegration(context, moveExecutionResult);
        
        return {
            success: true,
            reason: 'Move executed with full rendering integration',
            moveResult: moveExecutionResult,
            renderingResult: integrationResult
        };
        
    } catch (error) {
        console.error('Error in coordinated move execution:', error.message);
        rollbackRenderingChanges(context);
        return {
            success: false,
            reason: `Coordinated execution error: ${error.message}`
        };
    }
}

// Handle pre-execution rendering setup
function handlePreExecutionRendering(context) {
    console.log('Handling pre-execution rendering');
    
    try {
        const { moveData } = context;
        
        // Clear any existing path highlighting
        clearPathHighlighting();
        
        // Show move execution feedback
        showMoveExecutionFeedback(true);
        
        // Highlight the path being executed
        const pathHighlightResult = highlightExecutionPath(moveData.path, moveData.cardType);
        if (!pathHighlightResult.success) {
            console.warn('Failed to highlight execution path:', pathHighlightResult.reason);
        }
        
        // Mark starting position for visual feedback
        markPositionForExecution(moveData.startingPosition, 'starting');
        
        // Mark destination position for visual feedback
        markPositionForExecution(moveData.destinationPosition, 'destination');
        
        context.renderingSteps.push('pre-execution');
        
        return {
            success: true,
            reason: 'Pre-execution rendering completed'
        };
        
    } catch (error) {
        console.error('Error in pre-execution rendering:', error.message);
        return {
            success: false,
            reason: `Pre-execution rendering error: ${error.message}`
        };
    }
}

// Handle post-execution rendering updates
function handlePostExecutionRendering(context, moveResult) {
    console.log('Handling post-execution rendering');
    
    try {
        const { moveData } = context;
        
        // Update board visual state after move
        const boardUpdateResult = updateBoardRenderingAfterMove(moveData);
        if (!boardUpdateResult.success) {
            return boardUpdateResult;
        }
        
        // Collapse starting card visually
        const collapseResult = collapseStartingCardAfterMove(moveData.startingPosition, moveData);
        if (!collapseResult.success) {
            console.warn('Card collapse rendering failed:', collapseResult.reason);
        }
        
        // Update player pawn rendering
        const pawnUpdateResult = updatePlayerPawnRendering(moveData);
        if (!pawnUpdateResult.success) {
            console.warn('Pawn rendering update failed:', pawnUpdateResult.reason);
        }
        
        // Switch turn with UI updates
        const turnSwitchResult = switchTurnAfterMoveCompletion(moveData);
        if (!turnSwitchResult.success && !turnSwitchResult.gameEnded) {
            console.warn('Turn switch rendering failed:', turnSwitchResult.reason);
        }
        
        context.renderingSteps.push('post-execution');
        
        return {
            success: true,
            reason: 'Post-execution rendering completed',
            collapseResult,
            turnSwitchResult
        };
        
    } catch (error) {
        console.error('Error in post-execution rendering:', error.message);
        return {
            success: false,
            reason: `Post-execution rendering error: ${error.message}`
        };
    }
}

// Update board rendering after move
function updateBoardRenderingAfterMove(moveData) {
    console.log('Updating board rendering after move');
    
    try {
        // Update board state
        const stateUpdateResult = updateBoardStateAfterMove(moveData);
        if (!stateUpdateResult.success) {
            return stateUpdateResult;
        }
        
        // Re-render affected board positions
        const renderingResult = renderAffectedPositions(moveData);
        if (!renderingResult.success) {
            return renderingResult;
        }
        
        // Update any visual indicators
        updateMovementIndicators(moveData);
        
        return {
            success: true,
            reason: 'Board rendering updated successfully'
        };
        
    } catch (error) {
        console.error('Error updating board rendering:', error.message);
        return {
            success: false,
            reason: `Board rendering update error: ${error.message}`
        };
    }
}

// Render affected board positions
function renderAffectedPositions(moveData) {
    console.log('Rendering affected board positions');
    
    try {
        const affectedPositions = [
            moveData.startingPosition,
            moveData.destinationPosition,
            ...moveData.path.slice(1, -1) // Intermediate path positions
        ];
        
        let renderedCount = 0;
        
        affectedPositions.forEach(position => {
            const card = getCardAtPosition(position.row, position.col);
            if (card) {
                const updateResult = updateCardDisplay(position.row, position.col, card);
                if (updateResult) {
                    renderedCount++;
                }
            }
        });
        
        console.log(`Rendered ${renderedCount} affected positions`);
        return {
            success: true,
            reason: `Rendered ${renderedCount} positions`,
            renderedCount
        };
        
    } catch (error) {
        console.error('Error rendering affected positions:', error.message);
        return {
            success: false,
            reason: `Position rendering error: ${error.message}`
        };
    }
}

// Update player pawn rendering after move
function updatePlayerPawnRendering(moveData) {
    console.log(`Updating pawn rendering for player ${moveData.playerId}`);
    
    try {
        // Remove pawn from starting position visually
        clearPositionMarking(moveData.startingPosition);
        
        // Add pawn to destination position visually
        const player = getPlayerById(moveData.playerId);
        if (!player) {
            return {
                success: false,
                reason: 'Player not found for pawn rendering'
            };
        }
        
        // Update pawn position
        const pawnUpdateResult = movePlayerPawn(
            moveData.playerId, 
            moveData.destinationPosition.row, 
            moveData.destinationPosition.col
        );
        
        if (!pawnUpdateResult) {
            return {
                success: false,
                reason: 'Failed to update pawn position'
            };
        }
        
        // Highlight new current player
        const highlightResult = highlightCurrentPlayerPawn();
        
        return {
            success: true,
            reason: 'Pawn rendering updated successfully',
            highlightResult
        };
        
    } catch (error) {
        console.error('Error updating pawn rendering:', error.message);
        return {
            success: false,
            reason: `Pawn rendering error: ${error.message}`
        };
    }
}

// Complete rendering integration tasks
function completeRenderingIntegration(context, moveResult) {
    console.log('Completing rendering integration');
    
    try {
        // Clear execution visual indicators
        clearExecutionVisualIndicators(context);
        
        // Hide move execution feedback
        showMoveExecutionFeedback(false);
        
        // Show success feedback briefly
        showMoveSuccessFeedback();
        
        // Update game status display
        updateGameStatusDisplay();
        
        // Clean up temporary rendering state
        cleanupTemporaryRenderingState(context);
        
        context.renderingSteps.push('integration-complete');
        
        return {
            success: true,
            reason: 'Rendering integration completed',
            renderingSteps: context.renderingSteps
        };
        
    } catch (error) {
        console.error('Error completing rendering integration:', error.message);
        return {
            success: false,
            reason: `Integration completion error: ${error.message}`
        };
    }
}

// Highlight execution path during move
function highlightExecutionPath(path, cardType) {
    console.log('Highlighting execution path');
    
    try {
        const isJokerPath = cardType === 'red-joker' || cardType === 'black-joker';
        const result = highlightMovementPath(path, isJokerPath);
        
        if (!result) {
            return {
                success: false,
                reason: 'Failed to highlight movement path'
            };
        }
        
        // Add execution-specific styling
        path.forEach((position, index) => {
            const cardElement = document.querySelector(`[data-row="${position.row}"][data-col="${position.col}"]`);
            if (cardElement) {
                cardElement.classList.add('executing-move');
                if (index === 0) cardElement.classList.add('execution-start');
                if (index === path.length - 1) cardElement.classList.add('execution-end');
            }
        });
        
        return {
            success: true,
            reason: 'Execution path highlighted'
        };
        
    } catch (error) {
        console.error('Error highlighting execution path:', error.message);
        return {
            success: false,
            reason: `Path highlighting error: ${error.message}`
        };
    }
}

// Mark position for execution visual feedback
function markPositionForExecution(position, type) {
    console.log(`Marking position (${position.row}, ${position.col}) as ${type}`);
    
    try {
        const cardElement = document.querySelector(`[data-row="${position.row}"][data-col="${position.col}"]`);
        if (cardElement) {
            cardElement.classList.add(`execution-${type}`);
            cardElement.dataset.executionRole = type;
        }
    } catch (error) {
        console.error('Error marking position for execution:', error.message);
    }
}

// Clear position marking
function clearPositionMarking(position) {
    console.log(`Clearing position marking at (${position.row}, ${position.col})`);
    
    try {
        const cardElement = document.querySelector(`[data-row="${position.row}"][data-col="${position.col}"]`);
        if (cardElement) {
            cardElement.classList.remove('execution-starting', 'execution-destination', 'executing-move', 'execution-start', 'execution-end');
            cardElement.removeAttribute('data-execution-role');
        }
    } catch (error) {
        console.error('Error clearing position marking:', error.message);
    }
}

// Update movement indicators
function updateMovementIndicators(moveData) {
    console.log('Updating movement indicators');
    
    try {
        // Update distance indicators
        const distanceElements = document.querySelectorAll('.move-distance-indicator');
        distanceElements.forEach(element => {
            element.textContent = `Distance: ${moveData.distance}`;
        });
        
        // Update card type indicators
        const cardTypeElements = document.querySelectorAll('.card-type-indicator');
        cardTypeElements.forEach(element => {
            element.textContent = `Card: ${moveData.cardType}`;
        });
        
    } catch (error) {
        console.error('Error updating movement indicators:', error.message);
    }
}

// Clear execution visual indicators
function clearExecutionVisualIndicators(context) {
    console.log('Clearing execution visual indicators');
    
    try {
        const { moveData } = context;
        
        // Clear path highlighting
        clearPathHighlighting();
        
        // Clear position markings
        clearPositionMarking(moveData.startingPosition);
        clearPositionMarking(moveData.destinationPosition);
        
        // Clear execution classes from all path positions
        moveData.path.forEach(position => {
            clearPositionMarking(position);
        });
        
    } catch (error) {
        console.error('Error clearing execution visual indicators:', error.message);
    }
}

// Rollback rendering changes on error
function rollbackRenderingChanges(context) {
    console.log('Rolling back rendering changes');
    
    try {
        // Clear any visual feedback
        showMoveExecutionFeedback(false);
        
        // Clear execution indicators
        clearExecutionVisualIndicators(context);
        
        // Restore previous state if possible
        cleanupTemporaryRenderingState(context);
        
        console.log('Rendering rollback completed');
        
    } catch (error) {
        console.error('Error during rendering rollback:', error.message);
    }
}

// Clean up temporary rendering state
function cleanupTemporaryRenderingState(context) {
    console.log('Cleaning up temporary rendering state');
    
    try {
        // Remove any temporary CSS classes
        const tempElements = document.querySelectorAll('.executing-move, .execution-start, .execution-end, .execution-starting, .execution-destination');
        tempElements.forEach(element => {
            element.classList.remove('executing-move', 'execution-start', 'execution-end', 'execution-starting', 'execution-destination');
            element.removeAttribute('data-execution-role');
        });
        
        // Clear any temporary data
        delete context.tempRenderingData;
        
        console.log('Temporary rendering state cleaned up');
        
    } catch (error) {
        console.error('Error cleaning up temporary rendering state:', error.message);
    }
}

// Get rendering integration status
function getRenderingIntegrationStatus() {
    console.log('Getting rendering integration status');
    
    try {
        return {
            available: true,
            version: '1.0.0',
            features: [
                'coordinated-move-execution',
                'step-by-step-rendering',
                'visual-feedback',
                'error-rollback',
                'state-integration'
            ],
            dependencies: [
                'move-executor',
                'board-state-manager',
                'card-collapse-manager',
                'turn-manager'
            ]
        };
        
    } catch (error) {
        console.error('Error getting integration status:', error.message);
        return {
            available: false,
            error: error.message
        };
    }
}

console.log('Rendering integration system loaded');