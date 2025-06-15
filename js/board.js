// Collapsi Game - Board Management and DOM Rendering

// Function to render current board state to DOM
function renderBoardToDOM(board) {
    console.log('Rendering board to DOM...');
    
    if (!board || board.length !== 4) {
        console.error('Invalid board structure:', board);
        return;
    }
    
    // Get the game board container from the DOM
    const boardContainer = document.querySelector('.game-board') || document.querySelector('#game-board');
    if (!boardContainer) {
        console.error('Game board container not found in DOM');
        return;
    }
    
    // Ensure the container has proper CSS Grid setup for JavaScript-generated content
    if (!boardContainer.style.display || boardContainer.style.display !== 'grid') {
        boardContainer.style.display = 'grid';
        boardContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
        boardContainer.style.gridTemplateRows = 'repeat(4, 1fr)';
        boardContainer.style.gap = '8px';
        console.log('Applied CSS Grid layout to game board container');
    }
    
    // Clear existing board content
    boardContainer.innerHTML = '';
    
    // Create board grid with JavaScript-generated elements
    board.forEach((row, rowIndex) => {
        row.forEach((card, colIndex) => {
            const cardElement = document.createElement('div');
            
            // Add CSS classes for styling - ensure compatibility with existing CSS
            const cardTypeClass = card.type === 'A' ? 'card-a' : `card-${card.type}`;
            cardElement.className = `card game-card ${cardTypeClass}${card.collapsed ? ' collapsed' : ''}`;
            
            // Add data attributes for future touch event handling
            cardElement.setAttribute('data-row', rowIndex);
            cardElement.setAttribute('data-col', colIndex);
            cardElement.setAttribute('data-card-type', card.type);
            cardElement.setAttribute('data-collapsed', card.collapsed);
            
            // Ensure card maintains responsive behavior
            cardElement.style.minHeight = '60px';
            cardElement.style.aspectRatio = '1';
            
            // Set card content based on type
            let cardContent = '';
            if (card.type === 'red-joker') {
                cardContent = '<span class="joker red">🃏</span>';
            } else if (card.type === 'black-joker') {
                cardContent = '<span class="joker black">🃏</span>';
            } else {
                cardContent = `<span class="card-value">${card.type}</span>`;
            }
            
            // Add player pawn if present
            if (card.hasPlayer && card.playerId) {
                cardContent += `<span class="player-pawn ${card.playerId}">●</span>`;
            }
            
            cardElement.innerHTML = cardContent;
            
            // Append to board container
            boardContainer.appendChild(cardElement);
        });
    });
    
    console.log('Board rendered successfully');
}

// Function to update a specific card's visual state
function updateCardDisplay(row, col, cardData) {
    const cardElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!cardElement) {
        console.error(`Card element not found at position (${row}, ${col})`);
        return;
    }
    
    // Update classes - maintain CSS compatibility
    const cardTypeClass = cardData.type === 'A' ? 'card-a' : `card-${cardData.type}`;
    cardElement.className = `card game-card ${cardTypeClass}${cardData.collapsed ? ' collapsed' : ''}`;
    
    // Update data attributes
    cardElement.setAttribute('data-collapsed', cardData.collapsed);
    
    // Ensure responsive properties are maintained
    if (!cardElement.style.minHeight) {
        cardElement.style.minHeight = '60px';
        cardElement.style.aspectRatio = '1';
    }
    
    // Update content if player state changed
    let cardContent = '';
    if (cardData.type === 'red-joker') {
        cardContent = '<span class="joker red">🃏</span>';
    } else if (cardData.type === 'black-joker') {
        cardContent = '<span class="joker black">🃏</span>';
    } else {
        cardContent = `<span class="card-value">${cardData.type}</span>`;
    }
    
    if (cardData.hasPlayer && cardData.playerId) {
        cardContent += `<span class="player-pawn ${cardData.playerId}">●</span>`;
    }
    
    cardElement.innerHTML = cardContent;
    
    console.log(`Card at (${row}, ${col}) updated`);
}

