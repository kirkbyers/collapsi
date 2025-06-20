# Product Requirements Document: Phase 6 - Game Rules & Win Conditions

## Introduction/Overview

Phase 6 completes the core game logic for Collapsi by implementing legal move detection and win condition handling. Currently, the game has a comprehensive movement validation system but lacks the ability to detect when players have no legal moves available, which is essential for determining game end conditions. This phase will integrate existing validation modules to provide complete game rule enforcement and victory detection.

## Goals

1. Implement legal move detection that integrates with existing movement validation system
2. Complete win condition logic that determines when the game ends and declares a winner
3. Provide clear visual feedback when the game ends with a winner announcement modal
4. Maintain performance standards (<100ms) for move detection operations
5. Ensure seamless integration with existing game state and UI systems

## User Stories

- **As a player**, I want the game to automatically detect when I have no legal moves available so that the game can end properly
- **As a player**, I want to see a clear announcement when the game ends declaring the winner so I know the outcome
- **As a player**, I want to easily start a new game after one ends so I can continue playing
- **As a player**, I want the game to respond quickly when checking for legal moves so gameplay feels smooth

## Functional Requirements

### Step 6.1: Legal Move Detection
1. The system must implement the `getAllPossibleMoves()` function in `js/game.js` to replace the current placeholder
2. The system must integrate with existing movement validation modules in `js/movement/` without duplicating logic
3. The system must check all possible moves for the current player using existing validation functions
4. The system must return an array of valid move objects containing source and destination positions
5. The system must complete legal move detection within 100ms performance target
6. The system must handle both regular numbered cards and joker cards when detecting moves
7. The system must account for card collapse state when determining legal moves

### Step 6.2: Win Condition Logic  
8. The system must integrate legal move detection with the existing `checkGameEnd()` function framework
9. The system must use the `checkNewPlayerValidMoves()` function in turn manager for game end detection
10. The system must determine the winner as the last player able to make a legal move
11. The system must update `gameState.gameStatus` to "ended" when no legal moves are available
12. The system must set `gameState.winner` to the appropriate player color when game ends
13. The system must display a modal with "[Color] Wins" message when game ends
14. The system must include a "New Game" button in the winner modal
15. The system must follow existing game styling with bold colors and high contrast for the modal

### Step 6.3: UI Integration
16. The winner modal must appear centered over the game board
17. The modal must prevent interaction with the board until dismissed
18. The "New Game" button must reset the game state and start a fresh game
19. The modal must use the same styling patterns as existing game UI elements
20. The turn indicator must show "Game Over" state until new game is started

## Non-Goals (Out of Scope)

- Additional game end conditions beyond "no legal moves available"
- Game timeout or timer functionality  
- Draw/tie game scenarios
- Undo/redo functionality for completed games
- Game statistics or win/loss tracking
- Multiplayer-specific win condition handling
- Custom win condition configurations

## Design Considerations

- Winner modal should use the existing color scheme (bold reds, blues, high contrast)
- Modal should be mobile-optimized with touch-friendly button sizing (44px+ targets)
- Modal styling should be consistent with the existing "How to Play" dialog
- Winner announcement should be clearly visible and celebratory in tone
- New Game button should be prominently displayed and easily accessible

## Technical Considerations

- Must integrate with existing movement validation system in `js/movement/` modules
- Should reuse existing validation functions rather than creating new logic
- Must maintain compatibility with existing game state management
- Should leverage existing turn management and rendering systems
- Must work with both local and online multiplayer modes
- Should maintain localStorage integration for game state persistence

## Success Metrics

- Legal move detection completes within 100ms performance target
- Game correctly identifies winner in all valid game end scenarios
- Winner modal displays immediately when game ends
- New Game functionality successfully resets and starts fresh games
- No regressions in existing movement validation or game flow

## Open Questions

- Should the legal move detection cache results for performance optimization? No. That's too far.
- Should there be any animation or transition when the winner modal appears? Confeti would be cool.
- Should the modal be dismissible by clicking outside of it, or only via the New Game button? Yes. Dismiss on blur.