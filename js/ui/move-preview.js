/**
 * Move Preview System - Step-by-step destination highlighting and move validation
 * Integrates with movement validation system to show valid destinations
 */

import { animationController } from './animation-controller.js';

class MovePreview {
    constructor() {
        this.currentPreview = null;
        this.validDestinations = [];
        this.highlightedElements = [];
        this.previewConfig = {
            highlightClass: 'valid-destination',
            jokerHighlightClass: 'joker-valid-destination',
            selectedPawnClass: 'selected-pawn',
            staggerDelay: 50 // ms between highlighting each destination
        };
    }

    /**
     * Initialize move preview system with game integration
     * @param {Object} gameInstance - Reference to main game instance
     * @param {Object} movementValidation - Reference to movement validation system
     */
    initialize(gameInstance, movementValidation) {
        this.game = gameInstance;
        this.movementValidation = movementValidation;
        console.log('Move preview system initialized');
    }

    /**
     * Show step-by-step move preview for selected pawn
     * @param {Object} pawnPosition - Current pawn position {row, col}
     * @param {string} playerId - ID of the player ('red' or 'blue')
     * @returns {Promise} Promise that resolves when preview is shown
     */
    async showMovePreview(pawnPosition, playerId) {
        // Clear any existing preview
        await this.clearPreview();

        // Highlight selected pawn
        const pawnElement = this.getPawnElement(pawnPosition);
        if (pawnElement) {
            animationController.highlightElement(pawnElement, this.previewConfig.selectedPawnClass);
        }

        // Get valid destinations from movement validation system
        this.validDestinations = this.getValidDestinations(pawnPosition, playerId);

        if (this.validDestinations.length === 0) {
            console.log('No valid destinations found for pawn at', pawnPosition);
            return;
        }

        // Highlight destinations with staggered animation
        await this.highlightDestinations(this.validDestinations);

        this.currentPreview = {
            pawnPosition,
            playerId,
            validDestinations: this.validDestinations
        };

        console.log(`Move preview shown: ${this.validDestinations.length} valid destinations`);
    }

    /**
     * Get valid destinations using the movement validation system
     * @param {Object} pawnPosition - Current pawn position {row, col}
     * @param {string} playerId - ID of the player
     * @returns {Array} Array of valid destination positions
     */
    getValidDestinations(pawnPosition, playerId) {
        try {
            // Get the card at current position
            const currentCard = this.game.board.getCard(pawnPosition.row, pawnPosition.col);
            if (!currentCard) {
                return [];
            }

            // For joker cards, get all possible destinations (1-4 moves)
            if (currentCard.isJoker || currentCard.type === 'joker') {
                return this.getJokerDestinations(pawnPosition, playerId);
            }

            // For regular cards, get destinations for exact card value
            const cardValue = this.getCardDistance(currentCard);
            return this.getRegularCardDestinations(pawnPosition, cardValue, playerId);
        } catch (error) {
            console.error('Error getting valid destinations:', error);
            return [];
        }
    }

    /**
     * Get card movement distance from card data
     * @param {Object} card - Card object
     * @returns {number} Movement distance for the card
     */
    getCardDistance(card) {
        // Handle different card formats
        if (card.value && !isNaN(card.value)) {
            return parseInt(card.value);
        }
        if (card.type === 'A' || card.type === 'ace') {
            return 1;
        }
        if (card.type && !isNaN(card.type)) {
            return parseInt(card.type);
        }
        // Fallback
        return 1;
    }

    /**
     * Get valid destinations for joker cards (1-4 moves)
     * @param {Object} pawnPosition - Current pawn position
     * @param {string} playerId - ID of the player
     * @returns {Array} Array of valid destinations for joker moves
     */
    getJokerDestinations(pawnPosition, playerId) {
        const allDestinations = [];

        // Check destinations for moves 1-4
        for (let distance = 1; distance <= 4; distance++) {
            const destinations = this.getDestinationsAtDistance(pawnPosition, distance, playerId);
            allDestinations.push(...destinations.map(dest => ({
                ...dest,
                distance,
                isJokerMove: true
            })));
        }

        return allDestinations;
    }

    /**
     * Get valid destinations for regular cards
     * @param {Object} pawnPosition - Current pawn position
     * @param {number} cardValue - Value of the card (2, 3, or 4)
     * @param {string} playerId - ID of the player
     * @returns {Array} Array of valid destinations
     */
    getRegularCardDestinations(pawnPosition, cardValue, playerId) {
        return this.getDestinationsAtDistance(pawnPosition, cardValue, playerId);
    }