// Getter function to retrieve card state at specific board position
function getCardAt(row, col) {
    // Validate input parameters
    if (typeof row !== 'number' || typeof col !== 'number') {
        console.error('Invalid coordinates: row and col must be numbers');
        return null;
    }
    
    if (row < 0 || row >= 4 || col < 0 || col >= 4) {
        console.error(`Coordinates out of bounds: (${row}, ${col}). Valid range: 0-3`);
        return null;
    }
    
    // Check if gameState and board exist
    if (!gameState || !gameState.board || gameState.board.length !== 4) {
        console.error('Game state or board not properly initialized');
        return null;
    }
    
    if (!gameState.board[row] || gameState.board[row].length !== 4) {
        console.error(`Board row ${row} not properly initialized`);
        return null;
    }
    
    const card = gameState.board[row][col];
    console.log(`Retrieved card at (${row}, ${col}):`, card);
    
    return card;
}

// Helper function to check if position is valid
function isValidPosition(row, col) {
    return (
        typeof row === 'number' && 
        typeof col === 'number' && 
        row >= 0 && row < 4 && 
        col >= 0 && col < 4
    );
}

// Helper function to check if card exists at position
function cardExistsAt(row, col) {
    if (!isValidPosition(row, col)) {
        return false;
    }
    
    return (
        gameState && 
        gameState.board && 
        gameState.board[row] && 
        gameState.board[row][col]
    );
}

// Setter function to update card state at specific board position
function setCardAt(row, col, updates) {
    // Validate input parameters
    if (!isValidPosition(row, col)) {
        console.error(`Invalid position: (${row}, ${col})`);
        return false;
    }
    
    if (!updates || typeof updates !== 'object') {
        console.error('Updates parameter must be an object');
        return false;
    }
    
    // Check if gameState and board exist
    if (!gameState || !gameState.board || !cardExistsAt(row, col)) {
        console.error('Game state or card not properly initialized');
        return false;
    }
    
    const card = gameState.board[row][col];
    const originalState = { ...card };
    
    // Update card properties
    if ('collapsed' in updates) {
        card.collapsed = Boolean(updates.collapsed);
    }
    
    if ('hasPlayer' in updates) {
        card.hasPlayer = Boolean(updates.hasPlayer);
    }
    
    if ('playerId' in updates) {
        card.playerId = updates.playerId;
        // Auto-set hasPlayer based on playerId
        if (updates.playerId) {
            card.hasPlayer = true;
        } else if (!updates.hasPlayer) {
            card.hasPlayer = false;
        }
    }
    
    // Update DOM representation
    updateCardDisplay(row, col, card);
    
    console.log(`Card at (${row}, ${col}) updated:`, { 
        from: originalState, 
        to: card,
        updates: updates
    });
    
    return true;
}

// Function to update multiple card properties at once
function updateCardState(row, col, newState) {
    if (!isValidPosition(row, col)) {
        console.error(`Invalid position: (${row}, ${col})`);
        return false;
    }
    
    if (!cardExistsAt(row, col)) {
        console.error(`Card not found at position (${row}, ${col})`);
        return false;
    }
    
    const card = gameState.board[row][col];
    
    // Preserve core properties that shouldn't be changed
    const preservedProperties = {
        type: card.type,
        position: card.position
    };
    
    // Merge new state while preserving core properties
    Object.assign(card, newState, preservedProperties);
    
    // Update DOM
    updateCardDisplay(row, col, card);
    
    console.log(`Card state updated at (${row}, ${col}):`, card);
    
    return true;
}

// Function to mark a card as collapsed (face-down) with visual distinction
function collapseCard(row, col) {
    if (!isValidPosition(row, col)) {
        console.error(`Invalid position for collapse: (${row}, ${col})`);
        return false;
    }
    
    if (!cardExistsAt(row, col)) {
        console.error(`Card not found at position (${row}, ${col}) for collapse`);
        return false;
    }
    
    const card = gameState.board[row][col];
    
    // Check if card is already collapsed
    if (card.collapsed) {
        console.log(`Card at (${row}, ${col}) is already collapsed`);
        return true;
    }
    
    // Mark card as collapsed
    card.collapsed = true;
    
    // Remove any players from collapsed card
    if (card.hasPlayer) {
        console.log(`Removing player ${card.playerId} from collapsed card at (${row}, ${col})`);
        card.hasPlayer = false;
        card.playerId = null;
    }
    
    // Update DOM with visual distinction
    updateCardDisplay(row, col, card);
    
    console.log(`Card at (${row}, ${col}) collapsed successfully:`, card);
    
    return true;
}

