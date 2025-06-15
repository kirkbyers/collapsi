// Collapsi Game - UI Interactions and Path Visualization
// Phase 3: Path Visualization and UI Feedback

// Path Visualization Functions (Task 3.1)

// Clear all path highlighting from the board
function clearPathHighlighting() {
    console.log('Clearing all path highlighting');
    
    try {
        const allCards = document.querySelectorAll('.card');
        
        allCards.forEach(card => {
            // Remove all path-related classes
            card.classList.remove(
                'path-start', 'path-step', 'path-end',
                'joker-path-start', 'joker-path-step', 'joker-path-end',
                'from-up', 'from-down', 'from-left', 'from-right',
                'path-clearing'
            );
            
            // Remove step number data attribute
            card.removeAttribute('data-step-number');
            
            // Reset any custom background color variables
            card.style.removeProperty('--card-bg-color');
        });
        
        console.log('Path highlighting cleared');
        return true;
    } catch (error) {
        console.error('Error clearing path highlighting:', error.message);
        return false;
    }
}

// Get direction class based on movement vector
function getDirectionClass(fromPosition, toPosition) {
    try {
        const rowDiff = toPosition.row - fromPosition.row;
        const colDiff = toPosition.col - fromPosition.col;
        
        // Handle wraparound cases
        if (Math.abs(rowDiff) === 3) {
            return rowDiff === 3 ? 'from-down' : 'from-up';
        }
        if (Math.abs(colDiff) === 3) {
            return colDiff === 3 ? 'from-right' : 'from-left';
        }
        
        // Normal adjacent movement
        if (rowDiff === -1) return 'from-up';
        if (rowDiff === 1) return 'from-down';
        if (colDiff === -1) return 'from-left';
        if (colDiff === 1) return 'from-right';
        
        return '';
    } catch (error) {
        console.error('Error getting direction class:', error.message);
        return '';
    }
}

// Highlight a complete movement path
function highlightMovementPath(path, isJokerPath = false) {
    console.log('Highlighting movement path:', path, 'isJoker:', isJokerPath);
    
    try {
        if (!path || !Array.isArray(path) || path.length < 2) {
            console.warn('Invalid path provided for highlighting');
            return false;
        }
        
        // Clear existing path highlighting
        clearPathHighlighting();
        
        const pathPrefix = isJokerPath ? 'joker-path' : 'path';
        
        // Highlight each position in the path
        for (let i = 0; i < path.length; i++) {
            const position = path[i];
            const cardElement = document.querySelector(`[data-row="${position.row}"][data-col="${position.col}"]`);
            
            if (!cardElement) {
                console.warn(`Card element not found at position (${position.row}, ${position.col})`);
                continue;
            }
            
            // Store original background color for gradient effect
            const computedStyle = window.getComputedStyle(cardElement);
            const bgColor = computedStyle.backgroundColor;
            cardElement.style.setProperty('--card-bg-color', bgColor);
            
            if (i === 0) {
                // Starting position
                cardElement.classList.add(`${pathPrefix}-start`);
            } else if (i === path.length - 1) {
                // Ending position
                cardElement.classList.add(`${pathPrefix}-end`);
                
                // Add direction indicator for the final step
                if (i > 0) {
                    const directionClass = getDirectionClass(path[i - 1], position);
                    if (directionClass) {
                        cardElement.classList.add(directionClass);
                    }
                }
            } else {
                // Intermediate step
                cardElement.classList.add(`${pathPrefix}-step`);
                cardElement.setAttribute('data-step-number', i.toString());
                
                // Add direction indicator
                const directionClass = getDirectionClass(path[i - 1], position);
                if (directionClass) {
                    cardElement.classList.add(directionClass);
                }
            }
        }
        
        console.log(`Path highlighted successfully: ${path.length} positions`);
        return true;
    } catch (error) {
        console.error('Error highlighting movement path:', error.message);
        return false;
    }
}

// Highlight path with animation sequence
function highlightPathWithAnimation(path, isJokerPath = false, animationDelay = 100) {
    console.log('Highlighting path with animation');
    
    try {
        if (!path || path.length < 2) {
            return false;
        }
        
        // Clear existing highlighting
        clearPathHighlighting();
        
        const pathPrefix = isJokerPath ? 'joker-path' : 'path';
        
        // Animate each step with delay
        path.forEach((position, index) => {
            setTimeout(() => {
                const cardElement = document.querySelector(`[data-row="${position.row}"][data-col="${position.col}"]`);
                
                if (cardElement) {
                    // Store background color
                    const computedStyle = window.getComputedStyle(cardElement);
                    const bgColor = computedStyle.backgroundColor;
                    cardElement.style.setProperty('--card-bg-color', bgColor);
                    
                    if (index === 0) {
                        cardElement.classList.add(`${pathPrefix}-start`);
                    } else if (index === path.length - 1) {
                        cardElement.classList.add(`${pathPrefix}-end`);
                        if (index > 0) {
                            const directionClass = getDirectionClass(path[index - 1], position);
                            if (directionClass) {
                                cardElement.classList.add(directionClass);
                            }
                        }
                    } else {
                        cardElement.classList.add(`${pathPrefix}-step`);
                        cardElement.setAttribute('data-step-number', index.toString());
                        const directionClass = getDirectionClass(path[index - 1], position);
                        if (directionClass) {
                            cardElement.classList.add(directionClass);
                        }
                    }
                }
            }, index * animationDelay);
        });
        
        return true;
    } catch (error) {
        console.error('Error highlighting path with animation:', error.message);
        return false;
    }
}