    /**
     * Get destinations at specific distance using movement validation
     * @param {Object} startPos - Starting position
     * @param {number} distance - Distance to move
     * @param {string} playerId - ID of the player
     * @returns {Array} Array of valid positions at specified distance
     */
    getDestinationsAtDistance(startPos, distance, playerId) {
        const destinations = [];
        const directions = [
            { row: -1, col: 0 }, // up
            { row: 1, col: 0 },  // down
            { row: 0, col: -1 }, // left
            { row: 0, col: 1 }   // right
        ];

        // Check each direction
        for (const direction of directions) {
            try {
                const destination = this.calculateDestination(startPos, direction, distance);
                
                // Validate the move using the movement validation system
                if (this.isValidMove(startPos, destination, distance, playerId)) {
                    destinations.push({
                        row: destination.row,
                        col: destination.col,
                        direction,
                        distance
                    });
                }
            } catch (error) {
                // Invalid destination, continue to next
                continue;
            }
        }

        return destinations;
    }

    /**
     * Calculate destination position with wraparound
     * @param {Object} startPos - Starting position
     * @param {Object} direction - Direction vector
     * @param {number} distance - Distance to move
     * @returns {Object} Destination position with wraparound
     */
    calculateDestination(startPos, direction, distance) {
        let newRow = startPos.row + (direction.row * distance);
        let newCol = startPos.col + (direction.col * distance);

        // Handle wraparound (4x4 board)
        newRow = ((newRow % 4) + 4) % 4;
        newCol = ((newCol % 4) + 4) % 4;

        return { row: newRow, col: newCol };
    }

    /**
     * Validate if a move is legal using movement validation system
     * @param {Object} startPos - Starting position
     * @param {Object} endPos - Ending position
     * @param {number} distance - Move distance
     * @param {string} playerId - ID of the player
     * @returns {boolean} True if move is valid
     */
    isValidMove(startPos, endPos, distance, playerId) {
        try {
            // Generate path for validation
            const path = this.generatePath(startPos, endPos, distance);
            if (!path) {
                return false;
            }

            // Get card type at starting position
            const startCard = this.game.board.getCard(startPos.row, startPos.col);
            const cardType = this.getCardTypeForValidation(startCard);

            // Use global movement validation functions if available
            if (typeof validateMoveOptimized === 'function') {
                const result = validateMoveOptimized(
                    startPos,
                    path,
                    distance,
                    cardType,
                    this.game.board,
                    this.game.players,
                    playerId
                );
                return result.valid;
            }

            // Fallback to basic validation
            return this.basicMoveValidation(endPos, playerId);
        } catch (error) {
            console.error('Move validation error:', error);
            return false;
        }
    }

    /**
     * Generate movement path from start to end position
     * @param {Object} startPos - Starting position
     * @param {Object} endPos - Ending position
     * @param {number} distance - Expected distance
     * @returns {Array|null} Path array or null if invalid
     */
    generatePath(startPos, endPos, distance) {
        const path = [startPos];
        let currentPos = { ...startPos };

        // Calculate direction
        let rowDiff = endPos.row - startPos.row;
        let colDiff = endPos.col - startPos.col;

        // Handle wraparound
        if (Math.abs(rowDiff) > 2) {
            rowDiff = rowDiff > 0 ? rowDiff - 4 : rowDiff + 4;
        }
        if (Math.abs(colDiff) > 2) {
            colDiff = colDiff > 0 ? colDiff - 4 : colDiff + 4;
        }

        // Must be orthogonal movement
        if (rowDiff !== 0 && colDiff !== 0) {
            return null;
        }
        if (Math.abs(rowDiff) + Math.abs(colDiff) !== distance) {
            return null;
        }

        // Generate step-by-step path
        const stepRow = rowDiff === 0 ? 0 : (rowDiff > 0 ? 1 : -1);
        const stepCol = colDiff === 0 ? 0 : (colDiff > 0 ? 1 : -1);

        for (let i = 0; i < distance; i++) {
            currentPos = {
                row: ((currentPos.row + stepRow) + 4) % 4,
                col: ((currentPos.col + stepCol) + 4) % 4
            };
            path.push({ ...currentPos });
        }

        return path;
    }

