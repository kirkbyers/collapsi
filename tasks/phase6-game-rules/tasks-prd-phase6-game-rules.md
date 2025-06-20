# Task List: Phase 6 - Game Rules & Win Conditions

## Relevant Files

- `js/game.js` - Contains the main game logic and state management, including the implemented `getAllPossibleMoves()` function and `checkGameEnd()` logic
- `js/movement/index.js` - Main movement validation system export that is integrated for legal move detection
- `js/movement/validation/movement-validator.js` - Core validation orchestration that is used to check possible moves
- `js/movement/execution/turn-manager.js` - Turn management system that handles game end detection via `checkNewPlayerValidMoves()` and `updateGameEndUI()`
- `js/ui.js` - UI interaction handlers with implemented winner modal functions (`showWinnerModal`, `hideWinnerModal`, etc.)
- `css/ui-components.css` - Stylesheet containing winner modal styling with existing design patterns
- `index.html` - Contains winner modal HTML structure with semantic elements and proper accessibility

### Notes

- This project uses manual testing approach with console.log debugging
- Performance target is <100ms for legal move detection operations (✅ ACHIEVED)
- Integration reuses existing validation logic without duplication (✅ COMPLETED)
- Modal follows existing "How to Play" dialog styling patterns (✅ COMPLETED)
- Winner modal includes confetti animation and proper accessibility features
- Game end detection works through both `checkGameEnd()` and turn manager paths
- Modal is dismissible via escape key, backdrop click, or close button

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

- [x] 3.0 Create Winner Modal UI Component
  - [x] 3.1 Create modal HTML structure (JavaScript-generated or static in index.html)
  - [x] 3.2 Add "[Color] Wins" message with dynamic color insertion
  - [x] 3.3 Include "New Game" button with proper event handling
  - [x] 3.4 Make modal dismissible on blur (clicking outside modal area)
  - [x] 3.5 Center modal over game board with proper z-index layering
  - [x] 3.6 Prevent board interaction while modal is displayed
  - [x] 3.7 Add confetti animation when modal appears

- [x] 4.0 Integrate Game End Detection with Turn Management
  - [x] 4.1 Connect legal move detection to turn switching logic in turn manager
  - [x] 4.2 Check for game end condition after each completed move
  - [x] 4.3 Handle game end detection in both regular and joker turn scenarios  
  - [x] 4.4 Ensure game state persistence works with ended game status
  - [ ] 4.5 Test integration with both local and online multiplayer modes

- [x] 5.0 Add Winner Modal Styling and Animations
  - [x] 5.1 Apply existing game color scheme (bold reds, blues, high contrast) to modal
  - [x] 5.2 Style modal consistent with existing "How to Play" dialog patterns
  - [x] 5.3 Ensure mobile optimization with 44px+ touch targets for buttons
  - [x] 5.4 Add celebratory styling for winner announcement text
  - [x] 5.5 Implement confetti animation using CSS or JavaScript
  - [x] 5.6 Add smooth modal appearance transition
  - [x] 5.7 Style "New Game" button prominently and accessibly

## Additional Tasks for Full Phase 6 Completion

- [x] 6.0 Implement New Game Functionality
  - [x] 6.1 Create `startNewGame()` function in `js/game.js` to properly reset game state
  - [x] 6.2 Reset all game state variables (board, players, current player, move history)
  - [x] 6.3 Clear board visual state and re-render fresh game
  - [x] 6.4 Reset turn management state and UI indicators
  - [x] 6.5 Ensure proper cleanup of modal and game end states
  - [x] 6.6 Test new game functionality from modal and other triggers

- [x] 7.0 Testing and Polish
  - [x] 7.1 Test complete game flow from start to finish with winner modal
  - [x] 7.2 Test new game functionality across different game end scenarios
  - [x] 7.3 Verify mobile responsiveness of winner modal on various screen sizes
  - [x] 7.4 Test modal dismissal methods (escape, backdrop, close button)
  - [x] 7.5 Verify confetti animation performance across devices
  - [x] 7.6 Test integration with multiplayer modes (if applicable)
  - [x] 7.7 Performance testing of legal move detection under various board states