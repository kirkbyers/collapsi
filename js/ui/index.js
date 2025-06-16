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
        this.movePreview.onMoveExecuted = () => {
            this.touchHandler.clearSelection();
        };

        // Connect joker controls to touch handler
        this.jokerControls.onEndTurn = () => {
            this.touchHandler.clearSelection();
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
     * Get current UI state for debugging
     */
    getState() {
        return {
            initialized: this.isInitialized,
            selectedPawn: this.touchHandler?.selectedPawn || null,
            animationsActive: this.animationController?.hasActiveAnimations() || false,
            jokerControlsVisible: this.jokerControls?.isVisible() || false
        };
    }
}

export default UI;