/**
 * Touch Handler - Core touch event handling and pawn selection logic
 * Handles tap events, pawn selection, and board interaction for Collapsi game
 */

// Touch Handler State
const touchHandlerState = {
    selectedPawn: null,
    isThrottled: false,
    throttleDelay: 100, // 100ms throttle to prevent rapid tapping
    lastTouchTime: 0,
    boardElement: null,
    initialized: false
};

// Touch Handler Event Callbacks
const touchHandlerCallbacks = {
    onPawnSelected: null,
    onPawnDeselected: null,
    onMoveAttempted: null,
    onInvalidMove: null
};

/**
 * Initialize the touch handler system
 */
function initializeTouchHandler() {
    console.log('Initializing touch handler system...');
    
    try {
        if (touchHandlerState.initialized) {
            console.warn('Touch handler already initialized');
            return true;
        }

        // Get the board element
        touchHandlerState.boardElement = document.getElementById('game-board');
        if (!touchHandlerState.boardElement) {
            throw new Error('Game board element not found');
        }

        // Setup event delegation for the board
        setupBoardEventDelegation();

        // Setup global touch handlers for deselection
        setupGlobalTouchHandlers();

        touchHandlerState.initialized = true;
        console.log('Touch handler system initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize touch handler:', error);
        return false;
    }
}

/**
 * Setup event delegation for the game board
 */
function setupBoardEventDelegation() {
    console.log('Setting up board event delegation...');
    
    // Use event delegation on the board container
    touchHandlerState.boardElement.addEventListener('touchstart', handleBoardTouch, { passive: false });
    touchHandlerState.boardElement.addEventListener('click', handleBoardClick, { passive: false });
    
    // Prevent default touch behaviors that might interfere
    touchHandlerState.boardElement.addEventListener('touchmove', preventDefaultTouch, { passive: false });
    touchHandlerState.boardElement.addEventListener('touchend', preventDefaultTouch, { passive: false });
}

/**
 * Setup global touch handlers for deselection
 */
function setupGlobalTouchHandlers() {
    console.log('Setting up global touch handlers...');
    
    // Listen for touches outside the board to deselect pawns
    document.addEventListener('touchstart', handleGlobalTouch, { passive: true });
    document.addEventListener('click', handleGlobalClick, { passive: true });
}

/**
 * Handle touch events on the game board
 */
function handleBoardTouch(event) {
    console.log('Board touch detected');
    
    // Prevent default to avoid click events firing
    event.preventDefault();
    
    // Check throttling
    if (isThrottled()) {
        console.log('Touch throttled, ignoring');
        return;
    }

    const touch = event.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    handleCardInteraction(element, event);
}

/**
 * Handle click events on the game board (for mouse/desktop testing)
 */
function handleBoardClick(event) {
    console.log('Board click detected');
    
    // Check throttling
    if (isThrottled()) {
        console.log('Click throttled, ignoring');
        return;
    }

    handleCardInteraction(event.target, event);
}

/**
 * Handle card interaction (both touch and click)
 */
function handleCardInteraction(element, event) {
    console.log('Handling card interaction with element:', element);
    
    // Find the card element (might be child of card)
    const cardElement = findCardElement(element);
    
    if (!cardElement) {
        console.log('No card element found, deselecting pawn');
        deselectPawn();
        return;
    }

    const row = parseInt(cardElement.dataset.row);
    const col = parseInt(cardElement.dataset.col);
    
    console.log(`Card interaction at position (${row}, ${col})`);

    // Check if this is a pawn selection
    if (isPawnAtPosition(row, col)) {
        handlePawnSelection(row, col, cardElement);
    }
    // Check if this is a move to a valid destination
    else if (touchHandlerState.selectedPawn && isValidDestination(row, col)) {
        handleMoveAttempt(row, col, cardElement);
    }
    // Otherwise, deselect current pawn
    else {
        deselectPawn();
    }

    // Update throttle
    updateThrottle();
}

/**
 * Handle pawn selection
 */
function handlePawnSelection(row, col, cardElement) {
    console.log(`Pawn selection at (${row}, ${col})`);
    
    const currentPlayer = getCurrentPlayer();
    const playerPosition = currentPlayer.getPosition();
    
    // Check if this is the current player's pawn
    if (playerPosition.row === row && playerPosition.col === col) {
        // Select this pawn
        selectPawn(row, col, cardElement);
    } else {
        // Can't select opponent's pawn, deselect current selection
        console.log('Cannot select opponent pawn');
        deselectPawn();
        
        // Show visual feedback for invalid selection
        showInvalidSelectionFeedback(cardElement);
    }
}

