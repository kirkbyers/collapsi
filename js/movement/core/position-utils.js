// Collapsi Game - Position Utilities
// Position calculations, wraparound logic, and adjacency functions

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