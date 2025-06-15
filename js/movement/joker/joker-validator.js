// Collapsi Game - Joker Validation
// Joker-specific validation logic and numbered card rule compliance

// Validate that joker movement path follows all numbered card rules
function validateJokerMovementPath(jokerState) {
    console.log('Validating joker movement path against numbered card rules');
    
    try {
        if (!jokerState || !jokerState.isActive) {
            return {
                valid: false,
                reason: 'No active joker movement to validate'
            };
        }
        
        const path = jokerState.movePath;
        const distance = path.length - 1;
        
        if (distance < 1) {
            return {
                valid: false,
                reason: 'Joker must move at least 1 space'
            };
        }
        
        if (distance > 4) {
            return {
                valid: false,
                reason: 'Joker cannot move more than 4 spaces'
            };
        }
        
        // Run all standard movement validations
        const validations = {
            orthogonal: validateOrthogonalPath(path),
            noRevisits: validateNoRevisitedCards(path),
            notOnStarting: validateNotEndingOnStartingCard(jokerState.startingPosition, jokerState.currentPosition),
            notOnOccupied: validateNotEndingOnOccupiedPosition(
                jokerState.currentPosition, 
                gameState.board, 
                gameState.players, 
                jokerState.playerId
            )
        };
        
        // Check if all validations pass
        const allValid = Object.values(validations).every(v => v.valid);
        
        // Collect any failed validation reasons
        const failedReasons = Object.entries(validations)
            .filter(([, result]) => !result.valid)
            .map(([validationType, result]) => `${validationType}: ${result.reason}`);
        
        return {
            valid: allValid,
            distance: distance,
            validations: validations,
            reason: allValid ? 
                `Joker path valid: ${distance} spaces, all rules followed` :
                `Joker path invalid: ${failedReasons.join('; ')}`
        };
    } catch (error) {
        console.error('Error validating joker movement path:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Validate joker movement against specific distance like numbered cards
function validateJokerMovementAsFixedDistance(jokerState, targetDistance) {
    console.log(`Validating joker movement as fixed distance: ${targetDistance}`);
    
    try {
        if (!jokerState || !jokerState.isActive) {
            return {
                valid: false,
                reason: 'No active joker movement to validate'
            };
        }
        
        const actualDistance = jokerState.movePath.length - 1;
        
        // Use the standard numbered card validation
        const distanceValidation = validateMovementDistance('virtual-card', targetDistance);
        if (!distanceValidation.valid) {
            return distanceValidation;
        }
        
        // Check if joker distance matches target
        if (actualDistance !== targetDistance) {
            return {
                valid: false,
                reason: `Joker moved ${actualDistance} spaces, but validating against ${targetDistance} spaces`
            };
        }
        
        // Run comprehensive path validation
        const pathValidation = validateJokerMovementPath(jokerState);
        
        return {
            valid: pathValidation.valid,
            distance: actualDistance,
            targetDistance: targetDistance,
            pathValidation: pathValidation,
            reason: pathValidation.valid ?
                `Joker movement valid as ${targetDistance}-space move` :
                pathValidation.reason
        };
    } catch (error) {
        console.error('Error validating joker as fixed distance:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Compare joker movement to equivalent numbered card movement
function compareJokerToNumberedCardMovement(jokerState) {
    console.log('Comparing joker movement to equivalent numbered card movement');
    
    try {
        if (!jokerState || !jokerState.isActive) {
            return {
                equivalent: false,
                reason: 'No joker movement to compare'
            };
        }
        
        const distance = jokerState.movePath.length - 1;
        
        if (distance < 1 || distance > 4) {
            return {
                equivalent: false,
                reason: `Invalid distance: ${distance}. Must be 1-4 for comparison.`
            };
        }
        
        // Create virtual numbered card type based on distance
        const virtualCardType = distance === 1 ? 'A' : distance.toString();
        
        // Validate using numbered card logic
        const numberedCardValidation = validateMoveOptimized(
            jokerState.startingPosition,
            jokerState.movePath,
            distance,
            virtualCardType,
            gameState.board,
            gameState.players,
            jokerState.playerId
        );
        
        // Also validate using joker-specific logic
        const jokerValidation = validateJokerMovementPath(jokerState);
        
        const bothValid = numberedCardValidation.valid && jokerValidation.valid;
        
        return {
            equivalent: bothValid,
            distance: distance,
            virtualCardType: virtualCardType,
            numberedCardValidation: numberedCardValidation,
            jokerValidation: jokerValidation,
            reason: bothValid ?
                `Joker movement equivalent to ${virtualCardType} card movement` :
                `Validation mismatch: numbered=${numberedCardValidation.valid}, joker=${jokerValidation.valid}`
        };
    } catch (error) {
        console.error('Error comparing joker to numbered card:', error.message);
        return {
            equivalent: false,
            reason: `Comparison error: ${error.message}`
        };
    }
}

// Validate joker movement step follows numbered card step rules
function validateJokerStepAgainstNumberedCardRules(fromPosition, toPosition, jokerState) {
    console.log('Validating joker step against numbered card rules');
    
    try {
        // Use existing numbered card validation functions
        const orthogonalCheck = isOrthogonalStep(fromPosition, toPosition);
        const revisitCheck = isValidNextPosition(jokerState.movePath, toPosition);
        const occupiedCheck = isPositionOccupied(toPosition, gameState.board, gameState.players);
        const collapsedCheck = isCardCollapsed(toPosition, gameState.board);
        
        const stepValid = orthogonalCheck.valid && 
                         revisitCheck.valid && 
                         !occupiedCheck.occupied && 
                         !collapsedCheck.collapsed;
        
        return {
            valid: stepValid,
            orthogonal: orthogonalCheck.valid,
            notRevisited: revisitCheck.valid,
            notOccupied: !occupiedCheck.occupied,
            notCollapsed: !collapsedCheck.collapsed,
            reason: stepValid ?
                'Joker step follows all numbered card rules' :
                `Invalid step: ${!orthogonalCheck.valid ? 'not orthogonal; ' : ''}${!revisitCheck.valid ? 'revisited position; ' : ''}${occupiedCheck.occupied ? 'position occupied; ' : ''}${collapsedCheck.collapsed ? 'card collapsed' : ''}`
        };
    } catch (error) {
        console.error('Error validating joker step:', error.message);
        return {
            valid: false,
            reason: `Step validation error: ${error.message}`
        };
    }
}

// Comprehensive joker movement validation using all numbered card rules
function validateJokerMovementComprehensive(jokerState) {
    console.log('Running comprehensive joker movement validation');
    
    try {
        if (!jokerState || !jokerState.isActive) {
            return {
                valid: false,
                reason: 'No active joker movement'
            };
        }
        
        const results = {
            pathValidation: validateJokerMovementPath(jokerState),
            numberedCardComparison: compareJokerToNumberedCardMovement(jokerState),
            stepByStepValidation: { valid: true, invalidSteps: [] }
        };
        
        // Validate each step individually
        for (let i = 1; i < jokerState.movePath.length; i++) {
            const stepValidation = validateJokerStepAgainstNumberedCardRules(
                jokerState.movePath[i - 1],
                jokerState.movePath[i],
                jokerState
            );
            
            if (!stepValidation.valid) {
                results.stepByStepValidation.valid = false;
                results.stepByStepValidation.invalidSteps.push({
                    stepIndex: i,
                    fromPosition: jokerState.movePath[i - 1],
                    toPosition: jokerState.movePath[i],
                    validation: stepValidation
                });
            }
        }
        
        const overallValid = results.pathValidation.valid && 
                           results.numberedCardComparison.equivalent && 
                           results.stepByStepValidation.valid;
        
        return {
            valid: overallValid,
            results: results,
            reason: overallValid ?
                'Joker movement passes all numbered card rule validations' :
                'Joker movement violates numbered card rules',
            distance: jokerState.movePath.length - 1,
            totalSteps: jokerState.movePath.length - 1
        };
    } catch (error) {
        console.error('Error in comprehensive joker validation:', error.message);
        return {
            valid: false,
            reason: `Comprehensive validation error: ${error.message}`
        };
    }
}