# Collapsi Digital Game Implementation Plan

## Game Overview
Collapsi is a 2-player strategy game where players move pawns on a collapsing 4x4 card grid. The last player able to make a legal move wins.

## Core Game Mechanics
- **Board**: 4x4 grid of cards (Red Joker, Black Joker, 4×A, 4×2, 4×3, 4×4)
- **Players**: 2 players with colored pawns (Red starts on Red Joker, Blue on Black Joker)
- **Movement**: Orthogonal movement (up/down/left/right) with wraparound edges
- **Card Collapse**: Starting card flips face-down after each move (becomes impassable)
- **Win Condition**: Last player able to complete a legal move wins

## Technical Architecture

### Frontend Stack
- **HTML5**: Semantic structure and game board layout
- **CSS3**: Mobile-first responsive design with Flexbox/Grid
- **Vanilla JavaScript**: Game logic, state management, and UI interactions
- **Web APIs**: localStorage for game state persistence

### Mobile-First Design
- **Target Devices**: iPhone 11 and up optimization
- **Responsive Grid**: CSS Grid for 4x4 board that scales to screen size
- **Touch Controls**: Touch/tap interactions for card selection and movement
- **Viewport Optimization**: Proper meta tags and CSS for mobile devices
- **Portrait/Landscape**: Adaptive layout for both orientations
- **Accessibility**: Simple, bold colors with high contrast for accessibility

### Multiplayer Architecture

#### Local Multiplayer (Same Device)
- Single device, alternating turns
- Visual turn indicators
- Touch/tap controls for both players

#### Online Multiplayer (Room Codes)
- **Near Real-time Communication**: WebSocket or HTTP polling for turn-based gameplay
- **Room System**: 6-digit alphanumeric room codes
- **Game State Sync**: Server-authoritative game state
- **Offline Capability**: Game works without server after initial load
- **Reconnection Logic**: Handle network interruptions gracefully

## Implementation Phases (Junior Engineer Friendly)

### Phase 1: Basic HTML Structure & Setup
**Goal**: Get the basic game board visible on screen

**Step 1.1: Create index.html**
- Create basic HTML5 document with proper mobile viewport meta tag
- Add CSS and JavaScript file references
- Create div container for game board
- Add basic semantic structure (header, main, footer)

**Step 1.2: Create CSS files**
- `css/styles.css` - Base styles and CSS variables for colors
- `css/board.css` - Grid layout for 4x4 board
- `css/mobile.css` - Mobile-specific responsive styles
- Set up CSS Grid with 4 rows × 4 columns
- Define color scheme using CSS custom properties

**Step 1.3: Static board display**
- Hard-code a sample 4x4 grid in HTML with div elements
- Style cards with numbers (A, 2, 3, 4) and jokers
- Make cards visually distinct (different background colors)
- Test on iPhone 11+ screen sizes

### Phase 2: JavaScript Game Data Structure
**Goal**: Create the game state and card management

**Step 2.1: Create js/game.js**
- Define card deck array: `['red-joker', 'black-joker', 'A', 'A', 'A', 'A', '2', '2', '2', '2', '3', '3', '3', '3', '4', '4']`
- Create shuffle function using Fisher-Yates algorithm
- Create game state object with board array (4×4), player positions, current turn
- Add function to initialize new game

**Step 2.2: Create js/board.js**
- Function to convert 1D deck array to 2D board (4×4)
- Function to render board state to DOM
- Function to get card at position (row, col)
- Function to mark card as collapsed
- Replace static HTML board with JavaScript-generated board

**Step 2.3: Test data flow**
- Add console.log statements to verify shuffle and board generation
- Manually test different board configurations
- Verify collapsed cards show visually different state

### Phase 3: Player Movement Logic ✅
**Goal**: Implement core movement rules - **COMPLETED**

**✅ Step 3.1: Modular Movement System**
- Refactored 2,227-line movement.js into 11 focused modules
- Core movement logic: card types, position utilities, path validation
- Validation system: ending rules, optimized performance, main orchestration
- Joker mechanics: state management, validation, turn completion
- Visualization: path highlighting and movement preview

