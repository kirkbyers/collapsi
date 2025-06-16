/**
 * Move Preview System - Step-by-step destination highlighting and move validation
 * Integrates with movement validation system to show valid destinations
 */

export class MovePreview {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.currentPreview = null;
        this.onMoveExecuted = null;
        
        console.log('Move preview system initialized');
    }

    /**
     * Show valid destinations for selected pawn
     * @param {Object} pawnPosition - Current pawn position {row, col}
     */
    showValidDestinations(pawnPosition) {
        try {
            console.log('Showing valid destinations for pawn at:', pawnPosition);
            
            // Use the existing global destination highlighting function
            if (typeof window.updateDestinationHighlighting === 'function') {
                const result = window.updateDestinationHighlighting();
                console.log('Destination highlighting result:', result);
            } else {
                console.warn('updateDestinationHighlighting function not found');
            }
            
            this.currentPreview = {
                pawnPosition: pawnPosition,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Error showing valid destinations:', error);
        }
    }

    /**
     * Clear all highlighting
     */
    clearHighlights() {
        try {
            console.log('Clearing destination highlights');
            
            // Use the existing global clear function
            if (typeof window.clearDestinationHighlighting === 'function') {
                window.clearDestinationHighlighting();
            } else {
                console.warn('clearDestinationHighlighting function not found');
            }
            
            this.currentPreview = null;
        } catch (error) {
            console.error('Error clearing highlights:', error);
        }
    }

    /**
     * Execute a move and trigger callback
     * @param {Object} moveResult - Result of the move execution
     */
    executeMove(moveResult) {
        try {
            console.log('Move preview executing move:', moveResult);
            
            // Clear highlights after move
            this.clearHighlights();
            
            // Trigger callback if set
            if (this.onMoveExecuted) {
                this.onMoveExecuted(moveResult);
            }
        } catch (error) {
            console.error('Error executing move in preview:', error);
        }
    }

    /**
     * Get current preview state
     */
    getState() {
        return {
            hasPreview: !!this.currentPreview,
            previewPosition: this.currentPreview?.pawnPosition || null
        };
    }

    /**
     * Cleanup and destroy move preview
     */
    destroy() {
        this.clearHighlights();
        this.currentPreview = null;
        this.onMoveExecuted = null;
        
        console.log('Move preview destroyed');
    }
}

export default MovePreview;