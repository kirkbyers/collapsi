// Collapsi Game - Card Collapse Management System
// Task 4.3: Implement starting card collapse (flip face-down) after move completion

// Main function to collapse starting card after move completion
function collapseStartingCardAfterMove(startingPosition, moveData) {
    console.log('Collapsing starting card after move completion:', {
        startingPosition,
        playerId: moveData.playerId,
        cardType: moveData.cardType
    });
    
    try {
        // Get the starting card
        const startingCard = getCardAtPosition(startingPosition.row, startingPosition.col);
        if (!startingCard) {
            return {
                success: false,
                reason: `Starting card not found at position (${startingPosition.row}, ${startingPosition.col})`
            };
        }
        
        // Validate that the card can be collapsed
        const canCollapseResult = validateCardCanBeCollapsed(startingCard, startingPosition, moveData);
        if (!canCollapseResult.canCollapse) {
            return {
                success: false,
                reason: canCollapseResult.reason
            };
        }
        
        // Perform the collapse operation
        const collapseResult = performCardCollapse(startingCard, startingPosition, moveData);
        if (!collapseResult.success) {
            return collapseResult;
        }
        
        // Update visual representation
        const visualUpdateResult = updateCardCollapseVisuals(startingPosition, startingCard);
        if (!visualUpdateResult.success) {
            console.warn('Visual update failed but collapse succeeded:', visualUpdateResult.reason);
        }
        
        console.log(`Starting card at (${startingPosition.row}, ${startingPosition.col}) collapsed successfully`);
        return {
            success: true,
            reason: 'Starting card collapsed successfully',
            collapseData: {
                position: startingPosition,
                cardType: startingCard.type,
                timestamp: new Date().toISOString(),
                moveId: moveData.timestamp
            }
        };
        
    } catch (error) {
        console.error('Error collapsing starting card:', error.message);
        return {
            success: false,
            reason: `Card collapse error: ${error.message}`
        };
    }
}

// Validate that a card can be collapsed
function validateCardCanBeCollapsed(card, position, moveData) {
    console.log('Validating card can be collapsed:', card.type);
    
    try {
        // Check if card is already collapsed
        if (card.collapsed) {
            return {
                canCollapse: false,
                reason: 'Card is already collapsed'
            };
        }
        
        // Check if card still has a player on it
        if (card.hasPlayer) {
            return {
                canCollapse: false,
                reason: 'Cannot collapse card with player still on it'
            };
        }
        
        // Check if this card was actually the starting position for the move
        const moveStartPos = moveData.startingPosition;
        if (position.row !== moveStartPos.row || position.col !== moveStartPos.col) {
            return {
                canCollapse: false,
                reason: 'Position does not match move starting position'
            };
        }
        
        // Additional rule validations based on game rules
        const gameRuleValidation = validateCollapseAgainstGameRules(card, position, moveData);
        if (!gameRuleValidation.valid) {
            return {
                canCollapse: false,
                reason: gameRuleValidation.reason
            };
        }
        
        return {
            canCollapse: true,
            reason: 'Card can be collapsed'
        };
        
    } catch (error) {
        console.error('Error validating card collapse:', error.message);
        return {
            canCollapse: false,
            reason: `Validation error: ${error.message}`
        };
    }
}

// Validate collapse against Collapsi game rules
function validateCollapseAgainstGameRules(card, position, moveData) {
    console.log('Validating collapse against game rules');
    
    try {
        // Rule: Card must have been a starting card for a completed move
        // This is implicit from the move completion
        
        // Rule: Player must have completed their move (not still on the card)
        if (card.hasPlayer && card.playerId === moveData.playerId) {
            return {
                valid: false,
                reason: 'Player has not completed their move off this card'
            };
        }
        
        // Rule: Card type must match the move data
        if (card.type !== moveData.cardType) {
            return {
                valid: false,
                reason: 'Card type does not match move data'
            };
        }
        
        // Additional game-specific validations can be added here
        
        return {
            valid: true,
            reason: 'Collapse follows game rules'
        };
        
    } catch (error) {
        console.error('Error validating against game rules:', error.message);
        return {
            valid: false,
            reason: `Game rule validation error: ${error.message}`
        };
    }
}

