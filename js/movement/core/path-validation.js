// Collapsi Game - Path Validation
// Core path validation logic including orthogonal movement and revisit prevention

// Check if a single movement step is orthogonal (up/down/left/right only)
function isOrthogonalStep(fromPosition, toPosition) {
    console.log(`Checking orthogonal step from ${JSON.stringify(fromPosition)} to ${JSON.stringify(toPosition)}`);
    
    try {
        if (!fromPosition || !toPosition) {
            throw new Error('Both from and to positions are required');
        }
        
        if (typeof fromPosition.row !== 'number' || typeof fromPosition.col !== 'number' ||
            typeof toPosition.row !== 'number' || typeof toPosition.col !== 'number') {
            throw new Error('Position coordinates must be numbers');
        }
        
        const rowDiff = Math.abs(toPosition.row - fromPosition.row);
        const colDiff = Math.abs(toPosition.col - fromPosition.col);
        
        // Valid orthogonal move: exactly one coordinate changes by exactly 1
        // OR wraparound move (coordinate difference of 3 on a 4x4 board)
        const isOrthogonal = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1) ||
                            (rowDiff === 3 && colDiff === 0) || (rowDiff === 0 && colDiff === 3);
        
        return {
            valid: isOrthogonal,
            rowDiff,
            colDiff,
            reason: isOrthogonal ? 
                'Valid orthogonal movement' : 
                `Invalid movement: diagonal or multi-space step (row diff: ${rowDiff}, col diff: ${colDiff})`
        };
    } catch (error) {
        console.error('Error checking orthogonal step:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Validate that a complete movement path consists only of orthogonal steps
function validateOrthogonalPath(path) {
    console.log('Validating orthogonal path:', path);
    
    try {
        if (!path || !Array.isArray(path)) {
            throw new Error('Path must be an array of positions');
        }
        
        if (path.length < 2) {
            return {
                valid: true,
                reason: 'Path too short to validate (less than 2 positions)'
            };
        }
        
        // Check each step in the path
        for (let i = 0; i < path.length - 1; i++) {
            const fromPos = path[i];
            const toPos = path[i + 1];
            
            const stepValidation = isOrthogonalStep(fromPos, toPos);
            if (!stepValidation.valid) {
                return {
                    valid: false,
                    failedStep: i + 1,
                    reason: `Step ${i + 1} invalid: ${stepValidation.reason}`
                };
            }
        }
        
        return {
            valid: true,
            totalSteps: path.length - 1,
            reason: `All ${path.length - 1} steps are valid orthogonal movements`
        };
    } catch (error) {
        console.error('Error validating orthogonal path:', error.message);
        return {
            valid: false,
            reason: `Path validation error: ${error.message}`
        };
    }
}

// Check if a position has already been visited in the current path
function isPositionVisited(position, visitedPositions) {
    try {
        if (!position || !Array.isArray(visitedPositions)) {
            throw new Error('Position and visited positions array are required');
        }
        
        // Check if this exact position exists in the visited list
        return visitedPositions.some(visited => 
            visited.row === position.row && visited.col === position.col
        );
    } catch (error) {
        console.error('Error checking if position is visited:', error.message);
        return true; // Default to "visited" to prevent invalid moves
    }
}

// Validate that a path doesn't revisit any cards during a single turn
function validateNoRevisitedCards(path) {
    console.log('Validating path for revisited cards:', path);
    
    try {
        if (!path || !Array.isArray(path)) {
            throw new Error('Path must be an array of positions');
        }
        
        if (path.length <= 1) {
            return {
                valid: true,
                reason: 'Path too short to have revisited cards'
            };
        }
        
        const visitedPositions = new Set();
        
        // Check each position in the path
        for (let i = 0; i < path.length; i++) {
            const position = path[i];
            
            if (!position || typeof position.row !== 'number' || typeof position.col !== 'number') {
                return {
                    valid: false,
                    reason: `Invalid position at step ${i}: ${JSON.stringify(position)}`
                };
            }
            
            // Create a unique key for this position
            const positionKey = `${position.row},${position.col}`;
            
            // Check if we've already visited this position
            if (visitedPositions.has(positionKey)) {
                return {
                    valid: false,
                    revisitedPosition: position,
                    revisitedAtStep: i,
                    reason: `Position ${JSON.stringify(position)} revisited at step ${i}`
                };
            }
            
            // Add this position to visited set
            visitedPositions.add(positionKey);
        }
        
        return {
            valid: true,
            totalUniquePositions: visitedPositions.size,
            reason: `Path valid: ${visitedPositions.size} unique positions, no revisits`
        };
    } catch (error) {
        console.error('Error validating path for revisited cards:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Get all positions that would be invalid to visit next (already visited)
function getInvalidNextPositions(currentPath) {
    console.log('Getting invalid next positions for current path:', currentPath);
    
    try {
        if (!currentPath || !Array.isArray(currentPath)) {
            return [];
        }
        
        // Return all positions already in the path
        return currentPath.map(pos => ({
            row: pos.row,
            col: pos.col,
            reason: 'Already visited in current turn'
        }));
    } catch (error) {
        console.error('Error getting invalid next positions:', error.message);
        return [];
    }
}

// Check if a proposed next position is valid (not already visited)
function isValidNextPosition(currentPath, proposedPosition) {
    console.log(`Checking if position ${JSON.stringify(proposedPosition)} is valid for path:`, currentPath);
    
    try {
        if (!proposedPosition || typeof proposedPosition.row !== 'number' || typeof proposedPosition.col !== 'number') {
            return {
                valid: false,
                reason: 'Invalid proposed position'
            };
        }
        
        if (!currentPath || !Array.isArray(currentPath)) {
            return {
                valid: true,
                reason: 'No current path to check against'
            };
        }
        
        // Check if the proposed position has already been visited
        const alreadyVisited = currentPath.some(pos => 
            pos.row === proposedPosition.row && pos.col === proposedPosition.col
        );
        
        return {
            valid: !alreadyVisited,
            reason: alreadyVisited ? 
                `Position ${JSON.stringify(proposedPosition)} already visited in current turn` :
                'Position not yet visited, valid to move to'
        };
    } catch (error) {
        console.error('Error checking if next position is valid:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Create a comprehensive path validation function
function validateCompletePath(path) {
    console.log('Running comprehensive path validation:', path);
    
    try {
        if (!path || !Array.isArray(path)) {
            return {
                valid: false,
                reason: 'Path must be an array'
            };
        }
        
        if (path.length < 2) {
            return {
                valid: true,
                reason: 'Path too short to validate'
            };
        }
        
        // Run all validation checks
        const orthogonalCheck = validateOrthogonalPath(path);
        const revisitCheck = validateNoRevisitedCards(path);
        
        // Combine results
        const isValid = orthogonalCheck.valid && revisitCheck.valid;
        
        return {
            valid: isValid,
            orthogonalValid: orthogonalCheck.valid,
            noRevisitsValid: revisitCheck.valid,
            pathLength: path.length,
            totalSteps: path.length - 1,
            reason: isValid ? 
                'Path passes all validation checks' :
                `Path validation failed: ${!orthogonalCheck.valid ? orthogonalCheck.reason : ''} ${!revisitCheck.valid ? revisitCheck.reason : ''}`
        };
    } catch (error) {
        console.error('Error in comprehensive path validation:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}