// Generate path between two positions (for preview)
function generatePathBetweenPositions(startPosition, endPosition, distance) {
    console.log('Generating path between positions:', startPosition, endPosition, 'distance:', distance);
    
    try {
        if (!startPosition || !endPosition || distance < 1) {
            return [];
        }
        
        // This is a simplified path generation for preview purposes
        // In a real implementation, this would use the movement validation system
        const path = [{ ...startPosition }];
        let currentPos = { ...startPosition };
        
        // Calculate simple orthogonal path (this is a basic implementation)
        const rowDiff = endPosition.row - startPosition.row;
        const colDiff = endPosition.col - startPosition.col;
        
        // Move horizontally first, then vertically (simple pathfinding)
        let steps = 0;
        
        // Handle wraparound movements
        
        while (steps < distance && (currentPos.row !== endPosition.row || currentPos.col !== endPosition.col)) {
            let nextPos = { ...currentPos };
            
            if (currentPos.col !== endPosition.col) {
                // Move horizontally
                if (colDiff > 0) {
                    nextPos.col = (currentPos.col + 1) % 4;
                } else {
                    nextPos.col = (currentPos.col - 1 + 4) % 4;
                }
            } else if (currentPos.row !== endPosition.row) {
                // Move vertically
                if (rowDiff > 0) {
                    nextPos.row = (currentPos.row + 1) % 4;
                } else {
                    nextPos.row = (currentPos.row - 1 + 4) % 4;
                }
            }
            
            currentPos = nextPos;
            path.push({ ...currentPos });
            steps++;
            
            // Prevent infinite loops
            if (path.length > 10) break;
        }
        
        console.log('Generated path:', path);
        return path;
    } catch (error) {
        console.error('Error generating path:', error.message);
        return [];
    }
}

// Preview a potential movement path
function previewMovementPath(startPosition, endPosition, distance, isJokerPath = false) {
    console.log('Previewing movement path');
    
    try {
        const path = generatePathBetweenPositions(startPosition, endPosition, distance);
        
        if (path.length > 0) {
            return highlightMovementPath(path, isJokerPath);
        }
        
        return false;
    } catch (error) {
        console.error('Error previewing movement path:', error.message);
        return false;
    }
}

// Highlight joker movement path from state
function highlightJokerMovementPath(jokerState) {
    console.log('Highlighting joker movement path from state');
    
    try {
        if (!jokerState || !jokerState.movePath || jokerState.movePath.length < 1) {
            console.warn('Invalid joker state for path highlighting');
            return false;
        }
        
        return highlightMovementPath(jokerState.movePath, true);
    } catch (error) {
        console.error('Error highlighting joker movement path:', error.message);
        return false;
    }
}

// Clear path highlighting with fade animation
function clearPathHighlightingWithAnimation() {
    console.log('Clearing path highlighting with animation');
    
    try {
        const pathElements = document.querySelectorAll('.card.path-start, .card.path-step, .card.path-end, .card.joker-path-start, .card.joker-path-step, .card.joker-path-end');
        
        // Add clearing animation
        pathElements.forEach(element => {
            element.classList.add('path-clearing');
        });
        
        // Remove all classes after animation completes
        setTimeout(() => {
            clearPathHighlighting();
        }, 300);
        
        return true;
    } catch (error) {
        console.error('Error clearing path highlighting with animation:', error.message);
        clearPathHighlighting(); // Fallback to immediate clear
        return false;
    }
}

// Get all cards currently highlighted in a path
function getHighlightedPathCards() {
    try {
        const pathCards = document.querySelectorAll('.card.path-start, .card.path-step, .card.path-end, .card.joker-path-start, .card.joker-path-step, .card.joker-path-end');
        
        const positions = Array.from(pathCards).map(card => ({
            row: parseInt(card.getAttribute('data-row')),
            col: parseInt(card.getAttribute('data-col')),
            element: card
        }));
        
        // Sort by step number for path reconstruction
        positions.sort((a, b) => {
            const stepA = parseInt(a.element.getAttribute('data-step-number')) || 0;
            const stepB = parseInt(b.element.getAttribute('data-step-number')) || 0;
            return stepA - stepB;
        });
        
        return positions;
    } catch (error) {
        console.error('Error getting highlighted path cards:', error.message);
        return [];
    }
}

// Update path highlighting for numbered card movement
function updateNumberedCardPathHighlighting(startPosition, currentPath, targetDistance) {
    console.log('Updating numbered card path highlighting');
    
    try {
        if (!startPosition || !currentPath || currentPath.length === 0) {
            clearPathHighlighting();
            return false;
        }
        
        // If path is complete (matches target distance), highlight it
        if (currentPath.length - 1 === targetDistance) {
            return highlightMovementPath(currentPath, false);
        }
        
        // If path is in progress, show partial highlighting
        if (currentPath.length > 1) {
            return highlightMovementPath(currentPath, false);
        }
        
        return false;
    } catch (error) {
        console.error('Error updating numbered card path highlighting:', error.message);
        return false;
    }
}

// Path visualization performance tracking
const pathVisualizationPerformance = {
    lastUpdate: 0,
    updateCount: 0,
    
    startTracking() {
        this.lastUpdate = performance.now();
        this.updateCount++;
    },
    
    endTracking() {
        const duration = performance.now() - this.lastUpdate;
        console.log(`Path visualization update ${this.updateCount} took ${duration.toFixed(2)}ms`);
        
        if (duration > 50) {
            console.warn(`Path visualization update exceeded 50ms target: ${duration.toFixed(2)}ms`);
        }
        
        return duration;
    }
};

console.log('Path visualization functions loaded');