// Perform the actual card collapse operation
function performCardCollapse(card, position, moveData) {
    console.log(`Performing collapse on ${card.type} at (${position.row}, ${position.col})`);
    
    try {
        // Mark card as collapsed
        card.collapsed = true;
        
        // Set collapse timestamp and metadata
        card.collapseData = {
            timestamp: new Date().toISOString(),
            triggeredByMove: moveData.timestamp,
            playerId: moveData.playerId,
            previousType: card.type
        };
        
        // Update game state to track collapsed cards
        if (!gameState.collapsedCards) {
            gameState.collapsedCards = [];
        }
        
        gameState.collapsedCards.push({
            position: { ...position },
            cardType: card.type,
            collapseTimestamp: card.collapseData.timestamp,
            triggeredByPlayerId: moveData.playerId,
            moveId: moveData.timestamp
        });
        
        console.log(`Card ${card.type} at (${position.row}, ${position.col}) collapsed`);
        return {
            success: true,
            reason: 'Card collapsed successfully',
            collapseTimestamp: card.collapseData.timestamp
        };
        
    } catch (error) {
        console.error('Error performing card collapse:', error.message);
        return {
            success: false,
            reason: `Collapse operation error: ${error.message}`
        };
    }
}

// Update visual representation of collapsed card
function updateCardCollapseVisuals(position, card) {
    console.log(`Updating collapse visuals for card at (${position.row}, ${position.col})`);
    
    try {
        // Find the card element in the DOM
        const cardElement = document.querySelector(`[data-row="${position.row}"][data-col="${position.col}"]`);
        
        if (!cardElement) {
            return {
                success: false,
                reason: 'Card element not found in DOM'
            };
        }
        
        // Add collapsed class for styling
        cardElement.classList.add('collapsed');
        
        // Update card content to show collapsed state
        const cardText = cardElement.querySelector('.card-text');
        if (cardText) {
            // Store original text for potential restoration
            cardText.dataset.originalText = cardText.textContent;
            
            // Show collapsed state (face-down)
            cardText.textContent = '⬛'; // Collapsed card indicator
            cardText.style.color = '#333';
        }
        
        // Add animation class for collapse effect
        cardElement.classList.add('collapsing');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            cardElement.classList.remove('collapsing');
        }, 500);
        
        // Update data attributes
        cardElement.dataset.collapsed = 'true';
        cardElement.dataset.collapseTimestamp = card.collapseData.timestamp;
        
        console.log('Card collapse visuals updated');
        return {
            success: true,
            reason: 'Visual update completed'
        };
        
    } catch (error) {
        console.error('Error updating collapse visuals:', error.message);
        return {
            success: false,
            reason: `Visual update error: ${error.message}`
        };
    }
}

// Check if a card is collapsed at a specific position
function isCardCollapsedAt(position) {
    try {
        const card = getCardAtPosition(position.row, position.col);
        return card ? card.collapsed : false;
    } catch (error) {
        console.error('Error checking if card is collapsed:', error.message);
        return false;
    }
}

// Get all collapsed cards on the board
function getAllCollapsedCards() {
    console.log('Getting all collapsed cards');
    
    try {
        const collapsedCards = [];
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const card = getCardAtPosition(row, col);
                if (card && card.collapsed) {
                    collapsedCards.push({
                        position: { row, col },
                        cardType: card.type,
                        collapseData: card.collapseData
                    });
                }
            }
        }
        
        console.log(`Found ${collapsedCards.length} collapsed cards`);
        return collapsedCards;
        
    } catch (error) {
        console.error('Error getting collapsed cards:', error.message);
        return [];
    }
}

// Count collapsed cards on the board
function getCollapsedCardCount() {
    try {
        return getAllCollapsedCards().length;
    } catch (error) {
        console.error('Error counting collapsed cards:', error.message);
        return 0;
    }
}

