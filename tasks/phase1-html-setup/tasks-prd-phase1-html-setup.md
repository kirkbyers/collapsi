# Task List: Phase 1 - Basic HTML Structure & Setup

## Relevant Files

- `index.html` - Main HTML file with semantic structure and game board container
- `css/styles.css` - Base styles and CSS custom properties for color scheme
- `css/board.css` - CSS Grid layout for 4x4 game board
- `css/mobile.css` - Mobile-specific responsive styles and media queries
- `js/game.js` - Placeholder JavaScript file for future phases
- `README.md` - Development setup instructions and QA testing guide

### Notes

- No unit tests required for this phase as it's purely static HTML/CSS
- Use Chrome DevTools device emulation for mobile testing
- HTML can be opened directly in browser (no local server required for this phase)

## Tasks

- [x] 1.0 Create HTML Foundation Structure
  - [x] 1.1 Create `index.html` with HTML5 doctype and basic structure
  - [x] 1.2 Add mobile-optimized viewport meta tag (`width=device-width, initial-scale=1.0`)
  - [x] 1.3 Include semantic HTML elements: `<header>`, `<main>`, `<footer>`
  - [x] 1.4 Create div container with ID `game-board` inside main element
  - [x] 1.5 Add CSS file references: `css/styles.css`, `css/board.css`, `css/mobile.css`
  - [x] 1.6 Add placeholder JavaScript file reference: `js/game.js`
  - [x] 1.7 Create basic page title and header content for "Collapsi Game"

- [x] 2.0 Implement CSS Architecture and Color System
  - [x] 2.1 Create `css/styles.css` with CSS custom properties for color scheme
  - [x] 2.2 Define 8 color variables: red-joker, black-joker, card-a, card-2, card-3, card-4, card-collapsed, background
  - [x] 2.3 Set up base typography with system font stack (`-apple-system, BlinkMacSystemFont, sans-serif`)
  - [x] 2.4 Add basic reset/normalize styles for consistent cross-browser rendering
  - [x] 2.5 Create utility classes for text styling and card text size (1.5rem)
  - [x] 2.6 Implement hover effects for cards using CSS pseudo-classes

- [x] 3.0 Build 4x4 Game Board Layout
  - [x] 3.1 Create `css/board.css` with CSS Grid layout (`grid-template-columns: repeat(4, 1fr)`)
  - [x] 3.2 Set up 4x4 grid with proper rows (`grid-template-rows: repeat(4, 1fr)`)
  - [x] 3.3 Add 16 card div elements in `index.html` with placeholder content
  - [x] 3.4 Distribute cards: 1 Red Joker, 1 Black Joker, 4 A's, 4 2's, 4 3's, 2 4's
  - [x] 3.5 Apply distinct background colors to each card type using CSS custom properties
  - [x] 3.6 Set card dimensions with minimum 60px × 60px for touch accessibility
  - [x] 3.7 Add 8px gap between cards using CSS Grid `gap` property
  - [x] 3.8 Ensure cards maintain square aspect ratio

- [x] 4.0 Implement Mobile-First Responsive Design
  - [x] 4.1 Create `css/mobile.css` with mobile-first base styles
  - [x] 4.2 Center game board horizontally with `margin: 0 auto`
  - [x] 4.3 Set maximum board width to 400px for desktop screens
  - [x] 4.4 Add 16px padding from screen edges for mobile spacing
  - [x] 4.5 Use relative units (vw, vh, rem) for responsive scaling
  - [x] 4.6 Add media queries for tablet (768px+) and desktop (1024px+) breakpoints
  - [x] 4.7 Test and adjust layout for portrait and landscape orientations
  - [x] 4.8 Ensure board scales appropriately on iPhone 11-15 screen sizes

- [x] 5.0 Create Development Documentation and Setup Instructions
  - [x] 5.1 Create `README.md` with project overview and setup instructions
  - [x] 5.2 Document how to open the project in a web browser
  - [x] 5.3 Include mobile testing instructions using Chrome DevTools device emulation
  - [x] 5.4 Add QA validation checklist with specific testing steps
  - [x] 5.5 Document expected visual outcomes for different screen sizes
  - [x] 5.6 Include browser compatibility requirements and testing guidelines
  - [x] 5.7 Add troubleshooting section for common issues