    /**
     * Get card type string for validation system
     * @param {Object} card - Card object
     * @returns {string} Card type for validation
     */
    getCardTypeForValidation(card) {
        if (!card) return 'A';
        
        if (card.isJoker || card.type === 'joker') {
            return 'joker';
        }
        if (card.type === 'A' || card.type === 'ace') {
            return 'A';
        }
        if (card.value) {
            return card.value.toString();
        }
        if (card.type) {
            return card.type.toString();
        }
        return 'A';
    }

    /**
     * Basic move validation fallback
     * @param {Object} endPos - Ending position  
     * @param {string} playerId - ID of the player
     * @returns {boolean} True if move is valid
     */
    basicMoveValidation(endPos, playerId) {
        // Check if destination card exists and is not collapsed
        const destinationCard = this.game.board.getCard(endPos.row, endPos.col);
        if (!destinationCard || destinationCard.collapsed) {
            return false;
        }

        // Check if opponent pawn is on destination (can pass through, but not end on)
        const opponentId = playerId === 'red' ? 'blue' : 'red';
        const opponentPawn = this.game.players[opponentId].pawn;
        if (opponentPawn.row === endPos.row && opponentPawn.col === endPos.col) {
            return false;
        }

        return true;
    }

    /**
     * Highlight destination cards with staggered animation and step-by-step preview
     * @param {Array} destinations - Array of destination positions
     */
    async highlightDestinations(destinations) {
        this.highlightedElements = [];

        // Group destinations by distance for better organization
        const destinationsByDistance = this.groupDestinationsByDistance(destinations);

        let elementIndex = 0;
        
        // Highlight immediate destinations (distance 1) first
        if (destinationsByDistance[1]) {
            for (const dest of destinationsByDistance[1]) {
                const cardElement = this.getCardElement(dest.row, dest.col);
                
                if (cardElement) {
                    const highlightClass = dest.isJokerMove 
                        ? this.previewConfig.jokerHighlightClass 
                        : this.previewConfig.highlightClass;

                    // Add immediate destination highlighting
                    setTimeout(() => {
                        animationController.highlightElement(cardElement, highlightClass);
                        cardElement.classList.add('immediate-destination');
                        cardElement.classList.add('path-step');
                        cardElement.setAttribute('data-step-number', dest.distance || 1);
                        
                        // Add distance indicator for clarity
                        if (dest.distance) {
                            cardElement.classList.add(`distance-${dest.distance}`);
                        }
                    }, elementIndex * this.previewConfig.staggerDelay);

                    this.highlightedElements.push({
                        element: cardElement,
                        highlightClass,
                        position: dest,
                        isImmediate: true
                    });
                    
                    elementIndex++;
                }
            }
        }

        // Then highlight further destinations with progressive delay
        for (let distance = 2; distance <= 4; distance++) {
            if (destinationsByDistance[distance]) {
                for (const dest of destinationsByDistance[distance]) {
                    const cardElement = this.getCardElement(dest.row, dest.col);
                    
                    if (cardElement) {
                        const highlightClass = dest.isJokerMove 
                            ? this.previewConfig.jokerHighlightClass 
                            : this.previewConfig.highlightClass;

                        // Add progressive delay for step-by-step reveal
                        setTimeout(() => {
                            animationController.highlightElement(cardElement, highlightClass);
                            cardElement.classList.add('path-step');
                            cardElement.setAttribute('data-step-number', dest.distance || distance);
                            
                            // Add distance indicator
                            if (dest.distance) {
                                cardElement.classList.add(`distance-${dest.distance}`);
                            }
                        }, elementIndex * this.previewConfig.staggerDelay);

                        this.highlightedElements.push({
                            element: cardElement,
                            highlightClass,
                            position: dest,
                            isImmediate: false
                        });
                        
                        elementIndex++;
                    }
                }
            }
        }
    }

    /**
     * Group destinations by their distance for organized highlighting
     * @param {Array} destinations - Array of destination positions
     * @returns {Object} Destinations grouped by distance
     */
    groupDestinationsByDistance(destinations) {
        const grouped = {};
        
        destinations.forEach(dest => {
            const distance = dest.distance || 1;
            if (!grouped[distance]) {
                grouped[distance] = [];
            }
            grouped[distance].push(dest);
        });
        
        return grouped;
    }