/**
 * Handle move attempt to a destination
 */
function handleMoveAttempt(row, col, cardElement) {
    console.log(`Move attempt to (${row}, ${col})`);
    
    if (!touchHandlerState.selectedPawn) {
        console.warn('Move attempt without selected pawn');
        return;
    }

    // Get destination info
    const destinationInfo = getDestinationInfo(row, col);
    if (!destinationInfo) {
        console.warn('Invalid destination for move attempt');
        showInvalidMoveFeedback(cardElement);
        return;
    }

    // Attempt the move using the movement execution system
    const moveResult = attemptMove(destinationInfo);
    
    if (moveResult.success) {
        console.log('Move executed successfully');
        
        // Clear selection after successful move
        deselectPawn();
        
        // Trigger callback
        if (touchHandlerCallbacks.onMoveAttempted) {
            touchHandlerCallbacks.onMoveAttempted(moveResult);
        }
    } else {
        console.log('Move failed:', moveResult.error);
        showInvalidMoveFeedback(cardElement);
        
        // Trigger callback
        if (touchHandlerCallbacks.onInvalidMove) {
            touchHandlerCallbacks.onInvalidMove(moveResult);
        }
    }
}

/**
 * Select a pawn
 */
function selectPawn(row, col, cardElement) {
    console.log(`Selecting pawn at (${row}, ${col})`);
    
    // Deselect previous selection
    deselectPawn();
    
    // Store selected pawn
    touchHandlerState.selectedPawn = { row, col, element: cardElement };
    
    // Add visual selection indicator
    cardElement.classList.add('selected-pawn');
    
    // Trigger callback
    if (touchHandlerCallbacks.onPawnSelected) {
        touchHandlerCallbacks.onPawnSelected({ row, col });
    }
    
    console.log(`Pawn selected at (${row}, ${col})`);
}

/**
 * Deselect the current pawn
 */
function deselectPawn() {
    if (!touchHandlerState.selectedPawn) {
        return;
    }
    
    console.log('Deselecting pawn');
    
    // Remove visual selection indicator
    if (touchHandlerState.selectedPawn.element) {
        touchHandlerState.selectedPawn.element.classList.remove('selected-pawn');
    }
    
    // Clear selection
    touchHandlerState.selectedPawn = null;
    
    // Trigger callback
    if (touchHandlerCallbacks.onPawnDeselected) {
        touchHandlerCallbacks.onPawnDeselected();
    }
    
    console.log('Pawn deselected');
}

/**
 * Handle global touch events for deselection
 */
function handleGlobalTouch(event) {
    // Only deselect if touch is outside the game board
    if (!touchHandlerState.boardElement.contains(event.target)) {
        deselectPawn();
    }
}

/**
 * Handle global click events for deselection
 */
function handleGlobalClick(event) {
    // Only deselect if click is outside the game board
    if (!touchHandlerState.boardElement.contains(event.target)) {
        deselectPawn();
    }
}

/**
 * Prevent default touch behaviors
 */
function preventDefaultTouch(event) {
    event.preventDefault();
}

/**
 * Check if touch/click is throttled
 */
function isThrottled() {
    const now = Date.now();
    const timeSinceLastTouch = now - touchHandlerState.lastTouchTime;
    
    return timeSinceLastTouch < touchHandlerState.throttleDelay;
}

/**
 * Update throttle timer
 */
function updateThrottle() {
    touchHandlerState.lastTouchTime = Date.now();
}

/**
 * Find the card element from a target (handles child elements)
 */
function findCardElement(element) {
    if (!element) return null;
    
    // Check if element itself is a card
    if (element.classList && element.classList.contains('card')) {
        return element;
    }
    
    // Check parent elements up to 3 levels
    let current = element.parentElement;
    let levels = 0;
    
    while (current && levels < 3) {
        if (current.classList && current.classList.contains('card')) {
            return current;
        }
        current = current.parentElement;
        levels++;
    }
    
    return null;
}

/**
 * Check if there's a pawn at the given position
 */
function isPawnAtPosition(row, col) {
    try {
        const currentPlayer = getCurrentPlayer();
        if (!currentPlayer || !currentPlayer.isPlaced()) {
            return false;
        }
        
        const playerPosition = currentPlayer.getPosition();
        return playerPosition.row === row && playerPosition.col === col;
    } catch (error) {
        console.error('Error checking pawn at position:', error);
        return false;
    }
}

