# Product Requirements Document: Phase 2 - JavaScript Game Data Structure

## Introduction/Overview

Phase 2 establishes the foundational JavaScript data structures and game state management for the Collapsi digital game. This phase transforms the static HTML board from Phase 1 into a dynamic, JavaScript-driven system that can shuffle cards, manage game state, and render the board programmatically. The goal is to create a robust data foundation that supports the game's core mechanics while being extensible for future phases.

## Goals

1. Create a complete card deck data structure with proper shuffling functionality
2. Implement a comprehensive game state object that tracks all game elements
3. Build board management functions that convert between data structures and DOM representation
4. Establish a clean separation between game logic and presentation layers
5. Prepare data structures for future touch controls and state persistence

## User Stories

- As a player, I want the game board to be randomly shuffled each time so that every game feels unique and fair
- As a player, I want the game to properly track where each player is positioned so moves can be validated
- As a developer, I want clean data structures so I can easily implement game rules and UI interactions in future phases
- As a developer, I want reliable board rendering so the visual game state always matches the internal game state

## Functional Requirements

### Core Data Structures

1. **Card Deck Management**
   - The system must define a complete card deck array containing: `['red-joker', 'black-joker', 'A', 'A', 'A', 'A', '2', '2', '2', '2', '3', '3', '3', '3', '4', '4']`
   - The system must implement a Fisher-Yates shuffle algorithm to randomize card positions
   - The system must be able to convert the 1D shuffled deck into a 4x4 2D board array

2. **Game State Object**
   - The system must maintain a game state object containing:
     - `board`: 4x4 array of card objects with properties for card type, position, and collapsed state
     - `players`: Array of player objects with position coordinates and color
     - `currentPlayer`: Index indicating whose turn it is
     - `gameStatus`: String indicating game state ('setup', 'playing', 'ended')
     - `moveHistory`: Array to track moves for future undo/replay functionality

3. **Board Management Functions**
   - The system must provide a function to initialize a new game with shuffled cards
   - The system must render the current board state to the DOM, replacing static HTML
   - The system must provide functions to get/set card states at specific board positions
   - The system must handle card collapse states (face-up vs face-down)

4. **Player Management**
   - The system must automatically place players on their respective joker cards during initialization
   - The system must track player positions as {row, col} coordinates
   - The system must identify which player starts on which joker (red player on red joker, blue on black joker)

### DOM Integration

5. **Dynamic Board Rendering**
   - The system must replace the static HTML board with JavaScript-generated elements
   - The system must apply appropriate CSS classes for different card types and states
   - The system must visually distinguish between face-up and collapsed (face-down) cards
   - The system must display player pawns on their current positions

6. **Development & Testing Support**
   - The system must include console.log statements for debugging shuffle and initialization
   - The system must provide functions to manually test different board configurations
   - The system must validate that all 16 cards are properly placed in the 4x4 grid

## Non-Goals (Out of Scope)

- Movement validation and game rules (Phase 3)
- Touch event handling and user interactions (Phase 4)
- Game state persistence to localStorage (Phase 5)
- Win condition detection (Phase 5)
- Animations and visual effects (Phase 6)
- Multiplayer networking (Phase 7)

## Design Considerations

- **CSS Integration**: Maintain compatibility with existing CSS classes from Phase 1
- **Future Touch Controls**: Structure card elements with data attributes that will support click/touch event handling
- **State Management**: Design game state object to be easily serializable for future localStorage persistence
- **Responsive Design**: Ensure JavaScript-generated board maintains mobile-first responsive behavior

## Technical Considerations

- **File Structure**: Create separate JS files (`js/game.js`, `js/board.js`) for clean code organization
- **ES6+ Features**: Utilize modern JavaScript features like const/let, arrow functions, and array methods
- **DOM Manipulation**: Use efficient DOM methods to minimize reflows and repaints
- **Data Validation**: Include basic validation to ensure game state integrity
- **Error Handling**: Log errors for debugging rather than throwing exceptions that break the game

## Success Metrics

- All 16 cards are correctly shuffled and placed in a 4x4 grid
- Players are automatically positioned on their respective joker cards
- Board state can be re-rendered multiple times without visual artifacts
- Game state object accurately reflects the current board configuration
- No console errors during initialization or board rendering
- Board layout remains responsive across different screen sizes

## Open Questions

- Should the card objects include additional metadata for future AI opponent implementation?
- How detailed should the move history tracking be for potential replay features?
- Should we include any card animation hooks in the data structure for Phase 6?
- What level of state validation should be built into the setter functions?