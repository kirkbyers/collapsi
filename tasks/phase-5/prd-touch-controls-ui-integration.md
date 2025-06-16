# Product Requirements Document: Touch Controls & UI Integration

## Introduction/Overview

Phase 5 focuses on connecting the sophisticated backend movement system (completed in Phases 3-4) to user interface interactions. This feature will transform the technical movement validation and execution systems into an intuitive, touch-first mobile game experience. The goal is to create seamless tap-to-play interactions where users can select their pawn, preview possible moves step-by-step, and execute moves with visual feedback.

**Problem**: The game currently has a complete movement validation and execution backend, but no user interface to interact with it. Players cannot actually play the game.

**Solution**: Implement touch-based controls that allow players to tap their pawn, see possible moves, and execute moves with smooth animations and clear visual feedback.

## Goals

1. Enable players to interact with the game through touch controls on mobile devices
2. Provide clear visual feedback for valid/invalid moves and game state
3. Create an intuitive step-by-step move preview system
4. Implement smooth, fast animations that enhance gameplay without slowing it down
5. Integrate all UI interactions with the existing movement validation and execution systems
6. Provide accessible game controls through a hamburger menu system

## User Stories

1. **As a player**, I want to tap on my pawn to select it, so that I can see what moves are available to me.

2. **As a player**, I want to see highlighted possible destinations when I select my pawn, so that I understand where I can move.

3. **As a player**, I want to tap on a highlighted destination to move there, so that I can execute my intended move.

4. **As a player**, I want my pawn to animate smoothly to its new position, so that the movement feels satisfying and clear.

5. **As a player**, I want visual feedback when I try to make an invalid move, so that I understand why my move didn't work.

6. **As a player making a joker move**, I want to be able to end my turn early with a button press, so that I don't have to use all 4 possible moves.

7. **As a player**, I want to see whose turn it is and access game controls easily, so that I can manage the game state.

8. **As a player**, I want to start a new game through an accessible menu, so that I can restart when needed.

## Functional Requirements

### Core Touch Interactions
1. The system must detect tap events on pawn cards and highlight the selected pawn
2. The system must show step-by-step move previews when a pawn is selected
3. The system must execute moves when users tap on valid highlighted destinations
4. The system must deselect pawns when users tap elsewhere on the board
5. The system must prevent interaction during animations to avoid state conflicts

### Visual Feedback System
6. The system must highlight the currently selected pawn with a distinct visual indicator
7. The system must highlight valid destination cards with a clear, accessible color
8. The system must show a visual shake animation for invalid move attempts
9. The system must animate pawn movement with CSS transforms (fast but visually appealing)
10. The system must update card visual states when they collapse after moves

### Joker Interaction Handling
11. The system must provide an "End Turn" button that appears during joker moves
12. The system must allow joker moves to end early when the "End Turn" button is pressed
13. The system must automatically end joker turns after 4 moves are completed
14. The system must show joker move progress (e.g., "Move 2 of 4") during joker turns

### Game Controls Interface
15. The system must implement a hamburger menu containing game controls
16. The hamburger menu must include a "New Game" button
17. The system must display the current turn indicator in the top-right of the board area
18. The turn indicator must clearly show which player's turn it is (Red/Blue)
19. The system must update the turn indicator immediately after each completed move

### Integration Requirements
20. The system must integrate with the existing movement validation system from Phase 3
21. The system must use the move execution system from Phase 4 for all move processing
22. The system must maintain game state consistency through the existing state management
23. The system must trigger appropriate rendering updates after each move

## Non-Goals (Out of Scope)

- Keyboard navigation support (mobile-first approach)
- Hover states for desktop users
- Undo/redo functionality
- Move history display
- Sound effects or haptic feedback
- Multi-touch gestures
- Drag-and-drop movement interactions
- Online multiplayer UI (covered in future phases)

## Design Considerations

### Mobile-First Design
- All touch targets must be minimum 44px for accessibility
- UI elements must be positioned for thumb-friendly interaction
- Hamburger menu should slide in from left or top for easy access
- Turn indicator positioning in top-right avoids thumb interference

### Animation Specifications
- Pawn movement animations: 200-250ms duration with ease-out timing
- Highlight transitions: 150ms for smooth state changes
- Shake animation for errors: 300ms duration with 3-4 quick shakes
- All animations should use CSS transforms for optimal performance

### Visual Hierarchy
- Selected pawn: Bold border or glow effect
- Valid destinations: Subtle highlight (green tint or border)
- Invalid attempts: Red shake animation
- Collapsed cards: Distinct visual state (darker/grayed out)

### Responsive Layout
- Hamburger menu: 32px touch target with standard three-line icon
- Turn indicator: Clear text with color coding matching player pawns
- End turn button (joker): Prominent but not obstructive positioning

## Technical Considerations

### Integration Points
- Must work with existing `js/movement/` module system
- Should utilize `js/movement/execution/` for all move processing
- Must integrate with current board rendering system
- Should maintain compatibility with game state persistence

### Performance Requirements
- Touch response time: <50ms from tap to visual feedback
- Animation performance: 60fps on target devices (iPhone 11+)
- Memory efficiency: Avoid creating excessive DOM elements during interactions

### Error Handling
- Graceful degradation if animation features are unsupported
- Clear error messages for unexpected state conflicts
- Fallback behaviors for failed move executions

## Success Metrics

1. **Usability**: Players can complete a full game using only touch interactions without confusion
2. **Performance**: Touch interactions respond within 50ms, animations maintain 60fps
3. **Visual Clarity**: 95% of test users can identify valid moves and current game state
4. **Error Prevention**: Users understand why invalid moves fail through visual feedback
5. **Joker Interaction**: Players successfully use early turn completion for joker moves
6. **Accessibility**: All touch targets meet 44px minimum size requirement

## Open Questions

1. Should the step-by-step preview show distance numbers on the path cards? No.
2. How should the UI handle rapid tapping during animations? It should ignore them. Perhaps a throttle on the handlers would be good.
3. Should there be different animation styles for different card types? No.
4. What should happen if a player taps their opponent's pawn? The can move through the space, but not end their turn on the pawn.
5. Should the hamburger menu close automatically after selecting an option? Yes. It should also close automatically on blur.
6. How should the "End Turn" button be styled to match the overall design? Continue with the theme of, simple, colorful, fun, and high contrast.

## Implementation Notes

- Create `js/ui.js` as the primary file for this functionality
  - Break the file into a module where files follow singluar responsibility principals.
- Ensure all touch event handlers properly prevent default behaviors
- Use CSS custom properties for consistent animation timing across components
- Implement proper event delegation for dynamic board elements
- Consider using `requestAnimationFrame` for complex animation sequences
- Update documentation as you go