/**
 * Attempt to execute a move
 */
function attemptMove(destinationInfo) {
    try {
        console.log('Attempting move to:', destinationInfo);
        
        const currentPlayer = getCurrentPlayer();
        const startPosition = currentPlayer.getPosition();
        const endPosition = destinationInfo.position;
        
        // Use the movement execution system
        if (destinationInfo.isJoker) {
            // Handle joker move
            return executeJokerMove(endPosition);
        } else {
            // Handle numbered card move
            return executeNumberedCardMove(startPosition, endPosition, parseInt(destinationInfo.distance));
        }
    } catch (error) {
        console.error('Error attempting move:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Execute a joker move
 */
function executeJokerMove(endPosition) {
    try {
        // This would integrate with the joker move execution system
        console.log('Executing joker move to:', endPosition);
        
        // For now, return success - this will be integrated with the actual joker system
        return { success: true, type: 'joker', destination: endPosition };
    } catch (error) {
        console.error('Error executing joker move:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Execute a numbered card move
 */
function executeNumberedCardMove(startPosition, endPosition, distance) {
    try {
        console.log(`Executing numbered card move: ${distance} spaces from ${JSON.stringify(startPosition)} to ${JSON.stringify(endPosition)}`);
        
        // This would integrate with the movement execution system
        // For now, return success - this will be integrated with the actual movement system
        return { success: true, type: 'numbered', distance, start: startPosition, destination: endPosition };
    } catch (error) {
        console.error('Error executing numbered card move:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Show visual feedback for invalid selection
 */
function showInvalidSelectionFeedback(cardElement) {
    console.log('Showing invalid selection feedback');
    
    if (!cardElement) return;
    
    // Add shake animation class
    cardElement.classList.add('invalid-selection-shake');
    
    // Remove class after animation
    setTimeout(() => {
        cardElement.classList.remove('invalid-selection-shake');
    }, 300);
}

/**
 * Show visual feedback for invalid move
 */
function showInvalidMoveFeedback(cardElement) {
    console.log('Showing invalid move feedback');
    
    if (!cardElement) return;
    
    // Add shake animation class
    cardElement.classList.add('invalid-move-shake');
    
    // Remove class after animation
    setTimeout(() => {
        cardElement.classList.remove('invalid-move-shake');
    }, 300);
}

/**
 * Set callback for pawn selection
 */
function setOnPawnSelected(callback) {
    touchHandlerCallbacks.onPawnSelected = callback;
}

/**
 * Set callback for pawn deselection
 */
function setOnPawnDeselected(callback) {
    touchHandlerCallbacks.onPawnDeselected = callback;
}

/**
 * Set callback for move attempts
 */
function setOnMoveAttempted(callback) {
    touchHandlerCallbacks.onMoveAttempted = callback;
}

/**
 * Set callback for invalid moves
 */
function setOnInvalidMove(callback) {
    touchHandlerCallbacks.onInvalidMove = callback;
}

/**
 * Get current touch handler state for debugging
 */
function getTouchHandlerState() {
    return {
        initialized: touchHandlerState.initialized,
        selectedPawn: touchHandlerState.selectedPawn,
        isThrottled: isThrottled(),
        throttleDelay: touchHandlerState.throttleDelay
    };
}

/**
 * Clear current selection (public method)
 */
function clearTouchSelection() {
    deselectPawn();
}

/**
 * Destroy touch handler and cleanup
 */
function destroyTouchHandler() {
    console.log('Destroying touch handler...');
    
    if (!touchHandlerState.initialized) {
        return;
    }

    // Remove event listeners
    if (touchHandlerState.boardElement) {
        touchHandlerState.boardElement.removeEventListener('touchstart', handleBoardTouch);
        touchHandlerState.boardElement.removeEventListener('click', handleBoardClick);
        touchHandlerState.boardElement.removeEventListener('touchmove', preventDefaultTouch);
        touchHandlerState.boardElement.removeEventListener('touchend', preventDefaultTouch);
    }

    document.removeEventListener('touchstart', handleGlobalTouch);
    document.removeEventListener('click', handleGlobalClick);

    // Clear state
    deselectPawn();
    touchHandlerState.initialized = false;
    touchHandlerState.boardElement = null;

    console.log('Touch handler destroyed');
}

console.log('Touch handler module loaded');