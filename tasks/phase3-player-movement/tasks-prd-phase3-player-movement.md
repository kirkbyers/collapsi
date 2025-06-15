# Task List: Phase 3 Player Movement Logic

## Relevant Files

- `js/game.js` - Core game logic and state management, turn control and win conditions
- `js/movement.js` - Movement validation system with path checking and performance optimization  
- `js/board.js` - Board management, coordinate system and card manipulation
- `js/player.js` - Player/pawn logic, position tracking and movement mechanics
- `js/utils.js` - Utility functions for deck shuffling, error logging, and localStorage
- `js/ui.js` - UI interactions, path visualization and touch/click handlers
- `css/board.css` - Visual feedback styles for movement paths, valid destinations, and wraparound indicators

### Notes

- Movement validation should complete within 100ms on mobile devices
- Use modulo arithmetic for wraparound edge calculations
- Store move history in game state for debugging purposes
- Prevent all invalid moves through proactive UI validation

## Tasks

- [x] 1.0 Implement Core Movement Validation System
  - [x] 1.1 Create function to validate exact movement distance matches starting card value
  - [x] 1.2 Implement orthogonal movement validation (up/down/left/right only)
  - [x] 1.3 Add wraparound edge calculation using modulo arithmetic
  - [x] 1.4 Create path validation to prevent revisiting cards during single turn
  - [x] 1.5 Add validation to prevent ending on starting card or occupied positions
  - [x] 1.6 Implement performance optimization to achieve <100ms validation time

- [ ] 2.0 Create Joker Card Movement Mechanics
  - [ ] 2.1 Implement joker distance selection (1-4 spaces) with incremental movement
  - [ ] 2.2 Add early turn completion option for joker moves
  - [ ] 2.3 Create UI controls for joker movement distance selection
  - [ ] 2.4 Validate joker movement paths follow same rules as numbered cards
  - [ ] 2.5 Handle joker movement state transitions and turn completion

- [ ] 3.0 Build Path Visualization and UI Feedback
  - [ ] 3.1 Add visual highlighting for complete movement paths
  - [ ] 3.2 Implement real-time valid destination highlighting
  - [ ] 3.3 Create wraparound edge visual indicators (arrows or connecting lines)
  - [ ] 3.4 Add current pawn position highlighting
  - [ ] 3.5 Implement invalid move prevention through UI (disable/hide invalid squares)
  - [ ] 3.6 Ensure path visualization updates within 50ms of user interaction

- [ ] 4.0 Implement Move Execution and Game State Updates
  - [ ] 4.1 Create immediate move execution on valid destination selection
  - [ ] 4.2 Update game board state after completed moves
  - [ ] 4.3 Implement starting card collapse (flip face-down) after move completion
  - [ ] 4.4 Add automatic turn switching after successful move execution
  - [ ] 4.5 Integrate move execution with existing board rendering system

- [ ] 5.0 Add Move History and Debugging Support
  - [ ] 5.1 Create move history data structure to store turn sequences
  - [ ] 5.2 Track complete path taken for each move
  - [ ] 5.3 Log move validation decisions for debugging
  - [ ] 5.4 Add visited cards tracking during current turn
  - [ ] 5.5 Implement move history persistence (memory-based for debugging)