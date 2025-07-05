# Product Requirements Document: Online Multiplayer Foundation

## Introduction/Overview

This feature adds online multiplayer capability to the Collapsi game, allowing players to play against each other remotely using room codes. The system will use WebSocket connections for real-time communication and maintain the existing local multiplayer functionality as an alternative game mode.

**Problem**: Currently, players can only play Collapsi locally on the same device. This limits the game's accessibility and social potential.

**Goal**: Enable two players to play Collapsi remotely through a simple room-based system while preserving all existing game mechanics and local play options.

## Goals

1. **Seamless Remote Play**: Enable two players to play Collapsi from different devices/locations
2. **Simple Room System**: Provide easy-to-use 6-digit room codes for game matching
3. **Reliable Connection**: Maintain stable WebSocket connections with reconnection support
4. **Game Integrity**: Validate all moves server-side using existing game logic
5. **Preserve Local Play**: Keep existing local multiplayer as a selectable game mode
6. **Graceful Degradation**: Handle server unavailability with clear fallback messaging

## User Stories

**As a player wanting to play remotely:**
- I want to create a room and share a code with my friend so we can play together
- I want to join a room using a code my friend shared with me
- I want to see connection status so I know if the game is working properly
- I want the game to automatically reconnect if my connection drops temporarily

**As a player with connection issues:**
- I want to see clear error messages when the server is unavailable
- I want to rejoin the same room if I get disconnected during a game
- I want to fall back to local multiplayer when online isn't available

**As a player who prefers local play:**
- I want to continue playing local multiplayer without any changes to that experience
- I want to easily switch between local and online game modes

## Functional Requirements

### Room Management
1. **Room Creation**: System must generate unique 6-digit alphanumeric room codes (case-insensitive)
2. **Server-Generated Codes**: Server-created room codes must filter out profanity
3. **User-Created Codes**: Users can optionally specify their own room codes without filtering
4. **Room Joining**: Players must be able to join existing rooms using valid codes
5. **Random Player Assignment**: Players joining rooms must be randomly assigned Red or Blue color
6. **Room Expiration**: Rooms must expire after 5 minutes of inactivity or 1 minute after game completion
7. **Rejoin Support**: Players must be able to rejoin rooms using the same code after disconnection

### Connection Management
8. **Connection Status**: System must display current connection status to players
9. **Automatic Reconnection**: System must attempt to reconnect automatically on connection loss
10. **Reconnection Retries**: System must retry connection attempts with exponential backoff
11. **No Spectators**: Rooms must be limited to exactly 2 players (no spectator mode)

### Game State Synchronization
12. **Server Validation**: All moves must be validated server-side using existing game logic
13. **Code Reuse**: Server must reuse existing movement validation modules from js/movement/
14. **State Consistency**: Game state must remain synchronized between both players
15. **Move Broadcasting**: Valid moves must be broadcast to both players in real-time

### Game Mode Selection
16. **Game Mode Menu**: System must provide option to choose between Local and Online multiplayer
17. **Local Play Preservation**: Existing local multiplayer functionality must remain unchanged
18. **Mode Switching**: Players must be able to switch between game modes without page refresh

### Error Handling
19. **Server Unavailable**: System must show clear fallback message when server is down
20. **Connection Errors**: System must provide specific error messages for different connection issues
21. **Invalid Room Codes**: System must handle invalid or expired room codes gracefully
22. **Full Rooms**: System must handle attempts to join rooms that already have 2 players

## Non-Goals (Out of Scope)

- **Spectator Mode**: No support for watching ongoing games
- **Chat System**: No in-game messaging between players
- **Player Profiles**: No user accounts or persistent player data
- **Matchmaking**: No automatic player matching (only room codes)
- **Game History**: No server-side storage of completed games
- **Multiple Game Rooms**: Players cannot be in multiple rooms simultaneously
- **Room Customization**: No custom room settings or game variants
- **Mobile App**: Web-based implementation only

## Design Considerations

### Frontend UI Changes
- **Game Mode Selection**: Add radio buttons or toggle for Local vs Online on main menu
- **Room Interface**: Simple input field for room codes with Create/Join buttons
- **Connection Indicator**: Small status indicator showing connection state
- **Waiting Screen**: Display while waiting for second player to join
- **Error Messages**: Toast notifications or modal dialogs for connection issues

### Integration with Existing UI
- **Hamburger Menu**: Add "Change Game Mode" option to existing menu
- **Turn Indicator**: Modify to show local vs remote player information
- **Winner Modal**: Update to handle online game completion and room cleanup

## Technical Considerations

### Backend Architecture
- **Node.js Server**: Use Express.js for HTTP server and Socket.io for WebSocket connections
- **Room Management**: In-memory storage for active rooms (no database required)
- **Game Logic Sharing**: Import and reuse existing JavaScript modules for server-side validation
- **Code Organization**: Create server/ directory matching existing js/ structure

### Code Reuse Strategy
- **Movement Validation**: Reuse js/movement/ modules on server side
- **Game State**: Reuse game state structures from js/game.js
- **Board Logic**: Reuse board management from js/board.js
- **Player Logic**: Reuse player management from js/player.js

### Performance Requirements
- **Move Validation**: Server-side validation must maintain <100ms response time
- **Connection Latency**: Game should remain playable with up to 200ms latency
- **Room Limits**: Server should handle up to 100 concurrent rooms

### Security Considerations
- **Input Validation**: Sanitize all room codes and game moves
- **Rate Limiting**: Prevent spam of room creation and move requests
- **Move Validation**: Ensure all moves are validated against current game state

## Success Metrics

### Primary Metrics
- **Successful Game Completion**: 90% of online games should complete without connection errors
- **Room Creation Success**: 95% of room creation attempts should succeed
- **Reconnection Success**: 80% of disconnection events should result in successful reconnection

### Secondary Metrics
- **Game Mode Adoption**: Track usage split between local and online multiplayer
- **Room Code Sharing**: Monitor successful room joins vs failed attempts
- **Connection Stability**: Average connection duration and dropout rates

## Open Questions

1. **Room Code Format**: Should room codes be purely numeric for easier verbal sharing?
2. **Player Identification**: How should players be identified to each other in the room?
3. **Game Abandonment**: How should the system handle when one player leaves mid-game?
4. **Server Scaling**: What happens when the single server instance reaches capacity?
5. **Mobile Network**: Any special considerations for mobile data connections?
6. **Development vs Production**: Should there be separate server endpoints for testing?

## Implementation Notes

### Phase 8 Deliverables
- **Backend Server**: Node.js server with Express and Socket.io
- **Frontend Integration**: WebSocket client in js/multiplayer.js
- **UI Updates**: Game mode selection and room management interface
- **Error Handling**: Comprehensive error states and fallback messaging

### Dependencies
- **npm packages**: express, socket.io, cors
- **Existing Code**: All js/movement/ modules, js/game.js, js/board.js
- **UI Components**: Existing modal and menu systems

### Testing Strategy
- **Local Testing**: Two browser windows/tabs for initial testing
- **Network Testing**: Test with simulated network delays and disconnections
- **Multi-device Testing**: Test on different devices and browsers
- **Server Load Testing**: Verify performance with multiple concurrent rooms