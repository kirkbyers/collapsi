// Collapsi Game - Movement Validator
// Main validation orchestration and comprehensive move validation

// Main comprehensive move validation function
function validateMove(startingPosition, path, distance, startingCardType, gameBoard, players, currentPlayerId) {
    console.log('Running comprehensive move validation');
    
    try {
        if (!startingPosition || !path || !Array.isArray(path) || path.length < 2) {
            return {
                valid: false,
                reason: 'Invalid input parameters'
            };
        }
        
        // Use optimized validation for performance
        return validateMoveOptimized(startingPosition, path, distance, startingCardType, gameBoard, players, currentPlayerId);
    } catch (error) {
        console.error('Error in move validation:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Validate a single move step
function validateMoveStep(fromPosition, toPosition, currentPath, gameBoard, players) {
    console.log(`Validating move step from ${JSON.stringify(fromPosition)} to ${JSON.stringify(toPosition)}`);
    
    try {
        // Check orthogonal movement
        const orthogonalCheck = isOrthogonalStep(fromPosition, toPosition);
        if (!orthogonalCheck.valid) {
            return {
                valid: false,
                reason: orthogonalCheck.reason
            };
        }
        
        // Check if position has been visited
        const visitedCheck = isValidNextPosition(currentPath, toPosition);
        if (!visitedCheck.valid) {
            return {
                valid: false,
                reason: visitedCheck.reason
            };
        }
        
        // Check if position is occupied
        const occupiedCheck = isPositionOccupied(toPosition, gameBoard, players);
        if (occupiedCheck.occupied) {
            return {
                valid: false,
                reason: `Position occupied by ${occupiedCheck.occupiedBy}`
            };
        }
        
        // Check if card is collapsed
        const collapsedCheck = isCardCollapsed(toPosition, gameBoard);
        if (collapsedCheck.collapsed) {
            return {
                valid: false,
                reason: 'Card is collapsed (face-down)'
            };
        }
        
        return {
            valid: true,
            reason: 'Valid move step'
        };
    } catch (error) {
        console.error('Error validating move step:', error.message);
        return {
            valid: false,
            reason: `Step validation error: ${error.message}`
        };
    }
}

// Validate complete game move including all rules
function validateCompleteGameMove(startingPosition, endingPosition, path, distance, cardType, gameBoard, players, currentPlayerId) {
    console.log('Validating complete game move');
    
    try {
        // Validate movement distance for card type
        const distanceValidation = validateMovementDistance(cardType, distance);
        if (!distanceValidation.valid) {
            return {
                valid: false,
                type: 'distance',
                reason: distanceValidation.reason
            };
        }
        
        // Validate complete path
        const pathValidation = validateCompletePath(path);
        if (!pathValidation.valid) {
            return {
                valid: false,
                type: 'path',
                reason: pathValidation.reason
            };
        }
        
        // Validate move ending
        const endingValidation = validateMoveEnding(startingPosition, endingPosition, gameBoard, players, currentPlayerId);
        if (!endingValidation.valid) {
            return {
                valid: false,
                type: 'ending',
                reason: endingValidation.reason
            };
        }
        
        return {
            valid: true,
            reason: 'All validations passed',
            validations: {
                distance: distanceValidation,
                path: pathValidation,
                ending: endingValidation
            }
        };
    } catch (error) {
        console.error('Error in complete game move validation:', error.message);
        return {
            valid: false,
            type: 'error',
            reason: `Validation error: ${error.message}`
        };
    }
}