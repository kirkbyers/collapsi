// Collapsi Game - Move Execution Module Index
// Task 4.0: Move Execution and Game State Updates - Complete System

// This module provides comprehensive move execution functionality including:
// - Immediate move execution on valid destination selection
// - Game board state updates after completed moves  
// - Starting card collapse (flip face-down) after move completion
// - Automatic turn switching after successful move execution
// - Integration with existing board rendering system

// Module Information
const MoveExecutionModule = {
    version: '1.0.0',
    description: 'Complete move execution system for Collapsi game',
    components: {
        'move-executor': 'Core move execution and validation',
        'board-state-manager': 'Board state updates and consistency',
        'card-collapse-manager': 'Card collapse mechanics and visuals',
        'turn-manager': 'Turn switching and game flow control',
        'rendering-integration': 'Rendering system integration layer'
    },
    dependencies: [
        'movement/validation/movement-validator',
        'movement/core/card-movement',
        'movement/core/path-validation',
        'board.js',
        'player.js',
        'game.js'
    ]
};

// Main Move Execution Functions (from move-executor.js)
// - executeMoveToDestination(startingPosition, destinationPosition, path, cardType, gameBoard, players, currentPlayerId)
// - performMoveExecution(startingPosition, destinationPosition, path, currentPlayerId)
// - updateGameStateAfterMove(startingPosition, destinationPosition, path, currentPlayerId)
// - rollbackMove(startingPosition, destinationPosition, currentPlayerId)
// - executeClickToMove(clickedRow, clickedCol)
// - calculateSimplePath(startPos, endPos)
// - executeMoveWithFeedback(startingPosition, destinationPosition, path, cardType, currentPlayerId)
// - isMoveExecutionInProgress()
// - setMoveExecutionInProgress(inProgress)
// - showMoveExecutionFeedback(show)
// - showMoveSuccessFeedback()
// - showMoveErrorFeedback(reason)

// Board State Management Functions (from board-state-manager.js)
// - updateBoardStateAfterMove(moveData)
// - updatePlayerPositionsOnBoard(startingPosition, destinationPosition, playerId)
// - updateCardStatesAfterMove(startingPosition, destinationPosition, path, playerId)
// - updateGameMetadataAfterMove(moveData)
// - validateBoardStateConsistency()
// - getBoardStateSnapshot()
// - restoreBoardStateFromSnapshot(snapshot)
// - clearAllPlayerPositionsFromBoard()

// Card Collapse Management Functions (from card-collapse-manager.js)
// - collapseStartingCardAfterMove(startingPosition, moveData)
// - validateCardCanBeCollapsed(card, position, moveData)
// - validateCollapseAgainstGameRules(card, position, moveData)
// - performCardCollapse(card, position, moveData)
// - updateCardCollapseVisuals(position, card)
// - isCardCollapsedAt(position)
// - getAllCollapsedCards()
// - getCollapsedCardCount()
// - restoreCollapsedCard(position)
// - resetAllCardCollapseStates()
// - getCollapseStatistics()

// Turn Management Functions (from turn-manager.js)
// - switchTurnAfterMoveCompletion(moveData)
// - validateMoveCompletionForTurnSwitch(moveData)
// - checkGameEndBeforeTurnSwitch()
// - performTurnSwitch(moveData)
// - updateTurnMetadata(previousPlayer, newCurrentPlayer, moveData)
// - updateTurnSwitchUI(newCurrentPlayer)
// - updateTurnIndicatorUI(currentPlayer)
// - updateGameStatusDisplay()
// - checkNewPlayerValidMoves(newCurrentPlayer)
// - handleGameEndAfterTurnSwitch(winningPlayer)
// - recordFinalGameStatistics()
// - updateGameEndUI(winningPlayer)
// - getTurnStatistics()

// Rendering Integration Functions (from rendering-integration.js)
// - executeMovWithRendering(startingPosition, destinationPosition, path, cardType, currentPlayerId)
// - createMoveExecutionContext(startingPosition, destinationPosition, path, cardType, currentPlayerId)
// - validateExecutionContext(context)
// - executeCoordinatedMove(context)
// - handlePreExecutionRendering(context)
// - handlePostExecutionRendering(context, moveResult)
// - updateBoardRenderingAfterMove(moveData)
// - renderAffectedPositions(moveData)
// - updatePlayerPawnRendering(moveData)
// - completeRenderingIntegration(context, moveResult)
// - highlightExecutionPath(path, cardType)
// - markPositionForExecution(position, type)
// - clearPositionMarking(position)
// - updateMovementIndicators(moveData)
// - clearExecutionVisualIndicators(context)
// - rollbackRenderingChanges(context)
// - cleanupTemporaryRenderingState(context)
// - getRenderingIntegrationStatus()

