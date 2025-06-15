// Collapsi Game - Optimized Validation
// Performance-optimized validation functions for <100ms validation

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