    /**
     * Clear current move preview
     * @returns {Promise} Promise that resolves when preview is cleared
     */
    async clearPreview() {
        // Remove highlights from all elements
        this.highlightedElements.forEach(({ element, highlightClass }) => {
            animationController.unhighlightElement(element, highlightClass);
            element.classList.remove('path-step', 'immediate-destination');
            element.removeAttribute('data-step-number');
            
            // Remove distance indicator classes
            for (let i = 1; i <= 4; i++) {
                element.classList.remove(`distance-${i}`);
            }
        });

        // Clear selected pawn highlight
        if (this.currentPreview) {
            const pawnElement = this.getPawnElement(this.currentPreview.pawnPosition);
            if (pawnElement) {
                animationController.unhighlightElement(pawnElement, this.previewConfig.selectedPawnClass);
            }
        }

        this.highlightedElements = [];
        this.validDestinations = [];
        this.currentPreview = null;
    }

    /**
     * Execute move to a highlighted destination
     * @param {number} row - Target row position
     * @param {number} col - Target column position
     * @returns {Promise<boolean>} Promise that resolves to success status
     */
    async executeMove(row, col) {
        try {
            const destination = this.isValidDestination(row, col);
            if (!destination) {
                console.log('Invalid destination for move execution');
                return false;
            }

            if (!this.currentPreview) {
                console.log('No active preview for move execution');
                return false;
            }

            const startPos = this.currentPreview.pawnPosition;
            const endPos = { row, col };
            const playerId = this.currentPreview.playerId;
            const distance = destination.distance || 1;

            console.log(`Executing move from (${startPos.row},${startPos.col}) to (${row},${col}) distance ${distance}`);

            // Generate full path for move execution
            const path = this.generatePath(startPos, endPos, distance);
            if (!path) {
                console.log('Unable to generate valid path for move execution');
                return false;
            }

            // Clear preview before executing move
            await this.clearPreview();

            // Execute the move using the move execution system
            const success = await this.executeMoveWithSystem(startPos, endPos, path, distance, playerId);
            
            if (success) {
                console.log('Move executed successfully');
                // Show visual feedback for successful move completion
                await this.showMoveCompletionFeedback(startPos, endPos, playerId);
                return true;
            } else {
                console.log('Move execution failed');
                // Show error feedback
                await this.showMoveExecutionError(endPos);
                return false;
            }
        } catch (error) {
            console.error('Error during move execution:', error);
            await this.showMoveExecutionError({ row, col });
            return false;
        }
    }

    /**
     * Execute move using the Phase 4 move execution system
     * @param {Object} startPos - Starting position
     * @param {Object} endPos - Ending position
     * @param {Array} path - Movement path
     * @param {number} distance - Move distance
     * @param {string} playerId - Player ID
     * @returns {Promise<boolean>} Success status
     */
    async executeMoveWithSystem(startPos, endPos, path, distance, playerId) {
        try {
            // Get card type for execution system
            const startCard = this.game.board.getCard(startPos.row, startPos.col);
            const cardType = this.getCardTypeForValidation(startCard);

            // Use Phase 4 complete move execution if available
            if (typeof executeCompleteMove === 'function') {
                console.log('Using Phase 4 executeCompleteMove system');
                const result = executeCompleteMove(
                    startPos,
                    endPos,
                    path,
                    cardType,
                    playerId
                );
                return result.success;
            }

            // Use Phase 4 move executor if available
            if (typeof executeMoveToDestination === 'function') {
                console.log('Using Phase 4 executeMoveToDestination system');
                const result = executeMoveToDestination(
                    startPos,
                    endPos,
                    path,
                    cardType,
                    this.game.board,
                    this.game.players,
                    playerId
                );
                return result.success;
            }

            // Use Phase 4 move with feedback if available
            if (typeof executeMoveWithFeedback === 'function') {
                console.log('Using Phase 4 executeMoveWithFeedback system');
                const result = executeMoveWithFeedback(
                    startPos,
                    endPos,
                    path,
                    cardType,
                    playerId
                );
                return result.success;
            }

            // Fallback to basic move execution
            console.log('Using fallback basic move execution');
            return await this.basicMoveExecution(startPos, endPos, playerId);
        } catch (error) {
            console.error('Move execution system error:', error);
            return false;
        }
    }