// High-Level API Functions for Game Integration

// Execute a complete move with all systems coordinated
function executeCompleteMove(startingPosition, destinationPosition, path, cardType, currentPlayerId) {
    console.log('Executing complete move with all systems');
    
    try {
        // Use the rendering integration for complete coordination
        return executeMovWithRendering(
            startingPosition,
            destinationPosition,
            path,
            cardType,
            currentPlayerId
        );
    } catch (error) {
        console.error('Error in complete move execution:', error.message);
        return {
            success: false,
            reason: `Complete move execution error: ${error.message}`
        };
    }
}

// Execute a move from UI interaction (click/touch)
function executeUIMove(clickedRow, clickedCol) {
    console.log(`Executing UI move to (${clickedRow}, ${clickedCol})`);
    
    try {
        // Use the click-to-move function with enhanced error handling
        const result = executeClickToMove(clickedRow, clickedCol);
        
        if (result.success) {
            console.log('UI move executed successfully');
        } else {
            console.error('UI move execution failed:', result.reason);
        }
        
        return result;
    } catch (error) {
        console.error('Error in UI move execution:', error.message);
        return {
            success: false,
            reason: `UI move execution error: ${error.message}`
        };
    }
}

// Get complete execution system status
function getExecutionSystemStatus() {
    console.log('Getting execution system status');
    
    try {
        return {
            module: MoveExecutionModule,
            rendering: getRenderingIntegrationStatus(),
            gameState: {
                moveExecutionInProgress: isMoveExecutionInProgress(),
                collapsedCardCount: getCollapsedCardCount(),
                turnStatistics: getTurnStatistics()
            },
            capabilities: [
                'immediate-move-execution',
                'board-state-management',
                'card-collapse-mechanics',
                'turn-switching',
                'rendering-integration',
                'error-handling',
                'rollback-support'
            ]
        };
    } catch (error) {
        console.error('Error getting execution system status:', error.message);
        return {
            available: false,
            error: error.message
        };
    }
}

// Initialize execution system
function initializeExecutionSystem() {
    console.log('Initializing move execution system');
    
    try {
        // Reset any execution state
        setMoveExecutionInProgress(false);
        
        // Initialize game state if needed
        if (!gameState.collapsedCards) {
            gameState.collapsedCards = [];
        }
        
        if (!gameState.playerMoveStats) {
            gameState.playerMoveStats = {};
        }
        
        if (!gameState.turnHistory) {
            gameState.turnHistory = [];
        }
        
        console.log('Move execution system initialized');
        return {
            success: true,
            reason: 'Execution system initialized',
            status: getExecutionSystemStatus()
        };
        
    } catch (error) {
        console.error('Error initializing execution system:', error.message);
        return {
            success: false,
            reason: `Initialization error: ${error.message}`
        };
    }
}

// Reset execution system (for new game)
function resetExecutionSystem() {
    console.log('Resetting move execution system');
    
    try {
        // Reset all card collapse states
        resetAllCardCollapseStates();
        
        // Clear board state
        clearAllPlayerPositionsFromBoard();
        
        // Reset execution flags
        setMoveExecutionInProgress(false);
        
        // Clear game state
        gameState.collapsedCards = [];
        gameState.playerMoveStats = {};
        gameState.turnHistory = [];
        gameState.currentMovePath = [];
        gameState.jokerMoveState = null;
        
        console.log('Move execution system reset');
        return {
            success: true,
            reason: 'Execution system reset successfully'
        };
        
    } catch (error) {
        console.error('Error resetting execution system:', error.message);
        return {
            success: false,
            reason: `Reset error: ${error.message}`
        };
    }
}

// Export module information for debugging and documentation
if (typeof window !== 'undefined') {
    window.MoveExecutionModule = MoveExecutionModule;
    
    // Export high-level API functions
    window.executeCompleteMove = executeCompleteMove;
    window.executeUIMove = executeUIMove;
    window.getExecutionSystemStatus = getExecutionSystemStatus;
    window.initializeExecutionSystem = initializeExecutionSystem;
    window.resetExecutionSystem = resetExecutionSystem;
}

console.log('Move execution module loaded:', MoveExecutionModule);