// Collapsi Game - Movement Module Index
// Main exports for all movement functionality

// This file serves as the main entry point for the movement module
// It maintains compatibility with the original movement.js by exposing all functions globally

// Note: Since we're maintaining compatibility with existing global function usage,
// we'll load all module files directly rather than using ES6 imports

// The module files will be loaded in dependency order by the HTML file
// This index file primarily serves as documentation and future refactoring preparation

// Core Movement Functions (from core/card-movement.js)
// - getCardMovementDistance(cardType)
// - validateMovementDistance(startingCardType, plannedDistance)

// Position Utilities (from core/position-utils.js)
// - getMovementDirection(fromPosition, toPosition)
// - calculateWraparoundPosition(position, direction)
// - isWraparoundStep(fromPosition, toPosition)
// - getAdjacentPositions(position)

// Path Validation (from core/path-validation.js)
// - isOrthogonalStep(fromPosition, toPosition)
// - validateOrthogonalPath(path)
// - isPositionVisited(position, visitedPositions)
// - validateNoRevisitedCards(path)
// - getInvalidNextPositions(currentPath)
// - isValidNextPosition(currentPath, proposedPosition)
// - validateCompletePath(path)

// Ending Validation (from validation/ending-validator.js)
// - isPositionOccupied(position, gameBoard, players)
// - validateNotEndingOnStartingCard(startingPosition, endingPosition)
// - validateNotEndingOnOccupiedPosition(endingPosition, gameBoard, players, currentPlayerId)
// - validateMoveEnding(startingPosition, endingPosition, gameBoard, players, currentPlayerId)
// - isCardCollapsed(position, gameBoard)

// Movement Validation (from validation/movement-validator.js)
// - validateMove(startingPosition, path, distance, startingCardType, gameBoard, players, currentPlayerId)
// - validateMoveStep(fromPosition, toPosition, currentPath, gameBoard, players)
// - validateCompleteGameMove(startingPosition, endingPosition, path, distance, cardType, gameBoard, players, currentPlayerId)

// Optimized Validation (from validation/optimized-validator.js)
// - validateMoveOptimized(startingPosition, path, distance, startingCardType, gameBoard, players, currentPlayerId)
// - validateCompletePathOptimized(path)
// - benchmarkValidationPerformance()
// - isPositionValidCached(position, gameBoard, players, cacheKey)
// - clearValidationCache()

// Joker State Management (from joker/joker-state.js)
// - getCardAt(position)
// - initializeJokerMovement(player, position)
// - isValidJokerMoveStep(jokerState, targetPosition)
// - executeJokerMoveStep(targetPosition)
// - getValidJokerMoveSteps(jokerState)
// - canEndJokerTurnEarly(jokerState)
// - hasValidJokerMovesRemaining(jokerState)
// - getJokerMovementSummary(jokerState)
// - updateJokerMovementState(targetPosition)
// - resetJokerMovementState()
// - canStartJokerMovement()
// - startJokerMovement()

// Joker Validation (from joker/joker-validator.js)
// - validateJokerMovementPath(jokerState)
// - validateJokerMovementAsFixedDistance(jokerState, targetDistance)
// - compareJokerToNumberedCardMovement(jokerState)
// - validateJokerStepAgainstNumberedCardRules(fromPosition, toPosition, jokerState)
// - validateJokerMovementComprehensive(jokerState)

// Joker Completion (from joker/joker-completion.js)
// - getJokerEarlyCompletionOptions(jokerState)
// - getValidJokerDistances(currentDistance)
// - checkForForcedJokerCompletion(jokerState)
// - initiateJokerEarlyCompletion()
// - getJokerTurnCompletionUIState(jokerState)
// - completeJokerMovement()
// - cancelJokerMovement()
// - handleJokerTurnCompletion()
// - transitionJokerMovementState()
// - getJokerMovementStateInfo()

// Path Visualization (from visualization/path-highlighter.js)
// - getNumberedCardMovementPath(startPosition, distance)
// - highlightCurrentPlayerMovementPath()
// - updatePathVisualization()
// - updateAllVisualization()
// - previewMovementToPosition(targetPosition)

// Module Information
const MovementModule = {
    version: '1.0.0',
    description: 'Modular movement system for Collapsi game',
    modules: {
        core: ['card-movement', 'position-utils', 'path-validation'],
        validation: ['ending-validator', 'movement-validator', 'optimized-validator'],
        joker: ['joker-state', 'joker-validator', 'joker-completion'],
        visualization: ['path-highlighter']
    },
    totalFunctions: 65, // Approximate count of exported functions
    originalFileSize: '2227 lines',
    newStructureSize: '~1800 lines across 9 files',
    benefits: [
        'Improved maintainability',
        'Better testing capabilities',
        'Clearer separation of concerns',
        'Easier debugging and development',
        'Reduced complexity per file'
    ]
};

// Export module information for debugging and documentation
if (typeof window !== 'undefined') {
    window.MovementModule = MovementModule;
}

console.log('Movement module loaded:', MovementModule);