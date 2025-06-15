# PRD: Phase 1 - Basic HTML Structure & Setup

## Introduction/Overview

This PRD defines the requirements for Phase 1 of the Collapsi digital game implementation. The primary goal is to establish the foundational HTML structure and CSS styling to display a static 4x4 game board that will serve as the visual foundation for the complete game. This phase focuses on creating a mobile-first, responsive layout that developers can use to validate the basic structure and styling approach.

The deliverable is a static HTML page that displays a properly styled 4x4 grid representing the Collapsi game board, optimized for iPhone 11+ devices and larger screens.

## Goals

1. Create a semantic HTML5 structure that will support the full game implementation
2. Establish a mobile-first CSS architecture with proper file organization
3. Display a static 4x4 game board with placeholder card content
4. Ensure responsive design that centers the board on larger screens
5. Implement basic accessibility features with simple, high-contrast colors
6. Provide clear development setup instructions for junior developers

## User Stories

**As a developer**, I want to see a properly structured HTML foundation so that I can build the game logic on top of a solid base.

**As a developer**, I want clear CSS file organization so that I can easily maintain and extend the styling in future phases.

**As a developer**, I want the board to display correctly on mobile devices so that I can validate the responsive design approach.

**As a developer**, I want placeholder content in the grid so that I can visualize how the final cards will be positioned.

**As a QA tester**, I want simple instructions to run the project locally so that I can validate the visual requirements.

## Functional Requirements

### HTML Structure Requirements
1. The system must create an `index.html` file with proper HTML5 doctype and structure
2. The system must include a mobile-optimized viewport meta tag (`width=device-width, initial-scale=1.0`)
3. The system must include semantic HTML elements: `<header>`, `<main>`, `<footer>`
4. The system must create a div container with ID `game-board` for the 4x4 grid
5. The system must reference three CSS files: `css/styles.css`, `css/board.css`, `css/mobile.css`
6. The system must include placeholder JavaScript file reference: `js/game.js`

### CSS Architecture Requirements
7. The system must create `css/styles.css` with CSS custom properties for the color scheme
8. The system must create `css/board.css` with CSS Grid layout for the 4x4 board
9. The system must create `css/mobile.css` with mobile-specific responsive styles
10. The system must define at least 5 distinct colors using CSS custom properties for different card types
11. The system must use CSS Grid with `grid-template-columns: repeat(4, 1fr)` and `grid-template-rows: repeat(4, 1fr)`

### Static Board Display Requirements
12. The system must display a 4x4 grid with 16 card elements
13. The system must include placeholder content for the following card types:
    - 1 "Red Joker" card
    - 1 "Black Joker" card  
    - 4 "A" cards
    - 4 "2" cards
    - 4 "3" cards
    - 2 "4" cards (to total 16 cards)
14. The system must make each card type visually distinct using different background colors
15. The system must display card text/numbers clearly with sufficient contrast
16. The system must add hover effects to cards for developer feedback

### Responsive Design Requirements
17. The system must center the game board horizontally on screens wider than mobile
18. The system must maintain a square aspect ratio for the overall board
19. The system must ensure individual cards maintain square proportions
20. The system must scale appropriately on iPhone 11, 12, 13, 14, and 15 screen sizes
21. The system must handle both portrait and landscape orientations
22. The system must use relative units (vw, vh, rem) for responsive scaling

### Development Setup Requirements
23. The system must create a `README.md` file with setup instructions
24. The system must provide instructions for opening the project in a web browser
25. The system must include instructions for testing on mobile devices/simulators
26. The system must document the expected visual outcome for QA validation

## Non-Goals (Out of Scope)

- Interactive functionality (clicking, moving pieces)
- JavaScript game logic implementation
- Backend server setup
- Real card graphics or complex visual assets
- Animation or transition effects
- Multi-player functionality
- Game state management
- Touch event handling beyond basic CSS hover states
- Advanced accessibility features (screen readers, keyboard navigation)
- Cross-browser compatibility testing beyond modern browsers
- Performance optimization

## Design Considerations

### Color Scheme
- Use simple, bold colors with high contrast ratios (minimum 4.5:1 for normal text)
- Suggested color palette using CSS custom properties:
  - `--red-joker`: #dc2626 (red-600)
  - `--black-joker`: #1f2937 (gray-800)  
  - `--card-a`: #3b82f6 (blue-500)
  - `--card-2`: #10b981 (emerald-500)
  - `--card-3`: #f59e0b (amber-500)
  - `--card-4`: #8b5cf6 (violet-500)
  - `--card-collapsed`: #6b7280 (gray-500)
  - `--background`: #f3f4f6 (gray-100)

### Layout Specifications
- Board should be centered with `margin: 0 auto`
- Maximum board width: 400px on desktop
- Minimum card size: 60px × 60px for touch accessibility
- Gap between cards: 8px using `gap` property
- Board padding: 16px from screen edges

### Typography
- Use system font stack: `-apple-system, BlinkMacSystemFont, sans-serif`
- Card text size: 1.5rem (24px) for good readability
- Bold font weight for card numbers/text

## Technical Considerations

### File Organization
Follow the file structure defined in plan.md:
```
collapsi/
├── index.html
├── css/
│   ├── styles.css    # Base styles and variables
│   ├── board.css     # Game board layout
│   └── mobile.css    # Mobile responsive styles
├── js/
│   └── game.js       # Placeholder for future phases
└── README.md         # Setup instructions
```

### CSS Methodology
- Use basic CSS organization (no BEM or CSS modules required for this phase)
- Leverage CSS Grid for layout (no flexbox fallbacks needed)
- Use CSS custom properties for maintainable color management
- Mobile-first approach: base styles for mobile, media queries for larger screens

### Browser Support
- Target modern browsers with CSS Grid support (Chrome 57+, Firefox 52+, Safari 10.1+)
- No IE11 support required
- Focus on WebKit browsers for iOS testing

## Success Metrics

### Visual Validation Checklist
- [ ] 4x4 grid displays correctly on iPhone 11 (375×812px)
- [ ] Board centers properly on desktop screens (1920×1080px)
- [ ] All 16 cards are visually distinct with different colors
- [ ] Card text is readable with sufficient contrast
- [ ] Grid maintains square proportions across different screen sizes
- [ ] No layout breaking on orientation change
- [ ] Hover effects work on desktop browsers

### Technical Validation
- [ ] HTML validates with W3C HTML validator
- [ ] CSS has no syntax errors
- [ ] All files load without 404 errors
- [ ] Page loads in under 2 seconds on mobile
- [ ] Responsive design works on Chrome DevTools device emulation

### QA Testing Instructions
1. Open `index.html` in Chrome browser
2. Verify 4x4 grid displays with 16 distinct cards
3. Test responsive behavior using Chrome DevTools:
   - iPhone 11 (375×812px)
   - iPad (768×1024px) 
   - Desktop (1920×1080px)
4. Rotate device/browser to test landscape mode
5. Verify board stays centered on larger screens
6. Check that card colors are distinct and text is readable

## Open Questions

1. Should we include any placeholder pawn indicators in this phase, or focus purely on the card grid?
2. Do we need to consider any specific accessibility testing tools for color contrast validation?
3. Should we include basic meta tags for SEO/social sharing, or keep it minimal for development?
4. Are there any specific mobile browser testing requirements beyond iOS Safari?

---

**Estimated Development Time:** 1-2 days for a junior developer
**Dependencies:** None
**Priority:** High (blocking subsequent phases)