// Function to check if a card is collapsed
function isCardCollapsed(row, col) {
    if (!isValidPosition(row, col)) {
        console.error(`Invalid position: (${row}, ${col})`);
        return null;
    }
    
    if (!cardExistsAt(row, col)) {
        console.error(`Card not found at position (${row}, ${col})`);
        return null;
    }
    
    return gameState.board[row][col].collapsed;
}

// Function to get all collapsed card positions
function getCollapsedCards() {
    const collapsedCards = [];
    
    if (!gameState || !gameState.board) {
        console.error('Game state not initialized');
        return collapsedCards;
    }
    
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (gameState.board[row][col] && gameState.board[row][col].collapsed) {
                collapsedCards.push({
                    row,
                    col,
                    type: gameState.board[row][col].type
                });
            }
        }
    }
    
    console.log('Collapsed cards:', collapsedCards);
    return collapsedCards;
}

// Function to reset all cards to face-up (for new game)
function resetAllCards() {
    if (!gameState || !gameState.board) {
        console.error('Game state not initialized');
        return false;
    }
    
    let resetCount = 0;
    
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (gameState.board[row][col]) {
                gameState.board[row][col].collapsed = false;
                gameState.board[row][col].hasPlayer = false;
                gameState.board[row][col].playerId = null;
                updateCardDisplay(row, col, gameState.board[row][col]);
                resetCount++;
            }
        }
    }
    
    console.log(`Reset ${resetCount} cards to face-up state`);
    return true;
}

// Function to ensure board container maintains responsive layout
function ensureResponsiveLayout() {
    const boardContainer = document.querySelector('.game-board') || document.querySelector('#game-board');
    
    if (!boardContainer) {
        console.error('Board container not found for responsive layout check');
        return false;
    }
    
    // Check if CSS Grid is properly applied
    const computedStyle = window.getComputedStyle(boardContainer);
    
    if (computedStyle.display !== 'grid') {
        console.log('Fixing CSS Grid display');
        boardContainer.style.display = 'grid';
    }
    
    if (!computedStyle.gridTemplateColumns.includes('repeat(4, 1fr)') && 
        !computedStyle.gridTemplateColumns.includes('1fr 1fr 1fr 1fr')) {
        console.log('Fixing CSS Grid columns');
        boardContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
    }
    
    if (!computedStyle.gridTemplateRows.includes('repeat(4, 1fr)') && 
        !computedStyle.gridTemplateRows.includes('1fr 1fr 1fr 1fr')) {
        console.log('Fixing CSS Grid rows');
        boardContainer.style.gridTemplateRows = 'repeat(4, 1fr)';
    }
    
    // Ensure all cards maintain proper aspect ratio
    const cards = boardContainer.querySelectorAll('.card, .game-card');
    cards.forEach(card => {
        if (!card.style.aspectRatio) {
            card.style.aspectRatio = '1';
        }
        if (!card.style.minHeight) {
            card.style.minHeight = '60px';
        }
    });
    
    console.log('Responsive layout check completed');
    return true;
}

// Function to test responsive behavior across different viewport sizes
function testResponsiveLayout() {
    console.log('Testing responsive layout...');
    
    const boardContainer = document.querySelector('.game-board') || document.querySelector('#game-board');
    if (!boardContainer) {
        console.error('Board container not found for testing');
        return;
    }
    
    const rect = boardContainer.getBoundingClientRect();
    console.log('Board container dimensions:', {
        width: rect.width,
        height: rect.height,
        aspectRatio: rect.width / rect.height
    });
    
    const cards = boardContainer.querySelectorAll('.card, .game-card');
    if (cards.length > 0) {
        const cardRect = cards[0].getBoundingClientRect();
        console.log('Card dimensions:', {
            width: cardRect.width,
            height: cardRect.height,
            aspectRatio: cardRect.width / cardRect.height
        });
    }
    
    console.log('Total cards rendered:', cards.length);
    console.log('Expected cards: 16');
}

