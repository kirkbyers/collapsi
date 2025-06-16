/**
 * Joker Controls - UI controls specific to joker movement mechanics
 * Handles end turn button, move progress display, and joker state integration
 */

export class JokerControls {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.visible = false;
        this.endTurnButton = null;
        this.progressIndicator = null;
        this.container = null;
        
        // Callback for when end turn is pressed
        this.onEndTurn = null;
        
        this.initialize();
    }

    /**
     * Initialize joker controls UI elements
     */
    initialize() {
        this.createControlsContainer();
        this.createEndTurnButton();
        this.createProgressIndicator();
        this.setupEventListeners();
        
        console.log('Joker controls initialized');
    }

    /**
     * Create the main container for joker controls
     */
    createControlsContainer() {
        this.container = document.createElement('div');
        this.container.className = 'joker-controls';
        this.container.setAttribute('aria-label', 'Joker movement controls');
        
        // Initially hidden
        this.container.style.display = 'none';
        
        // Append to the board area
        const boardContainer = document.querySelector('.board-container') || document.body;
        boardContainer.appendChild(this.container);
    }

    /**
     * Create the "End Turn" button
     */
    createEndTurnButton() {
        this.endTurnButton = document.createElement('button');
        this.endTurnButton.className = 'end-turn-button';
        this.endTurnButton.setAttribute('aria-label', 'End joker turn early');
        this.endTurnButton.textContent = 'End Turn';
        
        this.container.appendChild(this.endTurnButton);
    }

    /**
     * Create the move progress indicator
     */
    createProgressIndicator() {
        this.progressIndicator = document.createElement('div');
        this.progressIndicator.className = 'joker-progress';
        this.progressIndicator.setAttribute('aria-live', 'polite');
        this.progressIndicator.textContent = 'Move 1 of 4';
        
        this.container.appendChild(this.progressIndicator);
    }

    /**
     * Setup event listeners for joker controls
     */
    setupEventListeners() {
        if (this.endTurnButton) {
            this.endTurnButton.addEventListener('click', this.handleEndTurnClick.bind(this));
            
            // Prevent default touch behaviors
            this.endTurnButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
            });
        }
    }

    /**
     * Handle end turn button click
     */
    handleEndTurnClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('End turn button clicked');
        
        try {
            // Check if we can end the joker turn early
            const jokerStateInfo = getJokerMovementStateInfo();
            
            if (!jokerStateInfo.active) {
                console.warn('No active joker movement to end');
                return;
            }
            
            const completionOptions = jokerStateInfo.completionOptions;
            if (!completionOptions.canComplete) {
                console.warn('Cannot complete joker turn:', completionOptions.reason);
                this.showError('Cannot end turn: ' + completionOptions.reason);
                return;
            }
            
            // Initiate early completion
            const result = initiateJokerEarlyCompletion();
            
            if (result.success) {
                console.log('Joker turn ended early:', result.summary);
                this.hide();
                
                // Notify parent components
                if (this.onEndTurn) {
                    this.onEndTurn(result);
                }
                
                // Trigger board re-render
                if (this.game && this.game.renderBoard) {
                    this.game.renderBoard();
                }
            } else {
                console.error('Failed to end joker turn:', result.reason);
                this.showError('Failed to end turn: ' + result.reason);
            }
        } catch (error) {
            console.error('Error handling end turn click:', error);
            this.showError('Error ending turn');
        }
    }

    /**
     * Show joker controls for active joker movement
     * @param {Object} jokerStateInfo - Current joker state information
     */
    show(jokerStateInfo) {
        if (!jokerStateInfo || !jokerStateInfo.active) {
            return;
        }
        
        console.log('Showing joker controls:', jokerStateInfo);
        
        // Update progress indicator
        this.updateProgressDisplay(jokerStateInfo);
        
        // Update end turn button state
        this.updateEndTurnButton(jokerStateInfo);
        
        // Show the container
        this.container.style.display = 'block';
        this.visible = true;
        
        // Add CSS class for styling
        this.container.classList.add('visible');
    }

    /**
     * Hide joker controls
     */
    hide() {
        if (!this.visible) return;
        
        console.log('Hiding joker controls');
        
        this.container.style.display = 'none';
        this.container.classList.remove('visible');
        this.visible = false;
    }

    /**
     * Update the progress display
     * @param {Object} jokerStateInfo - Current joker state information
     */
    updateProgressDisplay(jokerStateInfo) {
        if (!this.progressIndicator) return;
        
        const spacesMoved = jokerStateInfo.spacesMoved || 0;
        const maxSpaces = 4;
        
        // Create progress text
        let progressText = `Move ${spacesMoved + 1} of ${maxSpaces}`;
        
        // Add state information if relevant
        if (jokerStateInfo.state === 'must_complete') {
            progressText += ' (Must End)';
        } else if (jokerStateInfo.state === 'forced_completion') {
            progressText += ' (No Moves)';
        } else if (spacesMoved > 0) {
            progressText += ' (Can End)';
        }
        
        this.progressIndicator.textContent = progressText;
    }

    /**
     * Update the end turn button based on joker state
     * @param {Object} jokerStateInfo - Current joker state information
     */
    updateEndTurnButton(jokerStateInfo) {
        if (!this.endTurnButton) return;
        
        const uiState = jokerStateInfo.uiState || {};
        const completionOptions = jokerStateInfo.completionOptions || {};
        
        // Update button text and state
        if (uiState.completionRequired) {
            this.endTurnButton.textContent = 'End Turn (Required)';
            this.endTurnButton.disabled = false;
            this.endTurnButton.classList.add('required');
        } else if (completionOptions.canCompleteEarly) {
            this.endTurnButton.textContent = `End Turn (${jokerStateInfo.spacesMoved} moves)`;
            this.endTurnButton.disabled = false;
            this.endTurnButton.classList.remove('required');
        } else {
            this.endTurnButton.textContent = 'End Turn';
            this.endTurnButton.disabled = !completionOptions.canComplete;
            this.endTurnButton.classList.remove('required');
        }
        
        // Update accessibility label
        const ariaLabel = uiState.completionRequired ? 
            'End joker turn (required)' :
            completionOptions.canCompleteEarly ?
                `End joker turn after ${jokerStateInfo.spacesMoved} moves` :
                'End joker turn';
        
        this.endTurnButton.setAttribute('aria-label', ariaLabel);
    }

    /**
     * Check if controls should be shown for current game state
     * @returns {boolean} True if joker controls should be visible
     */
    shouldShow() {
        try {
            const jokerStateInfo = getJokerMovementStateInfo();
            return jokerStateInfo.active && jokerStateInfo.spacesMoved >= 0;
        } catch (error) {
            console.error('Error checking if joker controls should show:', error);
            return false;
        }
    }

    /**
     * Update controls based on current game state
     */
    updateFromGameState() {
        try {
            if (this.shouldShow()) {
                const jokerStateInfo = getJokerMovementStateInfo();
                this.show(jokerStateInfo);
                
                // Check if joker has completed 4 moves and should auto-end
                this.checkAutoCompletion(jokerStateInfo);
            } else {
                this.hide();
            }
        } catch (error) {
            console.error('Error updating joker controls from game state:', error);
            this.hide(); // Hide on error to avoid confusion
        }
    }

    /**
     * Check if joker turn should automatically end after 4 moves
     * @param {Object} jokerStateInfo - Current joker state information
     */
    checkAutoCompletion(jokerStateInfo) {
        if (!jokerStateInfo || !jokerStateInfo.active) {
            return;
        }
        
        // Auto-complete if joker has made 4 moves or has no remaining distance
        const shouldAutoComplete = jokerStateInfo.remainingDistance <= 0 || 
                                 jokerStateInfo.spacesMoved >= 4;
        
        if (shouldAutoComplete) {
            console.log('Auto-completing joker turn: 4 moves reached or max distance');
            
            // Delay slightly to allow UI updates to complete
            setTimeout(() => {
                this.handleAutoCompletion(jokerStateInfo);
            }, 500);
        }
    }

    /**
     * Handle automatic completion of joker turn
     * @param {Object} jokerStateInfo - Current joker state information
     */
    handleAutoCompletion(jokerStateInfo) {
        try {
            console.log('Automatically ending joker turn:', {
                spacesMoved: jokerStateInfo.spacesMoved,
                remainingDistance: jokerStateInfo.remainingDistance
            });
            
            // Use the same completion logic as manual end turn
            const result = initiateJokerEarlyCompletion();
            
            if (result.success) {
                console.log('Joker turn auto-completed successfully');
                this.hide();
                
                // Notify parent components
                if (this.onEndTurn) {
                    this.onEndTurn(result);
                }
                
                // Trigger board re-render
                if (this.game && this.game.renderBoard) {
                    this.game.renderBoard();
                }
            } else {
                console.error('Failed to auto-complete joker turn:', result.reason);
                // Show error but don't hide controls - let user manually end turn
                this.showError('Auto-completion failed: ' + result.reason);
            }
        } catch (error) {
            console.error('Error during auto-completion:', error);
            this.showError('Auto-completion error');
        }
    }

    /**
     * Show temporary error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        // Create temporary error indicator
        const errorElement = document.createElement('div');
        errorElement.className = 'joker-error';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        
        this.container.appendChild(errorElement);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.parentNode.removeChild(errorElement);
            }
        }, 3000);
    }

    /**
     * Check if joker controls are currently visible
     * @returns {boolean} True if visible
     */
    isVisible() {
        return this.visible;
    }

    /**
     * Get current joker controls state for debugging
     * @returns {Object} Current state information
     */
    getState() {
        return {
            visible: this.visible,
            buttonDisabled: this.endTurnButton?.disabled || false,
            progressText: this.progressIndicator?.textContent || '',
            shouldShow: this.shouldShow()
        };
    }

    /**
     * Cleanup and destroy joker controls
     */
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        this.container = null;
        this.endTurnButton = null;
        this.progressIndicator = null;
        this.onEndTurn = null;
        
        console.log('Joker controls destroyed');
    }
}

export default JokerControls;