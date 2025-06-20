# PRD: Phase 7 - Polish & Mobile Optimization

## Introduction/Overview

This phase focuses on enhancing the visual appeal, user experience, and mobile optimization of the Collapsi game. The goal is to transform the functionally complete game into a polished, professional experience that feels fun and engaging to play. This includes implementing smooth animations, establishing a unified bright color scheme, optimizing touch interactions, and improving typography - all while maintaining the no-build-tools constraint.

## Goals

1. Implement fun and snappy animations that enhance gameplay without causing performance issues
2. Establish a unified, bright, high-contrast color scheme throughout the game
3. Ensure all touch targets meet accessibility standards and feel responsive
4. Apply fun but professional typography that enhances readability and game appeal
5. Maintain smooth 60fps performance on iPhone 11+ devices
6. Preserve the vanilla JavaScript/CSS architecture without introducing build tools

## User Stories

- As a player, I want smooth animations when I move pawns so that the game feels responsive and engaging
- As a player, I want card collapse animations to be visually satisfying so that I understand the game state changes
- As a mobile user, I want all buttons and interactive elements to be easy to tap so that I don't make accidental moves
- As a player, I want consistent, bright colors throughout the game so that it's easy to distinguish different elements
- As a player, I want the game to look polished and professional so that I enjoy playing it
- As a player with accessibility needs, I want high contrast colors so that I can easily see all game elements

## Functional Requirements

### Animations
1. The system must implement smooth pawn movement animations (225ms duration) using CSS transforms
2. The system must provide flip animations for card collapse with visual feedback
3. The system must animate legal move highlighting with smooth fade-in/fade-out transitions
4. The system must implement micro-interactions for button presses and touch feedback
5. The system must maintain 60fps performance during all animations on iPhone 11+ devices
6. The system must provide visual feedback for invalid moves (shake animation)

### Color Scheme & Theming
7. The system must implement a unified bright, high-contrast color palette using CSS custom properties
8. The system must ensure all colors meet WCAG AA contrast requirements (4.5:1 for normal text, 7:1 for enhanced)
9. The system must apply consistent theming to all game elements (board, cards, pawns, UI controls)
10. The system must use distinct colors for different game states (active, collapsed, highlighted)
11. The system must maintain color consistency across all modals and dialogs

### Touch Targets & Mobile Optimization
12. The system must ensure all interactive elements are minimum 44px in size for comfortable touch interaction
13. The system must optimize touch response times to feel instantaneous (<100ms)
14. The system must handle orientation changes gracefully without layout breaks
15. The system must provide adequate spacing between touch targets to prevent accidental taps
16. The system must implement proper touch feedback for all interactive elements

### Typography
17. The system must implement a fun but professional font hierarchy using web-safe fonts or system fonts
18. The system must ensure all text is readable at minimum iPhone 11 screen size (375px width)
19. The system must use appropriate font weights and sizes for different UI elements
20. The system must maintain consistent typography across all game components and dialogs

## Non-Goals (Out of Scope)

- Build tools, bundlers, or preprocessing systems
- Advanced animations requiring JavaScript animation libraries
- Custom web fonts that require external loading
- Responsive design for devices smaller than iPhone 11
- Dark mode implementation (future enhancement)
- Advanced accessibility features beyond color contrast and touch targets

## Design Considerations

- Use CSS Grid and Flexbox for layout consistency
- Implement animations using CSS transitions and transforms for optimal performance
- Leverage CSS custom properties (variables) for consistent theming
- Follow mobile-first design principles
- Ensure visual hierarchy supports game flow and decision-making
- Maintain existing component structure while enhancing visual presentation

## Technical Considerations

- All animations must use CSS transforms and transitions for hardware acceleration
- Color scheme must be implemented using CSS custom properties for easy maintenance
- Touch optimizations should use existing event handling without additional libraries
- Typography must use system font stacks or web-safe fonts only
- Performance optimizations should not require JavaScript animation frameworks
- All styles must be organized within existing CSS file structure (styles.css, board.css, mobile.css)

## Success Metrics

- Smooth 60fps animations during gameplay on iPhone 11+ devices
- All touch targets meet minimum 44px accessibility standards
- Color contrast ratios meet WCAG AA requirements (measurable via browser dev tools)
- Game feels responsive with <100ms touch response times
- Visual consistency across all game components and states
- Enhanced user engagement and enjoyment (qualitative assessment through playtesting)
- No performance regressions compared to current implementation

## Open Questions

1. Should we implement haptic feedback for supported devices, or keep it purely visual? Haptics for supported devices on web would be great.
2. Are there specific animation easing functions that would best match the game's character?
3. Should the color scheme include any branding elements or remain purely functional? functional.
4. How should we handle the winner modal animations to make them feel celebratory but not overwhelming? Use confeti