// Restore a collapsed card (for debugging/undo functionality)
function restoreCollapsedCard(position) {
    console.log(`Restoring collapsed card at (${position.row}, ${position.col})`);
    
    try {
        const card = getCardAtPosition(position.row, position.col);
        if (!card) {
            return {
                success: false,
                reason: 'Card not found at position'
            };
        }
        
        if (!card.collapsed) {
            return {
                success: false,
                reason: 'Card is not collapsed'
            };
        }
        
        // Restore card state
        card.collapsed = false;
        const originalCollapseData = card.collapseData;
        delete card.collapseData;
        
        // Update visuals
        const cardElement = document.querySelector(`[data-row="${position.row}"][data-col="${position.col}"]`);
        if (cardElement) {
            cardElement.classList.remove('collapsed');
            cardElement.removeAttribute('data-collapsed');
            cardElement.removeAttribute('data-collapse-timestamp');
            
            const cardText = cardElement.querySelector('.card-text');
            if (cardText && cardText.dataset.originalText) {
                cardText.textContent = cardText.dataset.originalText;
                cardText.style.removeProperty('color');
                delete cardText.dataset.originalText;
            }
        }
        
        // Remove from game state collapsed cards list
        if (gameState.collapsedCards) {
            gameState.collapsedCards = gameState.collapsedCards.filter(
                c => c.position.row !== position.row || c.position.col !== position.col
            );
        }
        
        console.log('Collapsed card restored');
        return {
            success: true,
            reason: 'Card restored successfully',
            originalCollapseData
        };
        
    } catch (error) {
        console.error('Error restoring collapsed card:', error.message);
        return {
            success: false,
            reason: `Restore error: ${error.message}`
        };
    }
}

// Reset all card collapse states (for game reset)
function resetAllCardCollapseStates() {
    console.log('Resetting all card collapse states');
    
    try {
        let restoredCount = 0;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const card = getCardAtPosition(row, col);
                if (card && card.collapsed) {
                    card.collapsed = false;
                    delete card.collapseData;
                    restoredCount++;
                    
                    // Update visuals
                    const cardElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    if (cardElement) {
                        cardElement.classList.remove('collapsed');
                        cardElement.removeAttribute('data-collapsed');
                        cardElement.removeAttribute('data-collapse-timestamp');
                        
                        const cardText = cardElement.querySelector('.card-text');
                        if (cardText && cardText.dataset.originalText) {
                            cardText.textContent = cardText.dataset.originalText;
                            cardText.style.removeProperty('color');
                            delete cardText.dataset.originalText;
                        }
                    }
                }
            }
        }
        
        // Clear game state
        gameState.collapsedCards = [];
        
        console.log(`Reset ${restoredCount} collapsed cards`);
        return {
            success: true,
            reason: `Reset ${restoredCount} collapsed cards`,
            restoredCount
        };
        
    } catch (error) {
        console.error('Error resetting card collapse states:', error.message);
        return {
            success: false,
            reason: `Reset error: ${error.message}`
        };
    }
}

// Get collapse statistics for game analysis
function getCollapseStatistics() {
    console.log('Getting collapse statistics');
    
    try {
        const stats = {
            totalCollapsed: getCollapsedCardCount(),
            collapsedByType: {},
            collapsedByPlayer: {},
            chronology: []
        };
        
        if (gameState.collapsedCards) {
            gameState.collapsedCards.forEach(collapsedCard => {
                // Count by card type
                const cardType = collapsedCard.cardType;
                stats.collapsedByType[cardType] = (stats.collapsedByType[cardType] || 0) + 1;
                
                // Count by player
                const playerId = collapsedCard.triggeredByPlayerId;
                stats.collapsedByPlayer[playerId] = (stats.collapsedByPlayer[playerId] || 0) + 1;
                
                // Add to chronology
                stats.chronology.push({
                    timestamp: collapsedCard.collapseTimestamp,
                    position: collapsedCard.position,
                    cardType: collapsedCard.cardType,
                    playerId: collapsedCard.triggeredByPlayerId
                });
            });
            
            // Sort chronology by timestamp
            stats.chronology.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        }
        
        console.log('Collapse statistics:', stats);
        return stats;
        
    } catch (error) {
        console.error('Error getting collapse statistics:', error.message);
        return {
            totalCollapsed: 0,
            collapsedByType: {},
            collapsedByPlayer: {},
            chronology: []
        };
    }
}

console.log('Card collapse management system loaded');