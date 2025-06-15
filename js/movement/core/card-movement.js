// Collapsi Game - Card Movement Logic
// Core card type definitions and movement distance rules

// Get the movement distance value for a card type
function getCardMovementDistance(cardType) {
    console.log(`Getting movement distance for card type: ${cardType}`);
    
    try {
        if (!cardType) {
            throw new Error('Card type is required');
        }
        
        // Jokers allow flexible movement (1-4 spaces)
        if (cardType === 'red-joker' || cardType === 'black-joker') {
            return { type: 'joker', allowedDistances: [1, 2, 3, 4] };
        }
        
        // Numbered cards require exact movement
        switch (cardType) {
            case 'A':
                return { type: 'fixed', distance: 1 };
            case '2':
                return { type: 'fixed', distance: 2 };
            case '3':
                return { type: 'fixed', distance: 3 };
            case '4':
                return { type: 'fixed', distance: 4 };
            default:
                throw new Error(`Unknown card type: ${cardType}`);
        }
    } catch (error) {
        console.error('Error getting card movement distance:', error.message);
        return null;
    }
}

// Validate that a movement distance matches the starting card requirements
function validateMovementDistance(startingCardType, plannedDistance) {
    console.log(`Validating movement distance: ${plannedDistance} for card type: ${startingCardType}`);
    
    try {
        if (!startingCardType || typeof plannedDistance !== 'number') {
            throw new Error('Starting card type and planned distance are required');
        }
        
        if (plannedDistance < 1 || plannedDistance > 4) {
            return {
                valid: false,
                reason: `Invalid distance: ${plannedDistance}. Must be between 1 and 4.`
            };
        }
        
        const cardMovement = getCardMovementDistance(startingCardType);
        if (!cardMovement) {
            return {
                valid: false,
                reason: `Unable to determine movement rules for card type: ${startingCardType}`
            };
        }
        
        // Handle joker cards (flexible movement)
        if (cardMovement.type === 'joker') {
            const isValidJokerDistance = cardMovement.allowedDistances.includes(plannedDistance);
            return {
                valid: isValidJokerDistance,
                reason: isValidJokerDistance ? 
                    `Valid joker movement: ${plannedDistance} spaces` :
                    `Invalid joker movement: ${plannedDistance}. Must be 1, 2, 3, or 4 spaces.`
            };
        }
        
        // Handle fixed distance cards (exact movement required)
        if (cardMovement.type === 'fixed') {
            const isExactMatch = cardMovement.distance === plannedDistance;
            return {
                valid: isExactMatch,
                reason: isExactMatch ?
                    `Valid exact movement: ${plannedDistance} spaces` :
                    `Invalid movement: ${plannedDistance}. Card '${startingCardType}' requires exactly ${cardMovement.distance} spaces.`
            };
        }
        
        return {
            valid: false,
            reason: `Unknown movement type for card: ${startingCardType}`
        };
    } catch (error) {
        console.error('Error validating movement distance:', error.message);
        return {
            valid: false,
            reason: `Validation error: ${error.message}`
        };
    }
}