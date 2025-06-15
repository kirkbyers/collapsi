# Tasks for Phase 2: JavaScript Game Data Structure

## Relevant Files

- `js/game.js` - Core game logic, state management, and game initialization functions (created: contains CARD_DECK array, shuffleDeck function, gameState object, initializeNewGame function, and convertDeckToBoard function)
- `js/board.js` - Board management functions for rendering and card state manipulation (created: contains renderBoardToDOM, updateCardDisplay, getCardAt, setCardAt, updateCardState, collapseCard, ensureResponsiveLayout, and helper functions)
- `js/player.js` - Player management and positioning system (created: contains Player class, createPlayers, placePlayersOnJokers, renderPlayerPawns, movePlayerPawn, highlightCurrentPlayerPawn, and helper functions)
- `index.html` - Main HTML file that will be updated to include new JavaScript files
- `css/styles.css` - Updated with player pawn styles, positioning, and current player highlighting
- `css/board.css` - Board-specific styles that work with dynamic content

### Notes

- This phase focuses on data structures and DOM rendering without user interactions
- Console logging should be used for debugging and manual testing
- All JavaScript should use modern ES6+ features
- DOM manipulation should be efficient and maintain responsive design

## Tasks

- [x] 1.0 Create Core Game Data Structure and Card Management
  - [x] 1.1 Define complete card deck array with all 16 cards (red-joker, black-joker, 4×A, 4×2, 4×3, 4×4)
  - [x] 1.2 Implement Fisher-Yates shuffle algorithm for randomizing card order
  - [x] 1.3 Create game state object with board, players, currentPlayer, gameStatus, and moveHistory properties
  - [x] 1.4 Build function to initialize new game with proper default values
  - [x] 1.5 Add function to convert 1D shuffled deck to 4×4 2D board array

- [x] 2.0 Implement Board Management and DOM Rendering System
  - [x] 2.1 Create function to render current board state to DOM, replacing static HTML
  - [x] 2.2 Build getter function to retrieve card state at specific board position (row, col)
  - [x] 2.3 Build setter function to update card state (including collapsed state)
  - [x] 2.4 Implement function to mark cards as collapsed (face-down) with visual distinction
  - [x] 2.5 Ensure JavaScript-generated board maintains responsive CSS Grid layout

- [x] 3.0 Build Player Management and Positioning System
  - [x] 3.1 Create player objects with position {row, col} coordinates and color properties
  - [x] 3.2 Implement function to automatically place players on their respective joker cards during initialization
  - [x] 3.3 Build function to identify which player starts on which joker (red on red-joker, blue on black-joker)
  - [x] 3.4 Add visual representation of player pawns on their current board positions

- [ ] 4.0 Integrate Dynamic Board with Existing HTML/CSS
  - [ ] 4.1 Update index.html to include js/game.js and js/board.js script references
  - [ ] 4.2 Replace static HTML board elements with JavaScript-generated board
  - [ ] 4.3 Ensure CSS classes are properly applied to dynamic elements for styling consistency
  - [ ] 4.4 Add data attributes to card elements for future touch event handling support
  - [ ] 4.5 Test board rendering across different screen sizes to maintain mobile-first responsive design

- [ ] 5.0 Add Development Tools and Testing Support
  - [ ] 5.1 Add console.log statements for debugging shuffle algorithm and board initialization
  - [ ] 5.2 Create function to manually test different board configurations for development
  - [ ] 5.3 Add validation to ensure all 16 cards are properly placed in 4×4 grid
  - [ ] 5.4 Implement basic error logging for initialization failures
  - [ ] 5.5 Test game state object serialization for future localStorage compatibility