    /**
     * Basic move execution fallback
     * @param {Object} startPos - Starting position
     * @param {Object} endPos - Ending position
     * @param {string} playerId - Player ID
     * @returns {Promise<boolean>} Success status
     */
    async basicMoveExecution(startPos, endPos, playerId) {
        try {
            // Update pawn position
            if (this.game.players && this.game.players[playerId]) {
                this.game.players[playerId].pawn.row = endPos.row;
                this.game.players[playerId].pawn.col = endPos.col;
            }

            // Mark starting card as collapsed
            const startCard = this.game.board.getCard(startPos.row, startPos.col);
            if (startCard) {
                startCard.collapsed = true;
            }

            // Animate pawn movement
            const pawnElement = this.getPawnElement(startPos);
            if (pawnElement) {
                await animationController.animatePawnMovement(pawnElement, startPos, endPos);
            }

            // Animate card collapse
            const startCardElement = this.getCardElement(startPos.row, startPos.col);
            if (startCardElement) {
                await animationController.markCardAsCollapsed(startCardElement);
            }

            // Switch turns
            if (this.game.switchTurn) {
                this.game.switchTurn();
            }

            return true;
        } catch (error) {
            console.error('Basic move execution error:', error);
            return false;
        }
    }

    /**
     * Show visual feedback for successful move completion
     * @param {Object} startPos - Starting position of the move
     * @param {Object} endPos - Ending position of the move
     * @param {string} playerId - Player who made the move
     */
    async showMoveCompletionFeedback(startPos, endPos, playerId) {
        try {
            // Animate pawn movement if elements are available
            const pawnElement = this.getPawnElement(startPos);
            if (pawnElement) {
                await animationController.animatePawnMovement(pawnElement, startPos, endPos);
            }

            // Animate starting card collapse
            const startCardElement = this.getCardElement(startPos.row, startPos.col);
            if (startCardElement) {
                await animationController.markCardAsCollapsed(startCardElement);
            }

            // Highlight destination briefly to show completion
            const endCardElement = this.getCardElement(endPos.row, endPos.col);
            if (endCardElement) {
                endCardElement.classList.add('move-completed');
                setTimeout(() => {
                    endCardElement.classList.remove('move-completed');
                }, 1000);
            }

            // Update board state visuals
            await this.updateBoardStateVisuals();

            console.log(`Move completion feedback shown for player ${playerId}`);
        } catch (error) {
            console.error('Error showing move completion feedback:', error);
        }
    }

    /**
     * Update board state visuals after move completion
     */
    async updateBoardStateVisuals() {
        try {
            // Re-render board if render function is available
            if (typeof renderBoard === 'function') {
                renderBoard();
            }

            // Update turn indicator if available
            if (typeof updateTurnIndicator === 'function') {
                updateTurnIndicator();
            }

            // Update game status if available
            if (typeof updateGameStatus === 'function') {
                updateGameStatus();
            }

            // Trigger any other board state updates
            if (this.game && this.game.updateVisuals) {
                this.game.updateVisuals();
            }
        } catch (error) {
            console.error('Error updating board state visuals:', error);
        }
    }

    /**
     * Show visual feedback for move execution errors
     * @param {Object} position - Position where error occurred
     */
    async showMoveExecutionError(position) {
        const cardElement = this.getCardElement(position.row, position.col);
        if (cardElement) {
            await animationController.shakeElement(cardElement);
        }
    }

    /**
     * Check if a position is a valid destination in current preview
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @returns {Object|null} Destination info if valid, null otherwise
     */
    isValidDestination(row, col) {
        if (!this.currentPreview) {
            return null;
        }

        return this.validDestinations.find(dest => 
            dest.row === row && dest.col === col
        ) || null;
    }

    /**
     * Get card element at specific position
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @returns {HTMLElement|null} Card element or null
     */
    getCardElement(row, col) {
        return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    /**
     * Get pawn element at specific position
     * @param {Object} position - Position {row, col}
     * @returns {HTMLElement|null} Pawn element or null
     */
    getPawnElement(position) {
        const cardElement = this.getCardElement(position.row, position.col);
        return cardElement ? cardElement.querySelector('.pawn') : null;
    }

    /**
     * Get current preview state
     * @returns {Object|null} Current preview state or null
     */
    getCurrentPreview() {
        return this.currentPreview;
    }

    /**
     * Check if preview is currently active
     * @returns {boolean} True if preview is active
     */
    isPreviewActive() {
        return this.currentPreview !== null;
    }
}

// Export singleton instance
export const movePreview = new MovePreview();