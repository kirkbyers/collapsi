/**
 * Touch Handler - Core touch event handling and pawn selection logic
 * Handles tap events, pawn selection, and board interaction for Collapsi game
 */

export class TouchHandler {
    constructor(gameInstance, animationController) {
        this.game = gameInstance;
        this.animationController = animationController;
        
        // Touch Handler State
        this.state = {
            selectedPawn: null,
            isThrottled: false,
            throttleDelay: 100, // 100ms throttle to prevent rapid tapping
            lastTouchTime: 0,
            boardElement: null,
            initialized: false
        };

        // Event Callbacks
        this.onPawnSelected = null;
        this.onPawnDeselected = null;
        this.onMoveAttempted = null;
        this.onInvalidMove = null;
        
        // Bound methods for event listeners
        this.boundHandlers = {
            boardTouch: this.handleBoardTouch.bind(this),
            boardClick: this.handleBoardClick.bind(this),
            globalTouch: this.handleGlobalTouch.bind(this),
            globalClick: this.handleGlobalClick.bind(this),
            preventDefaultTouch: this.preventDefaultTouch.bind(this)
        };
        
        this.initialize();
    }

    /**
     * Initialize the touch handler system
     */
    initialize() {
        console.log('Initializing touch handler system...');
        
        try {
            if (this.state.initialized) {
                console.warn('Touch handler already initialized');
                return true;
            }

            // Get the board element
            this.state.boardElement = document.getElementById('game-board');
            if (!this.state.boardElement) {
                throw new Error('Game board element not found');
            }

            // Setup event delegation for the board
            this.setupBoardEventDelegation();

            // Setup global touch handlers for deselection
            this.setupGlobalTouchHandlers();

            this.state.initialized = true;
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
    setupBoardEventDelegation() {
        console.log('Setting up board event delegation...');
        
        // Use event delegation on the board container
        this.state.boardElement.addEventListener('touchstart', this.boundHandlers.boardTouch, { passive: false });
        this.state.boardElement.addEventListener('click', this.boundHandlers.boardClick, { passive: false });
        
        // Prevent default touch behaviors that might interfere
        this.state.boardElement.addEventListener('touchmove', this.boundHandlers.preventDefaultTouch, { passive: false });
        this.state.boardElement.addEventListener('touchend', this.boundHandlers.preventDefaultTouch, { passive: false });
    }

    /**
     * Setup global touch handlers for deselection
     */
    setupGlobalTouchHandlers() {
        console.log('Setting up global touch handlers...');
        
        // Listen for touches outside the board to deselect pawns
        document.addEventListener('touchstart', this.boundHandlers.globalTouch, { passive: true });
        document.addEventListener('click', this.boundHandlers.globalClick, { passive: true });
    }

    /**
     * Handle touch events on the game board
     */
    handleBoardTouch(event) {
        console.log('Board touch detected');
        
        // Prevent default to avoid click events firing
        event.preventDefault();
        
        // Check throttling
        if (this.isThrottled()) {
            console.log('Touch throttled, ignoring');
            return;
        }

        const touch = event.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        this.handleCardInteraction(element, event);
    }

    /**
     * Handle click events on the game board (for mouse/desktop testing)
     */
    handleBoardClick(event) {
        console.log('Board click detected');
        
        // Check throttling
        if (this.isThrottled()) {
            console.log('Click throttled, ignoring');
            return;
        }

        this.handleCardInteraction(event.target, event);
    }

    /**
     * Handle card interaction (both touch and click)
     */
    handleCardInteraction(element, event) {
        console.log('Handling card interaction with element:', element);
        
        // Find the card element (might be child of card)
        const cardElement = this.findCardElement(element);
        
        if (!cardElement) {
            console.log('No card element found, deselecting pawn');
            this.deselectPawn();
            return;
        }

        const row = parseInt(cardElement.dataset.row);
        const col = parseInt(cardElement.dataset.col);
        
        console.log(`Card interaction at position (${row}, ${col})`);

        // Check if this is a pawn selection
        if (this.isPawnAtPosition(row, col)) {
            this.handlePawnSelection(row, col, cardElement);
        }
        // Check if this is a move to a valid destination
        else if (this.state.selectedPawn && this.isValidDestination(row, col)) {
            this.handleMoveAttempt(row, col, cardElement);
        }
        // Otherwise, deselect current pawn
        else {
            this.deselectPawn();
        }
    }

    /**
     * Handle pawn selection
     */
    handlePawnSelection(row, col, cardElement) {
        console.log(`Handling pawn selection at (${row}, ${col})`);
        
        // Update throttle
        this.updateThrottle();
        
        // Check if already selected
        if (this.state.selectedPawn && 
            this.state.selectedPawn.row === row && 
            this.state.selectedPawn.col === col) {
            console.log('Pawn already selected, deselecting');
            this.deselectPawn();
            return;
        }
        
        // Select the pawn
        this.selectPawn(row, col, cardElement);
    }

    /**
     * Handle move attempt
     */
    handleMoveAttempt(row, col, cardElement) {
        console.log(`Handling move attempt to (${row}, ${col})`);
        
        // Update throttle
        this.updateThrottle();
        
        // Get destination info
        const destinationInfo = this.getDestinationInfo(row, col);
        if (!destinationInfo) {
            console.log('No destination info found');
            this.showInvalidMoveFeedback(cardElement);
            return;
        }
        
        // Attempt the move
        const moveResult = this.attemptMove(destinationInfo);
        
        if (moveResult.success) {
            console.log('Move executed successfully');
            
            // Clear selection after successful move
            this.deselectPawn();
            
            // Trigger callback
            if (this.onMoveAttempted) {
                this.onMoveAttempted(moveResult);
            }
        } else {
            console.log('Move failed:', moveResult.error);
            this.showInvalidMoveFeedback(cardElement);
            
            // Trigger callback
            if (this.onInvalidMove) {
                this.onInvalidMove(moveResult);
            }
        }
    }

    /**
     * Select a pawn
     */
    selectPawn(row, col, cardElement) {
        console.log(`Selecting pawn at (${row}, ${col})`);
        
        // Deselect previous selection
        this.deselectPawn();
        
        // Store selected pawn
        this.state.selectedPawn = { row, col, element: cardElement };
        
        // Add visual selection indicator
        cardElement.classList.add('selected-pawn');
        
        // Trigger callback
        if (this.onPawnSelected) {
            this.onPawnSelected({ row, col });
        }
        
        console.log(`Pawn selected at (${row}, ${col})`);
    }

    /**
     * Deselect the current pawn
     */
    deselectPawn() {
        if (!this.state.selectedPawn) {
            return;
        }
        
        console.log('Deselecting pawn');
        
        // Remove visual selection indicator
        if (this.state.selectedPawn.element) {
            this.state.selectedPawn.element.classList.remove('selected-pawn');
        }
        
        // Clear selection
        this.state.selectedPawn = null;
        
        // Trigger callback
        if (this.onPawnDeselected) {
            this.onPawnDeselected();
        }
        
        console.log('Pawn deselected');
    }

    /**
     * Clear selection (public method)
     */
    clearSelection() {
        this.deselectPawn();
    }

    /**
     * Handle global touch events for deselection
     */
    handleGlobalTouch(event) {
        // Only deselect if touch is outside the game board
        if (!this.state.boardElement.contains(event.target)) {
            this.deselectPawn();
        }
    }

    /**
     * Handle global click events for deselection
     */
    handleGlobalClick(event) {
        // Only deselect if click is outside the game board
        if (!this.state.boardElement.contains(event.target)) {
            this.deselectPawn();
        }
    }

    /**
     * Prevent default touch behaviors
     */
    preventDefaultTouch(event) {
        event.preventDefault();
    }

    /**
     * Check if touch/click is throttled
     */
    isThrottled() {
        const now = Date.now();
        const timeSinceLastTouch = now - this.state.lastTouchTime;
        
        return timeSinceLastTouch < this.state.throttleDelay;
    }

    /**
     * Update throttle timer
     */
    updateThrottle() {
        this.state.lastTouchTime = Date.now();
    }

    /**
     * Find the card element from a target (handles child elements)
     */
    findCardElement(element) {
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
    isPawnAtPosition(row, col) {
        try {
            // Access global function
            const currentPlayer = window.getCurrentPlayer();
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
     * Check if a position is a currently highlighted valid destination
     */
    isValidDestination(row, col) {
        try {
            const cardElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            
            if (!cardElement) {
                return false;
            }
            
            return cardElement.classList.contains('valid-destination') ||
                   cardElement.classList.contains('joker-valid-destination') ||
                   cardElement.classList.contains('immediate-destination');
        } catch (error) {
            console.error('Error checking if position is valid destination:', error);
            return false;
        }
    }

    /**
     * Get destination info for a specific position
     */
    getDestinationInfo(row, col) {
        try {
            const cardElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            
            if (!cardElement || !this.isValidDestination(row, col)) {
                return null;
            }
            
            return {
                position: { row, col },
                distance: cardElement.getAttribute('data-destination-distance'),
                direction: cardElement.getAttribute('data-destination-direction'),
                isJoker: cardElement.getAttribute('data-is-joker-destination') === 'true',
                isImmediate: cardElement.classList.contains('immediate-destination')
            };
        } catch (error) {
            console.error('Error getting destination info:', error);
            return null;
        }
    }

    /**
     * Attempt to execute a move
     */
    attemptMove(destinationInfo) {
        try {
            console.log('Attempting move to:', destinationInfo);
            
            const currentPlayer = window.getCurrentPlayer();
            const startPosition = currentPlayer.getPosition();
            const endPosition = destinationInfo.position;
            
            // Use the movement execution system
            if (destinationInfo.isJoker) {
                // Handle joker move
                return this.executeJokerMove(endPosition);
            } else {
                // Handle numbered card move
                return this.executeNumberedCardMove(startPosition, endPosition, parseInt(destinationInfo.distance));
            }
        } catch (error) {
            console.error('Error attempting move:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Execute a joker move
     */
    executeJokerMove(endPosition) {
        try {
            console.log('Executing joker move to:', endPosition);
            
            // Check if there's an active joker movement state using global functions
            const jokerStateInfo = window.getJokerMovementStateInfo();
            
            if (!jokerStateInfo.active) {
                // Start a new joker movement if none is active
                const startResult = window.startJokerMovement();
                if (!startResult.success) {
                    return { success: false, error: startResult.reason };
                }
            }
            
            // Execute the joker move step
            const moveResult = window.updateJokerMovementState(endPosition);
            
            if (moveResult.success) {
                console.log('Joker move step executed:', moveResult);
                
                // Return success with additional joker state information
                return {
                    success: true,
                    type: 'joker',
                    destination: endPosition,
                    spacesMoved: moveResult.spacesMoved,
                    remainingDistance: moveResult.remainingDistance,
                    state: moveResult.state,
                    canEndTurn: moveResult.canEndTurn,
                    mustEndTurn: moveResult.mustEndTurn
                };
            } else {
                return { success: false, error: moveResult.reason };
            }
        } catch (error) {
            console.error('Error executing joker move:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Execute a numbered card move
     */
    executeNumberedCardMove(startPosition, endPosition, distance) {
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
     * Show visual feedback for invalid move
     */
    showInvalidMoveFeedback(cardElement) {
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
     * Get current touch handler state
     */
    getState() {
        return {
            initialized: this.state.initialized,
            selectedPawn: this.state.selectedPawn,
            isThrottled: this.isThrottled()
        };
    }

    /**
     * Cleanup and destroy touch handler
     */
    destroy() {
        // Remove event listeners
        if (this.state.boardElement) {
            this.state.boardElement.removeEventListener('touchstart', this.boundHandlers.boardTouch);
            this.state.boardElement.removeEventListener('click', this.boundHandlers.boardClick);
            this.state.boardElement.removeEventListener('touchmove', this.boundHandlers.preventDefaultTouch);
            this.state.boardElement.removeEventListener('touchend', this.boundHandlers.preventDefaultTouch);
        }
        
        document.removeEventListener('touchstart', this.boundHandlers.globalTouch);
        document.removeEventListener('click', this.boundHandlers.globalClick);
        
        // Clear state
        this.state.selectedPawn = null;
        this.state.boardElement = null;
        this.state.initialized = false;
        
        console.log('Touch handler destroyed');
    }
}