**✅ Step 3.2: Movement Validation Architecture**
- Orthogonal movement validation with wraparound support
- Card distance matching and path validation
- Revisit prevention and move history tracking
- Performance-optimized validation (<100ms target)
- Comprehensive error handling and logging

**✅ Step 3.3: Joker Movement System**
- Flexible joker movement (1-4 spaces) with early completion
- State machine for joker turn progression
- Validation against numbered card rules
- Interactive distance selection and path preview
- Complete turn completion and cleanup logic

### Phase 4: Move Execution & Game State Management ✅
**Goal**: Complete move execution system - **COMPLETED**

**✅ Step 4.1: Move Execution System**
- Comprehensive move execution with validation pipeline
- Board state updates and consistency checking
- Player position management with rollback support
- Error handling and state recovery mechanisms
- Integration with existing validation system

**✅ Step 4.2: Card Collapse Management**
- Starting card collapse mechanics following Collapsi rules
- Visual updates for collapsed cards (face-down state)
- Collapse history tracking and statistics
- Validation against game rules and state consistency
- Restore functionality for debugging and undo

**✅ Step 4.3: Turn Management System**
- Automatic turn switching after successful moves
- Game end detection when no valid moves remain
- Turn history and player statistics tracking
- UI updates for current player indication
- Win condition handling and game flow control

**✅ Step 4.4: Rendering Integration**
- Coordinated move execution with step-by-step rendering
- Visual feedback during move execution process
- Board rendering updates after state changes
- Error rollback with visual state restoration
- Performance-optimized rendering pipeline

### Phase 5: Touch Controls & UI Integration ✅
**Goal**: Connect execution system to user interface - **COMPLETED**

**✅ Step 5.1: Complete Touch Handler System**
- Comprehensive click/touch event listeners with event delegation
- Pawn selection with visual feedback (golden border + glow)
- Real-time valid destination highlighting with distance indicators
- Advanced move preview with path visualization integration
- Touch throttling (100ms) and global deselection handlers

**✅ Step 5.2: Full UI Integration with Movement System**
- Complete integration with movement validation and execution systems
- Smooth pawn movement animations (225ms duration with transforms)
- Comprehensive visual feedback (shake animations, highlight transitions)
- Robust error handling with visual shake feedback and console logging
- Path calculation and joker state management integration

**✅ Step 5.3: Complete Game Controls Suite**
- Hamburger menu (top-left) with "New Game" and "How to Play" options
- Turn indicator (top-right) showing current player with colored styling
- Dynamic joker controls with "End Turn" button and move progress indicator
- Professional mobile-optimized styling (44px+ touch targets)
- Keyboard accessibility (ESC, Tab navigation) and ARIA labels

### Phase 6: Game Rules & Win Conditions ⚠️
**Goal**: Complete the game logic - **PARTIALLY COMPLETED**

** Step 6.1: Legal move detection in js/game.js**
- getAllPossibleMoves() function exists but returns empty array (placeholder)
- Comprehensive movement validation system exists in js/movement/ modules
- Need to integrate validation system with legal move detection
- All supporting functions available: position validation, path generation, distance checking

** Step 6.2: Win condition logic**
- Complete win condition framework in checkGameEnd() function
- Turn manager handles game end detection in checkNewPlayerValidMoves()
- Winner determination logic (last player able to move wins)
- Game status tracking (gameState.gameStatus, gameState.winner)
- UI updates for game end (turn indicator shows "Game Over")
- Depends on Step 6.1 for full functionality

** Step 6.3: Game state persistence**
- Complete localStorage implementation in js/utils.js
- saveGameState() and loadGameState() functions with JSON serialization
- clearSavedGameState() and compatibility testing functions
- Save timestamp tracking and error handling
- Auto-save integration ready

### Phase 7: Polish & Mobile Optimization
**Goal**: Make it feel professional

**Step 7.1: Animations in css/styles.css**
- CSS transitions for pawn movement
- Flip animation for card collapse
- Smooth highlighting for legal moves
- Loading states and micro-interactions

**Step 7.2: Mobile optimization**
- Optimize touch targets and spacing
- Handle orientation changes
- Add haptic feedback (if supported)

