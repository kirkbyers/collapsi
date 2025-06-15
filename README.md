# Collapsi Game - Phase 1

A digital adaptation of the strategic board game Collapsi, designed for mobile-first gameplay.

## Game Overview

Collapsi is a 2-player strategy game where players move pawns on a collapsing 4x4 card grid. The last player able to make a legal move wins the game.

### Game Components
- **Board**: 4x4 grid of cards (Red Joker, Black Joker, 4×A, 4×2, 4×3, 4×4)
- **Players**: 2 players with colored pawns (Red starts on Red Joker, Blue on Black Joker)
- **Movement**: Orthogonal movement (up/down/left/right) with wraparound edges
- **Card Collapse**: Starting card flips face-down after each move (becomes impassable)
- **Win Condition**: Last player able to complete a legal move wins

## Phase 1 Status

✅ **COMPLETED**: Basic HTML Structure & Game Board Display

This phase implements a static 4x4 game board with:
- Responsive mobile-first design
- All 16 game cards with distinct colors
- CSS Grid layout with proper spacing
- iPhone 11+ optimization
- Portrait/landscape orientation support

## Setup Instructions

### Prerequisites
- Modern web browser (Chrome 57+, Firefox 52+, Safari 10.1+)
- No server installation required for Phase 1

### Running the Game

1. **Clone or download** this repository to your local machine

2. **Open the game** in your web browser:
   ```bash
   # Navigate to the project directory
   cd collapsi
   
   # Open index.html in your default browser
   open index.html
   
   # OR double-click index.html in your file manager
   ```

3. **Alternative: Use a local server** (optional but recommended):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have live-server installed)
   npx live-server
   
   # Then open http://localhost:8000 in your browser
   ```

## Testing on Mobile Devices

### Using Chrome DevTools
1. Open the game in Chrome browser
2. Press `F12` or right-click → "Inspect"
3. Click the device toggle icon (📱) or press `Ctrl+Shift+M`
4. Select device presets to test:
   - iPhone 11 (375×812px)
   - iPhone 12/13/14 (390×844px)
   - iPhone 15 (393×852px)
   - iPad (768×1024px)
5. Test both portrait and landscape orientations

### Testing on Real Devices
1. Ensure your computer and mobile device are on the same Wi-Fi network
2. Find your computer's IP address:
   ```bash
   # On Mac/Linux
   ifconfig | grep "inet "
   
   # On Windows
   ipconfig
   ```
3. Start a local server (see setup instructions above)
4. On your mobile device, navigate to: `http://[YOUR_IP]:8000`

## Expected Visual Outcome

### Mobile (iPhone 11+)
- 4x4 grid of colorful cards centered on screen
- Cards scale appropriately to screen size
- Minimum 60px touch targets
- 16px padding from screen edges

### Tablet (768px+)
- Larger card sizes with improved spacing
- Board remains centered with max 400px width

### Desktop (1024px+)
- Fixed maximum board width (400px)
- Generous spacing and padding
- Hover effects on cards

### Card Colors
- **Red Joker**: Red background (#dc2626)
- **Black Joker**: Dark gray background (#1f2937)
- **A Cards**: Blue background (#3b82f6)
- **2 Cards**: Green background (#10b981)
- **3 Cards**: Amber background (#f59e0b)
- **4 Cards**: Purple background (#8b5cf6)

## Project Structure

```
collapsi/
├── index.html              # Main game page
├── css/
│   ├── styles.css         # Base styles and color variables
│   ├── board.css          # Game board CSS Grid layout
│   └── mobile.css         # Mobile-first responsive styles
├── js/
│   └── game.js            # Placeholder for future phases
├── tasks/                 # Development tasks and PRDs
├── plan.md               # Overall implementation plan
└── README.md             # This file
```

## Browser Support

- **Chrome**: 57+ (CSS Grid support)
- **Firefox**: 52+ (CSS Grid support)
- **Safari**: 10.1+ (CSS Grid support)
- **Mobile Safari**: iOS 10.3+
- **Chrome Mobile**: Android 4.4+

## Development Notes

This is Phase 1 of 8 planned development phases. Current implementation includes:

### Completed Features
- ✅ Semantic HTML5 structure
- ✅ CSS custom properties for theming
- ✅ CSS Grid 4x4 board layout
- ✅ Mobile-first responsive design
- ✅ Touch-friendly card sizing
- ✅ Hover effects and interactions
- ✅ Cross-browser compatibility

### Coming in Future Phases
- 🔄 JavaScript game logic
- 🔄 Player movement and interaction
- 🔄 Game rules enforcement
- 🔄 Local multiplayer
- 🔄 Online multiplayer with room codes
- 🔄 Animations and polish

## Troubleshooting

### Game doesn't display correctly
- Ensure you're using a modern browser with CSS Grid support
- Try refreshing the page (`Ctrl+F5` or `Cmd+Shift+R`)
- Check browser console for any error messages

### Mobile layout issues
- Verify viewport meta tag is present in index.html
- Test with Chrome DevTools device emulation first
- Clear browser cache if styles aren't updating

### Cards appear unstyled
- Ensure all CSS files are loading (check browser Network tab)
- Verify file paths are correct relative to index.html
- Check for CSS syntax errors in browser console

## Contributing

This project follows a structured development approach with PRDs and task lists. See the `/tasks/` directory for detailed implementation requirements.

---

**Development Status**: Phase 1 Complete ✅  
**Next Phase**: JavaScript Game Logic Implementation