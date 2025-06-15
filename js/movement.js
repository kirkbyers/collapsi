// Collapsi Game - Movement Validation System
// Phase 3: Player Movement Logic

// Movement validation functions for Phase 3

// Get the movement distance value for a card type
function getCardMovementDistance(cardType) {
    console.log(`Getting movement distance for card type: ${cardType}`);
    
    try {
        if (!cardType) {
            throw new Error('Card type is required');
        }
        
        // Jokers allow flexible movement (1-4 spaces)
        if (cardType === 'red-joker' || cardType === 'black-joker') {
            return { type: 'joker', allowedDistances: [1, 2, 3, 4] };
        }
        
        // Numbered cards require exact movement
        switch (cardType) {
            case 'A':
                return { type: 'fixed', distance: 1 };
            case '2':
                return { type: 'fixed', distance: 2 };
            case '3':
                return { type: 'fixed', distance: 3 };
            case '4':
                return { type: 'fixed', distance: 4 };
            default:
                throw new Error(`Unknown card type: ${cardType}`);
        }
    } catch (error) {
        console.error('Error getting card movement distance:', error.message);
        return null;
    }
}

// Validate that a movement distance matches the starting card requirements
function validateMovementDistance(startingCardType, plannedDistance) {
    console.log(`Validating movement distance: ${plannedDistance} for card type: ${startingCardType}`);
    
    try {
        if (!startingCardType || typeof plannedDistance !== 'number') {
            throw new Error('Starting card type and planned distance are required');
        }
        
        if (plannedDistance < 1 || plannedDistance > 4) {
            return {
                valid: false,
                reason: `Invalid distance: ${plannedDistance}. Must be between 1 and 4.`
            };
        }
        
        const cardMovement = getCardMovementDistance(startingCardType);
        if (!cardMovement) {
            return {
                valid: false,
                reason: `Unable to determine movement rules for card type: ${startingCardType}`
            };
        }
        
        // Handle joker cards (flexible movement)
        if (cardMovement.type === 'joker') {
            const isValidJokerDistance = cardMovement.allowedDistances.includes(plannedDistance);
            return {
                valid: isValidJokerDistance,
                reason: isValidJokerDistance ? 
                    `Valid joker movement: ${plannedDistance} spaces` :
                    `Invalid joker movement: ${plannedDistance}. Must be 1, 2, 3, or 4 spaces.`
            };
        }
        
        // Handle fixed distance cards (exact movement required)
        if (cardMovement.type === 'fixed') {
            const isExactMatch = cardMovement.distance === plannedDistance;
            return {
                valid: isExactMatch,
                reason: isExactMatch ?
                    `Valid exact movement: ${plannedDistance} spaces` :
                    `Invalid movement: ${plannedDistance}. Card '${startingCardType}' requires exactly ${cardMovement.distance} spaces.`
            };
        }
        
        return {
            valid: false,
            reason: `Unknown movement type for card: ${startingCardType}`
        };
    } catch (error) {
        console.error('Error validating movement distance:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Orthogonal movement validation functions

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
        const isOrthogonal = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
        
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

// Get the direction of movement between two adjacent positions
function getMovementDirection(fromPosition, toPosition) {
    try {
        if (!fromPosition || !toPosition) {
            throw new Error('Both positions are required');
        }
        
        const rowDiff = toPosition.row - fromPosition.row;
        const colDiff = toPosition.col - fromPosition.col;
        
        // Check for valid orthogonal movement
        if (Math.abs(rowDiff) + Math.abs(colDiff) !== 1) {
            return {
                valid: false,
                reason: 'Not an adjacent orthogonal movement'
            };
        }
        
        // Determine direction
        if (rowDiff === -1) return { valid: true, direction: 'up', vector: { row: -1, col: 0 } };
        if (rowDiff === 1) return { valid: true, direction: 'down', vector: { row: 1, col: 0 } };
        if (colDiff === -1) return { valid: true, direction: 'left', vector: { row: 0, col: -1 } };
        if (colDiff === 1) return { valid: true, direction: 'right', vector: { row: 0, col: 1 } };
        
        return {
            valid: false,
            reason: 'Unable to determine movement direction'
        };
    } catch (error) {
        console.error('Error getting movement direction:', error.message);
        return {
            valid: false,
            reason: `Direction error: ${error.message}`
        };
    }
}

// Wraparound edge calculation functions

// Calculate the next position with wraparound for a 4x4 board
function calculateWraparoundPosition(position, direction) {
    console.log(`Calculating wraparound position from ${JSON.stringify(position)} in direction: ${direction}`);
    
    try {
        if (!position || typeof position.row !== 'number' || typeof position.col !== 'number') {
            throw new Error('Invalid position provided');
        }
        
        if (position.row < 0 || position.row >= 4 || position.col < 0 || position.col >= 4) {
            throw new Error(`Position out of bounds: ${JSON.stringify(position)}`);
        }
        
        let newRow = position.row;
        let newCol = position.col;
        
        // Apply direction movement with wraparound using modulo arithmetic
        switch (direction) {
            case 'up':
                newRow = (position.row - 1 + 4) % 4; // Wrap from row 0 to row 3
                break;
            case 'down':
                newRow = (position.row + 1) % 4; // Wrap from row 3 to row 0
                break;
            case 'left':
                newCol = (position.col - 1 + 4) % 4; // Wrap from col 0 to col 3
                break;
            case 'right':
                newCol = (position.col + 1) % 4; // Wrap from col 3 to col 0
                break;
            default:
                throw new Error(`Invalid direction: ${direction}`);
        }
        
        const wrappedPosition = { row: newRow, col: newCol };
        const didWrap = newRow !== position.row + (direction === 'up' ? -1 : direction === 'down' ? 1 : 0) ||
                       newCol !== position.col + (direction === 'left' ? -1 : direction === 'right' ? 1 : 0);
        
        console.log(`Wraparound result: ${JSON.stringify(wrappedPosition)}, wrapped: ${didWrap}`);
        
        return {
            position: wrappedPosition,
            wrapped: didWrap,
            direction: direction
        };
    } catch (error) {
        console.error('Error calculating wraparound position:', error.message);
        return null;
    }
}

// Check if a movement step involves wraparound
function isWraparoundStep(fromPosition, toPosition) {
    console.log(`Checking wraparound step from ${JSON.stringify(fromPosition)} to ${JSON.stringify(toPosition)}`);
    
    try {
        if (!fromPosition || !toPosition) {
            throw new Error('Both positions are required');
        }
        
        // Check if positions are adjacent considering wraparound
        const rowDiff = toPosition.row - fromPosition.row;
        const colDiff = toPosition.col - fromPosition.col;
        
        // Check for direct adjacency (no wraparound)
        if ((Math.abs(rowDiff) === 1 && colDiff === 0) || (rowDiff === 0 && Math.abs(colDiff) === 1)) {
            return {
                isWraparound: false,
                direction: getMovementDirection(fromPosition, toPosition).direction,
                reason: 'Direct adjacent movement, no wraparound'
            };
        }
        
        // Check for wraparound adjacency
        const isVerticalWrap = (rowDiff === 3 || rowDiff === -3) && colDiff === 0;
        const isHorizontalWrap = rowDiff === 0 && (colDiff === 3 || colDiff === -3);
        
        if (isVerticalWrap) {
            const direction = rowDiff === 3 ? 'up' : 'down'; // 3 -> -1 (up), -3 -> 1 (down) 
            return {
                isWraparound: true,
                direction: direction,
                reason: `Vertical wraparound: ${direction}`
            };
        }
        
        if (isHorizontalWrap) {
            const direction = colDiff === 3 ? 'left' : 'right'; // 3 -> -1 (left), -3 -> 1 (right)
            return {
                isWraparound: true,
                direction: direction,
                reason: `Horizontal wraparound: ${direction}`
            };
        }
        
        return {
            isWraparound: false,
            direction: null,
            reason: 'Not an adjacent movement (with or without wraparound)'
        };
    } catch (error) {
        console.error('Error checking wraparound step:', error.message);
        return {
            isWraparound: false,
            direction: null,
            reason: `Error: ${error.message}`
        };
    }
}

// Get all possible adjacent positions from a given position including wraparound
function getAdjacentPositions(position) {
    console.log(`Getting adjacent positions for ${JSON.stringify(position)}`);
    
    try {
        if (!position || typeof position.row !== 'number' || typeof position.col !== 'number') {
            throw new Error('Invalid position provided');
        }
        
        const directions = ['up', 'down', 'left', 'right'];
        const adjacentPositions = [];
        
        directions.forEach(direction => {
            const result = calculateWraparoundPosition(position, direction);
            if (result) {
                adjacentPositions.push({
                    position: result.position,
                    direction: direction,
                    wrapped: result.wrapped
                });
            }
        });
        
        console.log(`Found ${adjacentPositions.length} adjacent positions:`, adjacentPositions);
        return adjacentPositions;
    } catch (error) {
        console.error('Error getting adjacent positions:', error.message);
        return [];
    }
}

// Path validation functions to prevent revisiting cards

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

// Validation functions for starting card and occupied positions

// Check if a position is occupied by a player
function isPositionOccupied(position, gameBoard, players) {
    console.log(`Checking if position ${JSON.stringify(position)} is occupied`);
    
    try {
        if (!position || typeof position.row !== 'number' || typeof position.col !== 'number') {
            throw new Error('Invalid position provided');
        }
        
        if (!players || !Array.isArray(players)) {
            return {
                occupied: false,
                reason: 'No players provided'
            };
        }
        
        // Check if any player is at this position
        const occupyingPlayer = players.find(player => 
            player.position && 
            player.position.row === position.row && 
            player.position.col === position.col
        );
        
        if (occupyingPlayer) {
            return {
                occupied: true,
                occupiedBy: occupyingPlayer.id,
                reason: `Position occupied by player: ${occupyingPlayer.id}`
            };
        }
        
        // Also check the board state for hasPlayer flag if available
        if (gameBoard && gameBoard[position.row] && gameBoard[position.row][position.col]) {
            const card = gameBoard[position.row][position.col];
            if (card.hasPlayer) {
                return {
                    occupied: true,
                    occupiedBy: card.playerId || 'unknown',
                    reason: `Position marked as occupied on board by: ${card.playerId || 'unknown'}`
                };
            }
        }
        
        return {
            occupied: false,
            reason: 'Position is not occupied'
        };
    } catch (error) {
        console.error('Error checking if position is occupied:', error.message);
        return {
            occupied: true, // Default to occupied to prevent invalid moves
            reason: `Error checking occupation: ${error.message}`
        };
    }
}

// Validate that move doesn't end on starting card
function validateNotEndingOnStartingCard(startingPosition, endingPosition) {
    console.log(`Validating move doesn't end on starting card: start ${JSON.stringify(startingPosition)}, end ${JSON.stringify(endingPosition)}`);
    
    try {
        if (!startingPosition || !endingPosition) {
            throw new Error('Both starting and ending positions are required');
        }
        
        const isSamePosition = startingPosition.row === endingPosition.row && 
                              startingPosition.col === endingPosition.col;
        
        return {
            valid: !isSamePosition,
            reason: isSamePosition ? 
                'Cannot end move on starting card' :
                'Move ending position is different from starting position'
        };
    } catch (error) {
        console.error('Error validating ending position:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Validate that move doesn't end on an occupied position
function validateNotEndingOnOccupiedPosition(endingPosition, gameBoard, players, currentPlayerId) {
    console.log(`Validating move doesn't end on occupied position: ${JSON.stringify(endingPosition)}`);
    
    try {
        if (!endingPosition || typeof endingPosition.row !== 'number' || typeof endingPosition.col !== 'number') {
            throw new Error('Valid ending position is required');
        }
        
        const occupationCheck = isPositionOccupied(endingPosition, gameBoard, players);
        
        // If not occupied, move is valid
        if (!occupationCheck.occupied) {
            return {
                valid: true,
                reason: 'Position is not occupied'
            };
        }
        
        // If occupied by current player, that should not happen in normal gameplay but check anyway
        if (occupationCheck.occupiedBy === currentPlayerId) {
            return {
                valid: false,
                reason: `Cannot end on position occupied by current player: ${currentPlayerId}`
            };
        }
        
        // If occupied by opponent, move is invalid
        return {
            valid: false,
            occupiedBy: occupationCheck.occupiedBy,
            reason: `Position occupied by opponent: ${occupationCheck.occupiedBy}`
        };
    } catch (error) {
        console.error('Error validating ending on occupied position:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Comprehensive move ending validation
function validateMoveEnding(startingPosition, endingPosition, gameBoard, players, currentPlayerId) {
    console.log(`Comprehensive move ending validation from ${JSON.stringify(startingPosition)} to ${JSON.stringify(endingPosition)}`);
    
    try {
        // Check starting card rule
        const startingCardCheck = validateNotEndingOnStartingCard(startingPosition, endingPosition);
        
        // Check occupied position rule
        const occupiedCheck = validateNotEndingOnOccupiedPosition(endingPosition, gameBoard, players, currentPlayerId);
        
        // Combine results
        const isValid = startingCardCheck.valid && occupiedCheck.valid;
        
        return {
            valid: isValid,
            startingCardValid: startingCardCheck.valid,
            occupiedPositionValid: occupiedCheck.valid,
            occupiedBy: occupiedCheck.occupiedBy,
            reason: isValid ? 
                'Move ending position is valid' :
                `Move ending invalid: ${!startingCardCheck.valid ? startingCardCheck.reason : ''} ${!occupiedCheck.valid ? occupiedCheck.reason : ''}`
        };
    } catch (error) {
        console.error('Error in comprehensive move ending validation:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Check if a position has a collapsed card (face-down)
function isCardCollapsed(position, gameBoard) {
    try {
        if (!position || !gameBoard) {
            return {
                collapsed: false,
                reason: 'Position or board not provided'
            };
        }
        
        if (position.row < 0 || position.row >= 4 || position.col < 0 || position.col >= 4) {
            return {
                collapsed: false,
                reason: 'Position out of bounds'
            };
        }
        
        const card = gameBoard[position.row] && gameBoard[position.row][position.col];
        if (!card) {
            return {
                collapsed: false,
                reason: 'Card not found at position'
            };
        }
        
        return {
            collapsed: card.collapsed || false,
            cardType: card.type,
            reason: card.collapsed ? 'Card is collapsed (face-down)' : 'Card is not collapsed'
        };
    } catch (error) {
        console.error('Error checking if card is collapsed:', error.message);
        return {
            collapsed: true, // Default to collapsed to prevent invalid moves
            reason: `Error checking collapse state: ${error.message}`
        };
    }
}

// Performance optimization functions for <100ms validation

// Optimized move validation with early exit and caching
function validateMoveOptimized(startingPosition, path, distance, startingCardType, gameBoard, players, currentPlayerId) {
    const startTime = performance.now();
    console.log('Starting optimized move validation');
    
    try {
        if (!startingPosition || !path || !Array.isArray(path) || path.length < 2) {
            return {
                valid: false,
                reason: 'Invalid input parameters',
                executionTime: performance.now() - startTime
            };
        }
        
        // Early validation checks (fastest first)
        
        // 1. Quick distance check (no complex path walking needed)
        const distanceValidation = validateMovementDistance(startingCardType, distance);
        if (!distanceValidation.valid) {
            return {
                valid: false,
                reason: distanceValidation.reason,
                executionTime: performance.now() - startTime
            };
        }
        
        // 2. Quick ending position check (before full path validation)
        const endingPosition = path[path.length - 1];
        const endingValidation = validateMoveEnding(startingPosition, endingPosition, gameBoard, players, currentPlayerId);
        if (!endingValidation.valid) {
            return {
                valid: false,
                reason: endingValidation.reason,
                executionTime: performance.now() - startTime
            };
        }
        
        // 3. Path length check (should match distance)
        if (path.length - 1 !== distance) {
            return {
                valid: false,
                reason: `Path length ${path.length - 1} doesn't match required distance ${distance}`,
                executionTime: performance.now() - startTime
            };
        }
        
        // 4. Optimized path validation (stop on first error)
        const pathValidation = validateCompletePathOptimized(path);
        if (!pathValidation.valid) {
            return {
                valid: false,
                reason: pathValidation.reason,
                executionTime: performance.now() - startTime
            };
        }
        
        const executionTime = performance.now() - startTime;
        console.log(`Optimized validation completed in ${executionTime.toFixed(2)}ms`);
        
        return {
            valid: true,
            reason: 'All validations passed',
            executionTime: executionTime,
            pathLength: path.length,
            distance: distance
        };
    } catch (error) {
        const executionTime = performance.now() - startTime;
        console.error('Error in optimized move validation:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`,
            executionTime: executionTime
        };
    }
}

// Optimized path validation with early exit
function validateCompletePathOptimized(path) {
    try {
        if (!path || path.length < 2) {
            return { valid: true, reason: 'Path too short to validate' };
        }
        
        const visitedSet = new Set();
        
        // Combined validation loop (single pass)
        for (let i = 0; i < path.length; i++) {
            const position = path[i];
            
            // Validate position format
            if (!position || typeof position.row !== 'number' || typeof position.col !== 'number') {
                return {
                    valid: false,
                    reason: `Invalid position at step ${i}`
                };
            }
            
            // Check for revisits
            const posKey = `${position.row},${position.col}`;
            if (visitedSet.has(posKey)) {
                return {
                    valid: false,
                    reason: `Position revisited at step ${i}`
                };
            }
            visitedSet.add(posKey);
            
            // Check orthogonal movement (if not first position)
            if (i > 0) {
                const prevPos = path[i - 1];
                const rowDiff = Math.abs(position.row - prevPos.row);
                const colDiff = Math.abs(position.col - prevPos.col);
                
                // Quick orthogonal check (direct adjacency or wraparound)
                const isDirect = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
                const isWrap = (rowDiff === 3 && colDiff === 0) || (rowDiff === 0 && colDiff === 3);
                
                if (!isDirect && !isWrap) {
                    return {
                        valid: false,
                        reason: `Invalid orthogonal step at ${i}`
                    };
                }
            }
        }
        
        return {
            valid: true,
            reason: `Path valid: ${path.length - 1} steps`
        };
    } catch (error) {
        return {
            valid: false,
            reason: `Path validation error: ${error.message}`
        };
    }
}

// Performance benchmark function
function benchmarkValidationPerformance() {
    console.log('Running validation performance benchmarks...');
    
    const testCases = [
        {
            name: 'Short path (1 step)',
            path: [{row: 0, col: 0}, {row: 0, col: 1}],
            distance: 1,
            cardType: 'A'
        },
        {
            name: 'Medium path (3 steps)',
            path: [{row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 1}, {row: 1, col: 2}],
            distance: 3,
            cardType: '3'
        },
        {
            name: 'Long path (4 steps with wraparound)',
            path: [{row: 0, col: 0}, {row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}, {row: 3, col: 3}],
            distance: 4,
            cardType: '4'
        }
    ];
    
    const results = {};
    
    testCases.forEach(testCase => {
        const iterations = 100; // Run multiple times for average
        const times = [];
        
        for (let i = 0; i < iterations; i++) {
            const result = validateMoveOptimized(
                testCase.path[0],
                testCase.path,
                testCase.distance,
                testCase.cardType,
                null, // No board for benchmark
                [], // No players for benchmark
                'test'
            );
            times.push(result.executionTime);
        }
        
        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const maxTime = Math.max(...times);
        const minTime = Math.min(...times);
        
        results[testCase.name] = {
            averageMs: avgTime.toFixed(3),
            maxMs: maxTime.toFixed(3),
            minMs: minTime.toFixed(3),
            under100ms: maxTime < 100
        };
        
        console.log(`${testCase.name}: avg ${avgTime.toFixed(2)}ms, max ${maxTime.toFixed(2)}ms (under 100ms: ${maxTime < 100})`);
    });
    
    const allUnder100 = Object.values(results).every(r => r.under100ms);
    console.log(`\nPerformance target (< 100ms): ${allUnder100 ? 'ACHIEVED' : 'NOT ACHIEVED'}`);
    
    return results;
}

// Cached validation for repeated position checks
const positionValidationCache = new Map();

function isPositionValidCached(position, gameBoard, players, cacheKey) {
    const key = cacheKey || `${position.row},${position.col}`;
    
    if (positionValidationCache.has(key)) {
        return positionValidationCache.get(key);
    }
    
    const result = {
        occupied: isPositionOccupied(position, gameBoard, players).occupied,
        collapsed: gameBoard ? isCardCollapsed(position, gameBoard).collapsed : false
    };
    
    // Cache for short duration (clear on game state change)
    positionValidationCache.set(key, result);
    
    // Auto-clear cache after 1000 entries to prevent memory issues
    if (positionValidationCache.size > 1000) {
        positionValidationCache.clear();
    }
    
    return result;
}

function clearValidationCache() {
    positionValidationCache.clear();
    console.log('Validation cache cleared');
}

// Joker Card Movement Mechanics (Task 2.0)

// Helper function to get card at a position
function getCardAt(position) {
    if (!position || typeof position.row !== 'number' || typeof position.col !== 'number') {
        return null;
    }
    return getCardAtPosition(position.row, position.col);
}

// Initialize joker movement state for a player
function initializeJokerMovement(player, position) {
    console.log(`Initializing joker movement for player ${player.id} at position ${JSON.stringify(position)}`);
    
    try {
        if (!player || !position) {
            throw new Error('Player and position are required');
        }
        
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

// Enhanced early turn completion functionality

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

// Check if joker has valid moves remaining
function hasValidJokerMovesRemaining(jokerState) {
    if (!jokerState || !jokerState.isActive || jokerState.remainingDistance <= 0) {
        return false;
    }
    
    const validNextSteps = getValidJokerMoveSteps(jokerState);
    return validNextSteps.length > 0;
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

// Joker Movement Path Validation (Task 2.4)

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

// Joker Movement State Transitions and Turn Completion (Task 2.5)

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

// Path Visualization Integration (Task 3.1)

// Get visual path for numbered card movement
function getNumberedCardMovementPath(startPosition, distance) {
    console.log(`Getting numbered card movement path: ${distance} spaces from ${JSON.stringify(startPosition)}`);
    
    try {
        // This is a placeholder implementation
        // In a full implementation, this would calculate all possible valid paths
        const possiblePaths = [];
        
        // For now, return a simple straight-line path as an example
        const directions = ['up', 'down', 'left', 'right'];
        
        directions.forEach(direction => {
            const path = [{ ...startPosition }];
            let currentPos = { ...startPosition };
            
            for (let step = 0; step < distance; step++) {
                const nextPos = calculateWraparoundPosition(currentPos, direction);
                if (nextPos) {
                    currentPos = nextPos.position;
                    path.push({ ...currentPos });
                }
            }
            
            if (path.length === distance + 1) {
                possiblePaths.push(path);
            }
        });
        
        // Return the first valid path found
        return possiblePaths.length > 0 ? possiblePaths[0] : [];
    } catch (error) {
        console.error('Error getting numbered card movement path:', error.message);
        return [];
    }
}

// Highlight movement path for current player
function highlightCurrentPlayerMovementPath() {
    console.log('Highlighting current player movement path');
    
    try {
        const currentPlayer = getCurrentPlayer();
        if (!currentPlayer || !currentPlayer.isPlaced()) {
            console.log('No current player or player not placed');
            return false;
        }
        
        const position = currentPlayer.getPosition();
        const card = getCardAt(position);
        
        if (!card) {
            console.log('No card found at current player position');
            return false;
        }
        
        // Check if joker movement is active
        if (gameState.jokerMoveState && gameState.jokerMoveState.isActive) {
            return highlightJokerMovementPath(gameState.jokerMoveState);
        }
        
        // Handle numbered card movement
        const cardMovement = getCardMovementDistance(card.type);
        if (cardMovement && cardMovement.type === 'fixed') {
            const path = getNumberedCardMovementPath(position, cardMovement.distance);
            if (path.length > 0) {
                return highlightMovementPath(path, false);
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error highlighting current player movement path:', error.message);
        return false;
    }
}

// Update path visualization based on game state
function updatePathVisualization() {
    console.log('Updating path visualization');
    
    try {
        pathVisualizationPerformance.startTracking();
        
        // Clear existing path highlighting
        clearPathHighlighting();
        
        // Check if there's an active joker movement
        if (gameState.jokerMoveState && gameState.jokerMoveState.isActive) {
            highlightJokerMovementPath(gameState.jokerMoveState);
        } else {
            // Highlight possible movement for current player
            highlightCurrentPlayerMovementPath();
        }
        
        const duration = pathVisualizationPerformance.endTracking();
        return { success: true, duration: duration };
    } catch (error) {
        console.error('Error updating path visualization:', error.message);
        pathVisualizationPerformance.endTracking();
        return { success: false, error: error.message };
    }
}

// Update both path and destination visualization
function updateAllVisualization() {
    console.log('Updating all visualization (paths and destinations)');
    
    try {
        const startTime = performance.now();
        
        // Update path visualization
        const pathResult = updatePathVisualization();
        
        // Update destination highlighting
        const destResult = updateDestinationHighlighting();
        
        const totalDuration = performance.now() - startTime;
        
        console.log(`Total visualization update took ${totalDuration.toFixed(2)}ms`);
        
        if (totalDuration > 50) {
            console.warn(`Visualization update exceeded 50ms target: ${totalDuration.toFixed(2)}ms`);
        }
        
        return {
            success: pathResult.success && destResult.success,
            pathResult: pathResult,
            destinationResult: destResult,
            totalDuration: totalDuration
        };
    } catch (error) {
        console.error('Error updating all visualization:', error.message);
        return { success: false, error: error.message };
    }
}

// Preview movement to a target position
function previewMovementToPosition(targetPosition) {
    console.log('Previewing movement to position:', targetPosition);
    
    try {
        const currentPlayer = getCurrentPlayer();
        if (!currentPlayer || !currentPlayer.isPlaced()) {
            return false;
        }
        
        const startPosition = currentPlayer.getPosition();
        const card = getCardAt(startPosition);
        
        if (!card) {
            return false;
        }
        
        // Check if joker movement is active
        if (gameState.jokerMoveState && gameState.jokerMoveState.isActive) {
            // For active joker movement, show path from current joker position
            const jokerPath = [...gameState.jokerMoveState.movePath, targetPosition];
            return highlightMovementPath(jokerPath, true);
        }
        
        // For numbered cards, calculate distance and preview path
        const cardMovement = getCardMovementDistance(card.type);
        if (cardMovement && cardMovement.type === 'fixed') {
            return previewMovementPath(startPosition, targetPosition, cardMovement.distance, false);
        }
        
        return false;
    } catch (error) {
        console.error('Error previewing movement to position:', error.message);
        return false;
    }
}