**Step 7.3: Accessibility & Visual Polish**
- High contrast mode support
- Screen reader labels
- Keyboard navigation (optional)
- Polish color scheme and typography

### Phase 8: Online Multiplayer Foundation
**Goal**: Basic room system

**Step 8.1: Create simple Node.js server**
- Install dependencies: `express`, `socket.io`
- Basic HTTP server serving static files
- WebSocket connection handling
- Room creation with 6-digit codes

**Step 8.2: Frontend websocket integration in js/multiplayer.js**
- Connect to server on game start
- Send/receive game state updates
- Handle connection errors gracefully
- Fall back to local multiplayer if server unavailable

**Step 8.3: Room system**
- UI for creating/joining rooms
- Sync game state between players
- Handle player disconnection
- Basic lobby system

### Phase 9: Testing & Deployment
**Goal**: Ship it!

**Step 9.1: Testing**
- Test all game rules manually
- Test on multiple devices
- Test online multiplayer with 2 people
- Fix any bugs found

**Step 9.2: Deployment**
- Host static files (Netlify, Vercel, or GitHub Pages)
- Host Node.js server (Railway, Render, or Heroku)
- Configure environment variables
- Test production deployment

**Each phase should take 1-2 days for a junior engineer. Total estimated time: 2-3 weeks.**

## File Structure
```
collapsi/
├── index.html                 # Main game page
├── css/
│   ├── styles.css            # Main stylesheet
│   ├── board.css             # Game board specific styles
│   └── mobile.css            # Mobile-specific styles
├── js/
│   ├── game.js               # Core game logic and state management
│   ├── movement/             # Modular movement validation system (Phase 3)
│   │   ├── core/             # Core movement logic
│   │   │   ├── card-movement.js    # Card type definitions and distance rules
│   │   │   ├── position-utils.js   # Position calculations and wraparound
│   │   │   └── path-validation.js  # Orthogonal path validation
│   │   ├── validation/       # Movement validation systems
│   │   │   ├── ending-validator.js     # Move ending rules and occupation
│   │   │   ├── optimized-validator.js  # Performance-optimized validation
│   │   │   └── movement-validator.js   # Main validation orchestration
│   │   ├── joker/            # Joker movement mechanics
│   │   │   ├── joker-state.js       # Joker state management
│   │   │   ├── joker-validator.js   # Joker-specific validation rules
│   │   │   └── joker-completion.js  # Joker turn completion logic
│   │   ├── visualization/    # Path visualization and highlighting
│   │   │   └── path-highlighter.js # Movement path visualization
│   │   ├── execution/        # Move execution and game state management (Phase 4)
│   │   │   ├── move-executor.js     # Core move execution and validation
│   │   │   ├── board-state-manager.js # Board state updates and consistency
│   │   │   ├── card-collapse-manager.js # Card collapse mechanics and visuals
│   │   │   ├── turn-manager.js      # Turn switching and game flow control
│   │   │   ├── rendering-integration.js # Rendering system integration layer
│   │   │   └── index.js             # Execution module exports and API
│   │   └── index.js          # Module documentation and exports
│   ├── board.js              # Board management and validation
│   ├── player.js             # Player/pawn logic
│   ├── ui.js                 # UI interactions
│   ├── utils.js              # Utility functions and helpers
│   └── multiplayer.js        # Online multiplayer client
├── assets/
│   ├── cards/                # Card images/sprites
│   └── pawns/                # Pawn images
├── server/                   # Backend (Node.js)
│   ├── server.js             # WebSocket server
│   ├── game-room.js          # Room management
│   └── game-logic.js         # Server-side game validation
├── tasks/                    # Development tasks and PRDs
└── plan.md                   # This document
```

## Key Features

### Game Features
- ✅ 4x4 grid board with card shuffling
- ✅ Orthogonal movement with wraparound
- ✅ Card collapse mechanics
- ✅ Legal move validation (modular architecture)
- ⚠️ Win condition detection (framework complete, needs legal move integration)
- ✅ Joker wild card support (complete state machine)
- ✅ Performance-optimized validation (<100ms)
- ✅ Path visualization and movement preview
- ✅ Complete move execution system
- ✅ Card collapse mechanics and visual updates
- ✅ Turn switching and game flow control
- ✅ Game state persistence (localStorage)
- ❌ Legal move detection (placeholder function needs implementation)

