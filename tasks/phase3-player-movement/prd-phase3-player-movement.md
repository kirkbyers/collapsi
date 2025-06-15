# Product Requirements Document: Phase 3 Player Movement Logic

## Introduction/Overview

Phase 3 implements the core movement mechanics for the Collapsi game, enabling players to move their pawns according to the game rules. This feature builds upon the existing game board and data structures from Phase 2, adding interactive movement validation, path visualization, and turn management. The system must enforce exact movement distances, handle wraparound board edges, and provide smooth user experience for both regular cards and joker cards.

## Goals

1. Implement exact movement validation according to card values (must move exactly the number shown)
2. Enable joker card flexibility (1-4 spaces with early turn completion)
3. Provide real-time path visualization during movement planning
4. Ensure moves execute immediately upon valid selection
5. Prevent all invalid move attempts through proactive validation
6. Handle board wraparound mechanics seamlessly
7. Maintain move history for debugging and potential future features
8. Achieve <100ms response time for move validation on mobile devices

## User Stories

**As a player with a numbered card (A, 2, 3, 4):**
- I want to move exactly the number of spaces shown on my starting card
- I want to see my complete movement path highlighted as I plan my move
- I want invalid moves to be prevented so I don't make illegal moves
- I want to understand when I can wrap around board edges

**As a player starting from a joker card:**
- I want to choose how many spaces to move (1-4)
- I want to make my move in incremental steps (1 space at a time)
- I want to end my turn early if I reach my desired position
- I want to see my movement options clearly visualized

**As any player:**
- I want moves to execute immediately when I select a valid destination
- I want to see wraparound possibilities clearly indicated
- I want the game to respond quickly (<100ms) to my movement attempts

## Functional Requirements

### Core Movement Validation
1. The system must validate that players move exactly the number of spaces indicated by their starting card
2. The system must prevent players from moving through any card more than once during a single turn
3. The system must prevent players from ending their move on their starting card
4. The system must prevent players from ending their move on a card occupied by their opponent
5. The system must only allow orthogonal movement (up, down, left, right)
6. The system must handle board wraparound for all four edges (left↔right, top↔bottom)

### Joker Card Mechanics
7. The system must allow players starting from joker cards to choose movement distance (1-4 spaces)
8. The system must enable joker movement in 1-space increments with turn completion option
9. The system must allow early turn completion for joker moves (player can stop before reaching max distance)

### Path Visualization
10. The system must highlight the complete movement path as the player selects their route
11. The system must visually indicate wraparound edge connections
12. The system must show valid destination squares in real-time
13. The system must provide visual feedback for the current pawn position

### Move Execution
14. The system must execute valid moves immediately upon destination selection
15. The system must update the game board state after each completed move
16. The system must collapse the starting card (flip face-down) after move completion
17. The system must switch turns automatically after successful move execution

### Invalid Move Prevention
18. The system must disable/hide invalid destination squares
19. The system must prevent selection of collapsed cards
20. The system must prevent selection of occupied cards
21. The system must prevent moves that would exceed the required distance
22. The system must prevent moves that would fall short of the required distance

### Move History & Debugging
23. The system must store the sequence of cards visited during each turn
24. The system must track the complete path taken for each move
25. The system must maintain move history for debugging purposes
26. The system must log move validation decisions for troubleshooting

### Performance Requirements
27. The system must validate moves within 100ms on mobile devices
28. The system must update path visualization within 50ms of user interaction
29. The system must handle board state updates efficiently

## Non-Goals (Out of Scope)

- AI opponent movement logic
- Undo/redo functionality for moves
- Move suggestions or hints
- Multi-player online synchronization (handled in later phases)
- Custom board sizes (4x4 only for this phase)
- Diagonal movement options
- Animation implementation (visual polish for later phases)

## Design Considerations

### Visual Feedback
- Highlight valid destination squares with clear color coding
- Show movement path with connected line or highlighted squares
- Indicate wraparound connections with visual cues (arrows or lines)
- Use consistent color scheme with existing board design

### Touch/Click Interaction
- Ensure touch targets are minimum 44px for mobile accessibility
- Support both tap-to-move and drag-to-plan interactions
- Provide immediate visual feedback for all user interactions

### Joker Movement UI
- Display available movement options (1-4) clearly
- Allow incremental movement with clear "end turn" option
- Show remaining movement allowance during joker turns

## Technical Considerations

### Dependencies
- Builds upon existing game.js game state management
- Requires board.js coordinate system and card management
- Integrates with player.js position tracking

### Data Structures
- Extend game state to include current move path
- Add move history array to game state
- Track visited cards during current turn

### Validation Logic
- Implement modulo arithmetic for wraparound calculations
- Use breadth-first search for pathfinding validation
- Cache validation results for performance optimization

### Integration Points
- Must integrate with existing board rendering system
- Should trigger board updates through established patterns
- Must work with existing touch/click event handlers

## Success Metrics

1. **Functional Completeness**: 100% of game movement rules correctly implemented
2. **Performance**: Move validation completes within 100ms on iPhone 11+
3. **User Experience**: Zero invalid moves allowed through UI
4. **Error Rate**: Less than 1% of attempted moves result in validation errors
5. **Responsiveness**: Path visualization updates within 50ms of user interaction

## Open Questions

1. Should move history be persisted to localStorage or kept only in memory?
2. How should the system handle rapid successive clicks during move planning?
3. Should there be audio feedback for move validation (success/error sounds)?
4. What level of move history detail is needed for debugging (timestamps, validation steps, etc.)?
5. Should the system pre-calculate all valid moves for performance optimization?

## Implementation Notes

This PRD focuses on the core movement logic and validation. Visual polish, animations, and advanced UI features will be addressed in subsequent phases. The implementation should prioritize correctness and performance over visual flair at this stage.