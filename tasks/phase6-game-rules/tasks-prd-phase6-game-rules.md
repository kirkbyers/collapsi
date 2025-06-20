# Task List: Phase 6 - Game Rules & Win Conditions

## Relevant Files

- `js/game.js` - Contains the main game logic and state management, including the `getAllPossibleMoves()` function that needs implementation
- `js/movement/index.js` - Main movement validation system export that will be integrated for legal move detection
- `js/movement/validation/movement-validator.js` - Core validation orchestration that will be used to check possible moves
- `js/movement/execution/turn-manager.js` - Turn management system that handles game end detection via `checkNewPlayerValidMoves()`
- `js/ui.js` - UI interaction handlers that will need winner modal implementation
- `css/styles.css` - Main stylesheet that will need winner modal styling with existing design patterns
- `index.html` - May need modal HTML structure or rely on JavaScript-generated elements

### Notes

- This project uses manual testing approach with console.log debugging
- Performance target is <100ms for legal move detection operations
- Integration should reuse existing validation logic without duplication
- Modal should follow existing "How to Play" dialog styling patterns

## Tasks

- [x] 1.0 Implement Legal Move Detection System
  - [x] 1.1 Replace `getAllPossibleMoves()` placeholder in `js/game.js` with actual implementation
  - [x] 1.2 Import and integrate existing movement validation modules from `js/movement/`
  - [x] 1.3 Iterate through all board positions to find current player's pawns
  - [x] 1.4 For each pawn position, check all possible destination cards using existing validation
  - [x] 1.5 Handle both numbered cards and joker cards in move detection logic
  - [x] 1.6 Account for collapsed card state when determining valid destinations
  - [x] 1.7 Return array of move objects with source and destination positions
  - [x] 1.8 Add performance logging to ensure <100ms target is met

- [x] 2.0 Complete Win Condition Logic Integration
  - [x] 2.1 Update `checkGameEnd()` function in `js/game.js` to use legal move detection
  - [x] 2.2 Integrate with `checkNewPlayerValidMoves()` in turn manager for automatic detection
  - [x] 2.3 Set `gameState.gameStatus` to "ended" when no legal moves are available
  - [x] 2.4 Set `gameState.winner` to the last player able to make a legal move
  - [x] 2.5 Trigger winner modal display when game ends
  - [x] 2.6 Update turn indicator to show "Game Over" state

- [ ] 3.0 Create Winner Modal UI Component
  - [ ] 3.1 Create modal HTML structure (JavaScript-generated or static in index.html)
  - [ ] 3.2 Add "[Color] Wins" message with dynamic color insertion
  - [ ] 3.3 Include "New Game" button with proper event handling
  - [ ] 3.4 Make modal dismissible on blur (clicking outside modal area)
  - [ ] 3.5 Center modal over game board with proper z-index layering
  - [ ] 3.6 Prevent board interaction while modal is displayed
  - [ ] 3.7 Add confetti animation when modal appears

- [ ] 4.0 Integrate Game End Detection with Turn Management
  - [ ] 4.1 Connect legal move detection to turn switching logic in turn manager
  - [ ] 4.2 Check for game end condition after each completed move
  - [ ] 4.3 Handle game end detection in both regular and joker turn scenarios  
  - [ ] 4.4 Ensure game state persistence works with ended game status
  - [ ] 4.5 Test integration with both local and online multiplayer modes

- [ ] 5.0 Add Winner Modal Styling and Animations
  - [ ] 5.1 Apply existing game color scheme (bold reds, blues, high contrast) to modal
  - [ ] 5.2 Style modal consistent with existing "How to Play" dialog patterns
  - [ ] 5.3 Ensure mobile optimization with 44px+ touch targets for buttons
  - [ ] 5.4 Add celebratory styling for winner announcement text
  - [ ] 5.5 Implement confetti animation using CSS or JavaScript
  - [ ] 5.6 Add smooth modal appearance transition
  - [ ] 5.7 Style "New Game" button prominently and accessibly