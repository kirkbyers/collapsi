/**
 * Game Controls - Hamburger menu and game control interface
 * Handles new game functionality, turn indicators, and global game controls
 */

export class GameControls {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.isMenuOpen = false;
        
        // UI Elements
        this.hamburgerButton = null;
        this.menuDropdown = null;
        this.turnIndicator = null;
        
        // Event handlers for cleanup
        this.boundHandlers = {
            hamburgerClick: this.toggleMenu.bind(this),
            documentClick: this.handleDocumentClick.bind(this),
            menuItemClick: this.handleMenuItemClick.bind(this)
        };
        
        this.initialize();
    }

    /**
     * Initialize game controls UI elements
     */
    initialize() {
        this.createHamburgerMenu();
        this.createMenuDropdown();
        this.createTurnIndicator();
        this.setupEventListeners();
        this.updateTurnIndicator();
        
        console.log('Game controls initialized');
    }

    /**
     * Create the hamburger menu button
     */
    createHamburgerMenu() {
        this.hamburgerButton = document.createElement('button');
        this.hamburgerButton.className = 'hamburger-menu';
        this.hamburgerButton.setAttribute('aria-label', 'Open game menu');
        this.hamburgerButton.setAttribute('aria-expanded', 'false');
        
        // Create hamburger lines
        for (let i = 0; i < 3; i++) {
            const line = document.createElement('div');
            line.className = 'hamburger-line';
            this.hamburgerButton.appendChild(line);
        }
        
        // Append to document body
        document.body.appendChild(this.hamburgerButton);
    }

    /**
     * Create the dropdown menu
     */
    createMenuDropdown() {
        this.menuDropdown = document.createElement('div');
        this.menuDropdown.className = 'menu-dropdown';
        this.menuDropdown.setAttribute('role', 'menu');
        this.menuDropdown.setAttribute('aria-label', 'Game options');
        
        // Create menu items
        this.createMenuItem('New Game', 'new-game', 'Start a new game');
        
        // Append to document body
        document.body.appendChild(this.menuDropdown);
    }

    /**
     * Create a menu item
     * @param {string} text - Display text
     * @param {string} action - Action identifier
     * @param {string} ariaLabel - Accessibility label
     */
    createMenuItem(text, action, ariaLabel) {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.textContent = text;
        menuItem.setAttribute('data-action', action);
        menuItem.setAttribute('role', 'menuitem');
        menuItem.setAttribute('aria-label', ariaLabel);
        menuItem.setAttribute('tabindex', '0');
        
        this.menuDropdown.appendChild(menuItem);
    }

    /**
     * Create the turn indicator
     */
    createTurnIndicator() {
        this.turnIndicator = document.createElement('div');
        this.turnIndicator.className = 'turn-indicator';
        this.turnIndicator.setAttribute('aria-live', 'polite');
        this.turnIndicator.setAttribute('aria-label', 'Current player turn');
        this.turnIndicator.textContent = 'Red Turn';
        
        // Append to document body
        document.body.appendChild(this.turnIndicator);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Hamburger button click
        if (this.hamburgerButton) {
            this.hamburgerButton.addEventListener('click', this.boundHandlers.hamburgerClick);
        }
        
        // Menu item clicks
        if (this.menuDropdown) {
            this.menuDropdown.addEventListener('click', this.boundHandlers.menuItemClick);
            
            // Keyboard support for menu items
            this.menuDropdown.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.boundHandlers.menuItemClick(event);
                }
            });
        }
        
        // Document click for closing menu
        document.addEventListener('click', this.boundHandlers.documentClick);
        
        // Escape key to close menu
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });
    }

    /**
     * Toggle hamburger menu open/closed
     */
    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    /**
     * Open the hamburger menu
     */
    openMenu() {
        if (this.isMenuOpen) return;
        
        console.log('Opening game menu');
        
        this.isMenuOpen = true;
        this.hamburgerButton.classList.add('open');
        this.hamburgerButton.setAttribute('aria-expanded', 'true');
        this.menuDropdown.classList.add('visible');
        
        // Focus first menu item for accessibility
        const firstMenuItem = this.menuDropdown.querySelector('.menu-item');
        if (firstMenuItem) {
            firstMenuItem.focus();
        }
    }

    /**
     * Close the hamburger menu
     */
    closeMenu() {
        if (!this.isMenuOpen) return;
        
        console.log('Closing game menu');
        
        this.isMenuOpen = false;
        this.hamburgerButton.classList.remove('open');
        this.hamburgerButton.setAttribute('aria-expanded', 'false');
        this.menuDropdown.classList.remove('visible');
        
        // Return focus to hamburger button
        this.hamburgerButton.focus();
    }

    /**
     * Handle document clicks for auto-closing menu
     * @param {Event} event - Click event
     */
    handleDocumentClick(event) {
        if (!this.isMenuOpen) return;
        
        // Don't close if clicking within the menu or hamburger button
        if (this.hamburgerButton.contains(event.target) || 
            this.menuDropdown.contains(event.target)) {
            return;
        }
        
        this.closeMenu();
    }

    /**
     * Handle menu item clicks
     * @param {Event} event - Click or keydown event
     */
    handleMenuItemClick(event) {
        const menuItem = event.target.closest('.menu-item');
        if (!menuItem) return;
        
        const action = menuItem.getAttribute('data-action');
        console.log('Menu item clicked:', action);
        
        // Close menu after selection
        this.closeMenu();
        
        // Execute the action
        this.executeMenuAction(action);
    }

    /**
     * Execute menu actions
     * @param {string} action - Action to execute
     */
    executeMenuAction(action) {
        try {
            switch (action) {
                case 'new-game':
                    this.startNewGame();
                    break;
                default:
                    console.warn('Unknown menu action:', action);
            }
        } catch (error) {
            console.error('Error executing menu action:', error);
        }
    }

    /**
     * Start a new game
     */
    startNewGame() {
        console.log('Starting new game...');
        
        try {
            // Show confirmation if game is in progress
            if (this.isGameInProgress()) {
                const confirmed = confirm('Are you sure you want to start a new game? Current progress will be lost.');
                if (!confirmed) {
                    return;
                }
            }
            
            // Reset game state
            if (this.game && this.game.resetGame) {
                this.game.resetGame();
            } else if (typeof resetGame === 'function') {
                resetGame();
            } else {
                console.warn('No reset game function available');
                // Fallback: reload page
                window.location.reload();
            }
            
            // Update turn indicator
            this.updateTurnIndicator();
            
            console.log('New game started successfully');
        } catch (error) {
            console.error('Error starting new game:', error);
        }
    }

    /**
     * Check if a game is currently in progress
     * @returns {boolean} True if game is in progress
     */
    isGameInProgress() {
        try {
            // Check if there are moves in the game history
            if (typeof gameState !== 'undefined' && gameState.moveHistory) {
                return gameState.moveHistory.length > 0;
            }
            
            // Fallback check
            return false;
        } catch (error) {
            console.error('Error checking game progress:', error);
            return false;
        }
    }

    /**
     * Update the turn indicator to show current player
     */
    updateTurnIndicator() {
        if (!this.turnIndicator) return;
        
        try {
            const currentPlayer = getCurrentPlayer();
            
            if (currentPlayer) {
                const playerName = currentPlayer.id === 'red' ? 'Red' : 'Blue';
                const turnClass = currentPlayer.id === 'red' ? 'red-turn' : 'blue-turn';
                
                this.turnIndicator.textContent = `${playerName} Turn`;
                this.turnIndicator.className = `turn-indicator ${turnClass}`;
                
                console.log(`Turn indicator updated: ${playerName} Turn`);
            } else {
                this.turnIndicator.textContent = 'Game Over';
                this.turnIndicator.className = 'turn-indicator';
            }
        } catch (error) {
            console.error('Error updating turn indicator:', error);
            this.turnIndicator.textContent = 'Turn Unknown';
            this.turnIndicator.className = 'turn-indicator';
        }
    }

    /**
     * Update game controls based on current game state
     */
    updateFromGameState() {
        this.updateTurnIndicator();
        
        // Close menu if game state changes significantly
        if (this.isMenuOpen) {
            this.closeMenu();
        }
    }

    /**
     * Get current game controls state
     * @returns {Object} Current state information
     */
    getState() {
        return {
            menuOpen: this.isMenuOpen,
            currentTurn: this.turnIndicator?.textContent || 'Unknown',
            gameInProgress: this.isGameInProgress()
        };
    }

    /**
     * Show temporary notification
     * @param {string} message - Message to show
     * @param {string} type - Type of notification ('success', 'error', 'info')
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `game-notification ${type}`;
        notification.textContent = message;
        notification.setAttribute('role', 'alert');
        
        // Position near turn indicator
        notification.style.position = 'fixed';
        notification.style.top = '70px';
        notification.style.right = '20px';
        notification.style.background = type === 'success' ? '#28A745' : 
                                       type === 'error' ? '#DC3545' : '#17A2B8';
        notification.style.color = 'white';
        notification.style.padding = '8px 16px';
        notification.style.borderRadius = '4px';
        notification.style.fontSize = '14px';
        notification.style.zIndex = '101';
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * Cleanup and destroy game controls
     */
    destroy() {
        // Remove event listeners
        if (this.hamburgerButton) {
            this.hamburgerButton.removeEventListener('click', this.boundHandlers.hamburgerClick);
        }
        
        if (this.menuDropdown) {
            this.menuDropdown.removeEventListener('click', this.boundHandlers.menuItemClick);
        }
        
        document.removeEventListener('click', this.boundHandlers.documentClick);
        
        // Remove DOM elements
        if (this.hamburgerButton && this.hamburgerButton.parentNode) {
            this.hamburgerButton.parentNode.removeChild(this.hamburgerButton);
        }
        
        if (this.menuDropdown && this.menuDropdown.parentNode) {
            this.menuDropdown.parentNode.removeChild(this.menuDropdown);
        }
        
        if (this.turnIndicator && this.turnIndicator.parentNode) {
            this.turnIndicator.parentNode.removeChild(this.turnIndicator);
        }
        
        // Clear references
        this.hamburgerButton = null;
        this.menuDropdown = null;
        this.turnIndicator = null;
        
        console.log('Game controls destroyed');
    }
}

export default GameControls;