// Function to test board rendering across different screen sizes
function testResponsiveBoardRendering() {
    console.log('Testing responsive board rendering across different screen sizes...');
    
    const boardContainer = document.querySelector('.game-board') || document.querySelector('#game-board');
    if (!boardContainer) {
        console.error('Board container not found for responsive testing');
        return false;
    }
    
    // Test different viewport widths (simulating different devices)
    const testSizes = [
        { width: 375, height: 667, device: 'iPhone SE' },
        { width: 390, height: 844, device: 'iPhone 12' },
        { width: 414, height: 896, device: 'iPhone 11 Pro Max' },
        { width: 768, height: 1024, device: 'iPad' },
        { width: 1024, height: 768, device: 'iPad Landscape' },
        { width: 1440, height: 900, device: 'Desktop' }
    ];
    
    // Store original dimensions
    const originalStyle = {
        width: document.body.style.width,
        height: document.body.style.height
    };
    
    testSizes.forEach(size => {
        console.log(`Testing ${size.device} (${size.width}x${size.height})`);
        
        // Simulate viewport size
        document.body.style.width = `${size.width}px`;
        
        // Force layout recalculation
        boardContainer.style.width = '';
        boardContainer.offsetHeight; // Trigger reflow
        
        // Get computed dimensions
        const rect = boardContainer.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(boardContainer);
        
        // Check responsive behavior
        const results = {
            device: size.device,
            containerWidth: rect.width,
            containerHeight: rect.height,
            aspectRatio: rect.width / rect.height,
            maxWidth: computedStyle.maxWidth,
            gridColumns: computedStyle.gridTemplateColumns,
            gridRows: computedStyle.gridTemplateRows,
            gap: computedStyle.gap
        };
        
        console.log('Results:', results);
        
        // Validate responsive requirements
        const isValid = 
            rect.width <= size.width && // Fits within viewport
            Math.abs(results.aspectRatio - 1) < 0.1 && // Roughly square
            computedStyle.display === 'grid' && // Uses CSS Grid
            computedStyle.gridTemplateColumns.includes('1fr'); // Equal columns
        
        console.log(`${size.device}: ${isValid ? 'PASS' : 'FAIL'}`);
    });
    
    // Restore original styles
    document.body.style.width = originalStyle.width;
    document.body.style.height = originalStyle.height;
    
    console.log('Responsive testing completed');
    return true;
}

// Function to validate mobile-first responsive design
function validateMobileFirstDesign() {
    console.log('Validating mobile-first responsive design...');
    
    const boardContainer = document.querySelector('.game-board') || document.querySelector('#game-board');
    if (!boardContainer) {
        console.error('Board container not found');
        return false;
    }
    
    const cards = boardContainer.querySelectorAll('.card, .game-card');
    
    // Check mobile-specific requirements
    const validations = {
        cardCount: cards.length === 16,
        gridLayout: window.getComputedStyle(boardContainer).display === 'grid',
        touchTargets: true, // Will check below
        aspectRatio: true, // Will check below
        responsiveWidth: true // Will check below
    };
    
    // Validate touch targets (minimum 44px)
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
            validations.touchTargets = false;
        }
    });
    
    // Validate aspect ratios
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const aspectRatio = rect.width / rect.height;
        if (Math.abs(aspectRatio - 1) > 0.1) { // Should be roughly square
            validations.aspectRatio = false;
        }
    });
    
    // Validate responsive width
    const containerRect = boardContainer.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    if (containerRect.width > viewportWidth * 0.95) { // Should not exceed 95% of viewport
        validations.responsiveWidth = false;
    }
    
    console.log('Mobile-first validation results:', validations);
    
    const allValid = Object.values(validations).every(v => v === true);
    console.log(`Mobile-first design: ${allValid ? 'VALID' : 'INVALID'}`);
    
    return allValid;
}

// Function to run comprehensive responsive tests
function runResponsiveTests() {
    console.log('Running comprehensive responsive tests...');
    
    // Run basic responsive layout test
    const responsiveTest = testResponsiveLayout();
    
    // Run screen size tests
    const screenSizeTest = testResponsiveBoardRendering();
    
    // Run mobile-first validation
    const mobileFirstTest = validateMobileFirstDesign();
    
    // Run layout consistency check
    const layoutTest = ensureResponsiveLayout();
    
    const results = {
        responsiveLayout: responsiveTest,
        screenSizeTesting: screenSizeTest,
        mobileFirstDesign: mobileFirstTest,
        layoutConsistency: layoutTest,
        overallPassing: responsiveTest && screenSizeTest && mobileFirstTest && layoutTest
    };
    
    console.log('Comprehensive responsive test results:', results);
    return results;
}

console.log('Board management functions loaded');