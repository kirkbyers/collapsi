# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Collapsi** is a digital adaptation of a 2-player strategy board game built with vanilla web technologies. Players move pawns on a collapsing 4x4 card grid, with the last player able to make a legal move winning the game.

## Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+) - no frameworks or build tools
- **Architecture**: Modular JavaScript with separation of concerns
- **Design**: Mobile-first responsive design optimized for iPhone 11+
- **Storage**: localStorage for game state persistence

## Development Commands

### Local Development
```bash
# Simple file serving
open index.html

# Recommended: Local server for testing
python -m http.server 8000
# Then visit http://localhost:8000

# Alternative with Node.js
npx live-server
```

### Testing
```bash
# Run all tests (702 tests in <5 seconds)
npm test

# Run tests with coverage analysis
npm run test:coverage

# Run specific test suites
npm run test:movement    # Movement system tests
npm run test:integration # Integration tests only
npm run test:fast        # Quick unit tests only
```

### Mobile Testing
```bash
# Find IP for mobile device testing
ifconfig | grep "inet "
# Access via http://[YOUR_IP]:8000 on mobile devices
```

### No Build System
This project intentionally uses no build tools, package managers, or frameworks. All code is vanilla web technologies served as static files.

## Architecture Overview

### Core Game Engine (Completed ✅)
- **Movement System**: Highly modular architecture (11 files, ~2000 lines)
  - `js/movement/core/`: Card movement, position utilities, path validation
  - `js/movement/validation/`: Movement validation with <100ms performance
  - `js/movement/joker/`: Complete joker mechanics with state management
  - `js/movement/execution/`: Move execution and game state management
  - `js/movement/visualization/`: Path highlighting and preview

### Game Logic Architecture
- `js/game.js`: Core game state and management
- `js/board.js`: Board management and validation  
- `js/player.js`: Player/pawn logic and positioning
- `js/utils.js`: Shared utility functions
- `js/ui.js`: UI interactions (needs implementation)

### Styling Architecture
- `css/styles.css`: Base styles with CSS custom properties
- `css/board.css`: CSS Grid layout for 4x4 game board
- `css/mobile.css`: Mobile-first responsive styles

## Key Game Mechanics

### Movement Rules
- **Orthogonal movement**: Up/down/left/right only
- **Wraparound edges**: Board edges connect (top-to-bottom, left-to-right)
- **Distance matching**: Must move exactly the number on the card
- **Card collapse**: Starting card becomes impassable after move
- **Joker cards**: Flexible 1-4 space movement with early completion

### Board Layout
- 4x4 grid with 16 cards: Red Joker, Black Joker, 4×A, 4×2, 4×3, 4×4
- Players start on their respective joker cards
- Cards shuffle at game start using Fisher-Yates algorithm

## Development Status

### Completed Phases ✅
- **Phase 1**: HTML structure and responsive board display
- **Phase 2**: JavaScript data structures and game state
- **Phase 3**: Complete movement validation system (modular architecture)
- **Phase 4**: Move execution and game state management
- **Phase 5**: Comprehensive JavaScript testing implementation

### Current Phase (Phase 6): UI Integration
**Next major task**: Connect the sophisticated backend movement system to user interface interactions.

### Implementation Notes
- Movement validation system is performance-optimized (<100ms target)
- Complete joker mechanics with state machine implementation
- Comprehensive error handling and rollback support
- Path visualization and move preview capabilities
- **TDD-developed codebase** with 702 tests ensuring reliability
- **Test-first development** strongly encouraged for all new features

## File Organization Patterns

Files shouldn't exceed 600 lines. When a file exceeds 600 lines, break it out into a module where each file follows single responsibility principle.

### Movement System Modules
Each module in `js/movement/` follows single responsibility principle:
- Keep files under 300 lines for maintainability
- Use clear, descriptive function names
- Include comprehensive error handling
- Export only necessary functions

### CSS Organization
- Use CSS custom properties for theming and colors
- Mobile-first approach with progressive enhancement
- CSS Grid for board layout, Flexbox for components
- Touch-friendly sizing (minimum 44px touch targets)

## Testing Approach

### Test-Driven Development (TDD) - **STRONGLY ENCOURAGED**
- **Write tests first** for all new features and bug fixes
- **Red-Green-Refactor cycle**: Write failing test → Make it pass → Refactor
- **Fast feedback loop**: Run `npm test` frequently during development
- **Design through testing**: Use tests to drive API design and function interfaces

### TDD Workflow for New Features
1. **Write the test first** - Define expected behavior before implementation
2. **Run test to see it fail** - Confirm the test is actually testing something
3. **Write minimal code** to make the test pass
4. **Refactor** while keeping tests green
5. **Repeat** for each small piece of functionality

### Automated Testing (Jest Framework)
- **702 comprehensive tests** covering all critical game logic
- **Unit tests** for all modules co-located with source files
- **Integration tests** for complete game flows and UI interactions
- **Performance optimized** - full suite runs in <5 seconds
- **High coverage** on critical areas (movement system, game logic)

### Test Organization
- Unit tests: `*.test.js` files alongside source code
- Integration tests: `tests/integration/` directory
- Test utilities: `tests/utils/` with shared fixtures and helpers
- Coverage reporting: `npm run test:coverage` generates HTML reports

### Manual Testing
- Chrome DevTools for mobile device simulation
- Real device testing via local server
- Console.log debugging throughout codebase

### Validation Testing
- Movement validation system includes extensive logging
- Test all edge cases: wraparound, card collapse, joker mechanics
- Performance testing for validation speed (<100ms requirement)

## Common Development Tasks

### Adding New Movement Rules (TDD Approach)
1. **Write tests first** - Define expected behavior in `*.test.js` files
2. **Run tests** to see them fail (red)
3. **Implement logic** in relevant module (`js/movement/core/`, `js/movement/validation/`)
4. **Make tests pass** (green)
5. **Refactor** code while keeping tests green
6. **Add integration tests** for complete movement flows
7. **Update execution system** if needed in `js/movement/execution/`

### Adding New Game Features (TDD Approach)
1. **Write unit tests** for the new feature's expected behavior
2. **Write integration tests** for how it fits into game flow
3. **Run tests** to confirm they fail appropriately
4. **Implement minimal code** to make tests pass
5. **Refactor** and optimize while maintaining green tests
6. **Add edge case tests** as you discover them

### Bug Fixes (TDD Approach)
1. **Write a test** that reproduces the bug (should fail)
2. **Fix the bug** with minimal code changes
3. **Confirm the test passes** and no other tests break
4. **Add additional tests** for related edge cases

### Styling Changes
1. Use existing CSS custom properties when possible
2. Test on multiple device sizes using Chrome DevTools
3. Maintain mobile-first approach with 375px base width
4. Ensure touch targets remain accessible (44px minimum)

### Game State Modifications (TDD Approach)
1. **Write tests** for expected game state changes
2. **Update core game state** in `js/game.js`
3. **Ensure localStorage persistence** compatibility with tests
4. **Update board rendering logic** if needed
5. **Run full test suite** to ensure no regressions
6. **Test complete game flow** from start to completion

## Documentation

- **README.md**: Complete setup and architecture guide
- **plan.md**: Comprehensive implementation roadmap with all phases
- **tasks/**: Structured development phases with detailed PRDs
- **rules.pdf/txt**: Official Collapsi game rules
- **docs/testing-guide.md**: Comprehensive testing patterns and practices
- **docs/coverage-analysis.md**: Test coverage analysis and assessment

The project follows a highly structured development approach with detailed planning documents, modular architecture, and comprehensive test coverage for maintainability.