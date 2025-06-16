# Task List: Touch Controls & UI Integration

## Relevant Files

- `js/ui/` - New modular UI system directory following single responsibility principles
- `js/ui/touch-handler.js` - Core touch event handling and pawn selection logic
- `js/ui/move-preview.js` - Step-by-step move preview and destination highlighting
- `js/ui/animation-controller.js` - Animation management for pawn movement and visual feedback
- `js/ui/joker-controls.js` - Joker-specific UI controls and early turn completion
- `js/ui/game-controls.js` - Hamburger menu and game control interface
- `js/ui/index.js` - UI module exports and initialization
- `css/ui-components.css` - UI-specific styles for touch controls and animations
- `css/animations.css` - CSS animations and transitions for game interactions

### Notes

- This project uses manual testing approach - no formal test framework
- Use console.log debugging and Chrome DevTools for validation
- Test on multiple device sizes using mobile device simulation
- Ensure all touch targets meet 44px minimum accessibility requirement

## Tasks

- [x] 1.0 Implement Core Touch Event System
  - [x] 1.1 Create `js/ui/` directory and module structure
  - [x] 1.2 Implement `js/ui/touch-handler.js` with tap event detection for pawns and board cards
  - [x] 1.3 Add pawn selection logic with visual highlighting for selected pawn
  - [x] 1.4 Implement touch event delegation for dynamically rendered board elements
  - [x] 1.5 Add interaction throttling to prevent rapid tapping during animations
  - [x] 1.6 Create deselection logic when tapping elsewhere on the board
  - [x] 1.7 Integrate touch handlers with existing game state management

- [x] 2.0 Create Visual Feedback and Animation System
  - [x] 2.1 Create `js/ui/animation-controller.js` for centralized animation management
  - [x] 2.2 Implement CSS transforms for smooth pawn movement (200-250ms duration)
  - [x] 2.3 Create shake animation for invalid move attempts (300ms, 3-4 shakes)
  - [x] 2.4 Add highlight transitions for selected pawns and valid destinations (150ms)
  - [x] 2.5 Create `css/animations.css` with CSS custom properties for consistent timing
  - [x] 2.6 Implement visual state updates for collapsed cards after moves
  - [x] 2.7 Add animation queuing system to prevent conflicting animations

- [x] 3.0 Build Step-by-Step Move Preview System
  - [x] 3.1 Create `js/ui/move-preview.js` for destination highlighting logic
  - [x] 3.2 Integrate with existing movement validation system to get valid destinations
  - [x] 3.3 Implement step-by-step preview showing immediate possible destinations
  - [x] 3.4 Add visual highlighting for valid destination cards (green tint/border)
  - [x] 3.5 Create move execution logic when tapping highlighted destinations
  - [x] 3.6 Integrate with Phase 4 move execution system for actual move processing
  - [x] 3.7 Add visual feedback for move completion and board state updates

- [x] 4.0 Implement Joker-Specific UI Controls
  - [x] 4.1 Create `js/ui/joker-controls.js` for joker-specific interactions
  - [x] 4.2 Implement "End Turn" button that appears during joker moves
  - [x] 4.3 Add joker move progress indicator (e.g., "Move 2 of 4")
  - [x] 4.4 Create early turn completion logic when "End Turn" button is pressed
  - [x] 4.5 Implement automatic turn ending after 4 joker moves
  - [x] 4.6 Style "End Turn" button following design theme (simple, colorful, high contrast)
  - [x] 4.7 Integrate joker controls with existing joker state management system

- [x] 5.0 Create Game Controls Interface with Hamburger Menu
  - [x] 5.1 Create `js/ui/game-controls.js` for hamburger menu and game controls
  - [x] 5.2 Implement hamburger menu with slide-in animation from left/top
  - [x] 5.3 Add "New Game" button within hamburger menu
  - [x] 5.4 Create turn indicator display in top-right of board area
  - [x] 5.5 Implement turn indicator updates showing current player (Red/Blue)
  - [x] 5.6 Add automatic menu closing on option selection and blur events
  - [x] 5.7 Style all UI components with 44px minimum touch targets for accessibility
  - [x] 5.8 Create `js/ui/index.js` to export all UI modules and handle initialization