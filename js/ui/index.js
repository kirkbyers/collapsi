/**
 * UI Module - Main entry point for touch controls and UI integration
 * Coordinates all UI subsystems for the Collapsi game
 */

import { TouchHandler } from './touch-handler.js';
import { MovePreview } from './move-preview.js';
import { AnimationController } from './animation-controller.js';
import { JokerControls } from './joker-controls.js';
import { GameControls } from './game-controls.js';

export class UI {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.isInitialized = false;
        
        // UI subsystems
        this.touchHandler = null;
        this.movePreview = null;
        this.animationController = null;
        this.jokerControls = null;
        this.gameControls = null;
    }

    /**
     * Initialize all UI subsystems
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('UI already initialized');
            return;
        }

        try {
            // Initialize animation controller first (other systems depend on it)
            this.animationController = new AnimationController();
            
            // Initialize core UI components
            this.touchHandler = new TouchHandler(this.game, this.animationController);
            this.movePreview = new MovePreview(this.game);
            this.jokerControls = new JokerControls(this.game);
            this.gameControls = new GameControls(this.game);

            // Setup cross-component communication
            this.setupComponentInteractions();

            this.isInitialized = true;
            console.log('UI system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize UI system:', error);
            throw error;
        }
    }

    /**
     * Setup interactions between UI components
     */
    setupComponentInteractions() {
        // Connect touch handler to move preview
        this.touchHandler.onPawnSelected = (position) => {
            this.movePreview.showValidDestinations(position);
        };

        this.touchHandler.onPawnDeselected = () => {
            this.movePreview.clearHighlights();
            this.jokerControls.hide();
        };

        // Connect move preview to touch handler for move execution
        this.movePreview.onMoveExecuted = (moveResult) => {
            this.touchHandler.clearSelection();
            
            // Update joker controls if this was a joker move
            if (moveResult && moveResult.type === 'joker') {
                this.jokerControls.updateFromGameState();
            }
        };

        // Connect joker controls to touch handler
        this.jokerControls.onEndTurn = (result) => {
            this.touchHandler.clearSelection();
            
            // Handle turn switching after joker completion
            if (result && result.success) {
                this.handleJokerTurnCompletion(result);
            }
        };

        // Connect touch handler to joker controls for move updates
        this.touchHandler.onMoveAttempted = (moveResult) => {
            if (moveResult && moveResult.success) {
                // Update game controls turn indicator after any successful move
                this.gameControls.updateFromGameState();
                
                // Update joker controls if this was a joker move
                if (moveResult.type === 'joker') {
                    this.jokerControls.updateFromGameState();
                }
            }
        };
    }

    /**
     * Cleanup and destroy UI system
     */
    destroy() {
        if (!this.isInitialized) return;

        this.touchHandler?.destroy();
        this.movePreview?.destroy();
        this.animationController?.destroy();
        this.jokerControls?.destroy();
        this.gameControls?.destroy();

        this.isInitialized = false;
        console.log('UI system destroyed');
    }

    /**
     * Handle joker turn completion and switch turns
     */
    handleJokerTurnCompletion(completionResult) {
        console.log('Handling joker turn completion:', completionResult);
        
        try {
            // Create move data for turn switching
            const jokerMoveData = {
                playerId: gameState.players[gameState.currentPlayer].id,
                startingPosition: completionResult.summary?.startingPosition,
                destinationPosition: completionResult.summary?.currentPosition,
                distance: completionResult.summary?.spacesMoved || 1,
                type: 'joker'
            };
            
            // Attempt turn switching
            let turnSwitchResult = null;
            if (typeof window !== 'undefined' && window.switchTurnAfterMoveCompletion) {
                turnSwitchResult = window.switchTurnAfterMoveCompletion(jokerMoveData);
            } else {
                console.warn('switchTurnAfterMoveCompletion function not found, using fallback');
                // Fallback: manually switch turns
                gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
                turnSwitchResult = { success: true, reason: 'Manual turn switch successful' };
            }
            
            console.log('Turn switch result after joker completion:', turnSwitchResult);
            
            // Re-render the board to update visual state
            if (this.game && this.game.renderBoard) {
                this.game.renderBoard();
            }
            
            // Update game controls to reflect new current player
            this.gameControls.updateFromGameState();
            
        } catch (error) {
            console.error('Error handling joker turn completion:', error);
        }
    }

    /**
     * Get current UI state for debugging
     */
    getState() {
        return {
            initialized: this.isInitialized,
            selectedPawn: this.touchHandler?.selectedPawn || null,
            animationsActive: this.animationController?.isRunning() || false,
            jokerControlsVisible: this.jokerControls?.isVisible() || false
        };
    }
}

export default UI;