### UI/UX Features
- ✅ Mobile-first responsive design
- ✅ Complete touch controls for movement (comprehensive event handling)
- ✅ Visual feedback for legal moves (distance indicators, path highlighting)
- ✅ Turn indicators (top-right with player colors)
- ✅ Game state persistence
- ✅ Animations for moves and card collapse (smooth 225ms transitions)
- ✅ Simple, bold accessible color scheme
- ✅ Hamburger menu with game controls
- ✅ Joker controls with turn progression
- ✅ "How to Play" dialog with complete rules
- ✅ Professional error feedback (shake animations)
- ✅ Keyboard accessibility and ARIA labels

### Multiplayer Features
- ✅ Local same-device multiplayer
- ✅ Online multiplayer with room codes
- ✅ Near real-time game synchronization
- ✅ Reconnection support
- ✅ Offline capability after initial load

## Technical Considerations

### Performance
- Efficient DOM manipulation for board updates
- CSS transforms for smooth animations
- Minimal network calls for online play
- Local storage for offline capability

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Clear visual indicators for game state

### Browser Compatibility
- Modern browser support (ES6+)
- WebSocket fallback options
- Touch event handling
- CSS Grid with fallbacks

## Development Timeline
- **Week 1-2**: ✅ Core game engine and movement system (COMPLETED)
- **Week 2**: ✅ Move execution and game state management (COMPLETED)
- **Week 3**: ✅ UI development and local multiplayer (COMPLETED)
- **Week 4**: Mobile optimization and testing
- **Week 5**: Backend development for online multiplayer
- **Week 6**: Integration, testing, and deployment

## Movement System Refactoring (Completed)

The movement validation system has been successfully refactored from a monolithic 2,227-line file into a modular architecture:

### Architecture Benefits
- **Maintainability**: Each module has a single responsibility
- **Testability**: Smaller, focused functions easier to unit test
- **Debugging**: Issues are easier to locate in specific modules
- **Performance**: Optimized validation with <100ms target
- **Collaboration**: Multiple developers can work on different modules

### Module Breakdown
1. **Core Logic** (524 lines): Card movement, position utils, path validation
2. **Validation System** (475 lines): Ending rules, optimization, orchestration
3. **Joker Mechanics** (773 lines): State management, validation, completion
4. **Visualization** (122 lines): Path highlighting and preview
5. **Execution System** (~1,200 lines): Move execution, board state, turn management
6. **Documentation** (102 lines): Module exports and information

## Move Execution System (Completed)

A comprehensive move execution and game state management system has been implemented to bridge the validation system with the game UI:

### Execution System Components
1. **Move Executor** (268 lines): Core move execution with validation pipeline
2. **Board State Manager** (305 lines): Board state updates and consistency validation
3. **Card Collapse Manager** (298 lines): Card collapse mechanics following Collapsi rules
4. **Turn Manager** (312 lines): Turn switching and game flow control
5. **Rendering Integration** (296 lines): Coordinated rendering with move execution
6. **Module Index** (145 lines): High-level API and system orchestration

### Execution System Benefits
- **Complete Game Flow**: Full move execution from validation to UI updates
- **State Consistency**: Comprehensive board state management with validation
- **Error Recovery**: Rollback support for failed operations
- **Visual Integration**: Coordinated rendering updates during move execution
- **Game Rules**: Proper card collapse and turn switching per Collapsi rules

### Integration Capabilities
- Immediate move execution on valid destination selection
- Automatic board state updates after completed moves
- Starting card collapse with visual feedback
- Turn switching with game end detection
- Full rendering integration with error rollback

## Future Enhancements
- Different board sizes (5x5, 6x6)
- More than 2 players
- Tournament mode
- AI opponent
- Game replay/history features
- Spectator mode
- Game statistics and achievements
- Custom card sets/themes