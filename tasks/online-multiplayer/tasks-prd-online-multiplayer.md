# Tasks for Online Multiplayer Foundation (Phase 8)

## Relevant Files

- `server/server.js` - Main Express server with Socket.io integration for WebSocket connections
- `server/room-manager.js` - Room creation, joining, expiration, and lifecycle management
- `server/game-validator.js` - Server-side game state validation using existing movement modules
- `server/utils.js` - Server utility functions for room code generation and validation
- `js/multiplayer.js` - WebSocket client for connecting to server and handling real-time communication
- `js/ui.js` - Updated UI interactions to include game mode selection and room interface
- `js/game.js` - Modified to support both local and online multiplayer modes
- `css/multiplayer.css` - Styles for multiplayer-specific UI elements (room interface, connection status)
- `package.json` - Server dependencies (express, socket.io, cors)
- `server/package.json` - Server-specific package.json if using separate server directory

### Notes

- Server code will reuse existing game logic modules from `js/movement/`, `js/game.js`, `js/board.js`, and `js/player.js`
- WebSocket connections will use Socket.io for reliability and reconnection support
- Room codes will be generated server-side with profanity filtering for auto-generated codes
- Connection status indicators will be integrated into existing UI components
- Local multiplayer functionality must remain completely unchanged

## Tasks

- [ ] 1.0 Backend Server Setup and Room Management
  - [ ] 1.1 Initialize Node.js server with Express and Socket.io dependencies
  - [ ] 1.2 Create basic HTTP server serving static files from project root
  - [ ] 1.3 Implement WebSocket connection handling with Socket.io
  - [ ] 1.4 Create room management system with 6-digit alphanumeric code generation
  - [ ] 1.5 Implement room creation with optional user-specified codes
  - [ ] 1.6 Add profanity filtering for server-generated room codes
  - [ ] 1.7 Implement room joining logic with player limit enforcement (2 players max)
  - [ ] 1.8 Add random player color assignment (Red/Blue) upon room joining
  - [ ] 1.9 Implement room expiration (5min inactivity, 1min post-game completion)
  - [ ] 1.10 Add rejoin functionality for disconnected players using same room code
  - [ ] 1.11 Create room cleanup and memory management for expired rooms

- [ ] 2.0 Frontend Game Mode Selection and Room Interface
  - [ ] 2.1 Add game mode selection UI (Local vs Online) to main menu
  - [ ] 2.2 Create room interface with Create Room and Join Room options
  - [ ] 2.3 Implement room code input field with validation
  - [ ] 2.4 Add waiting screen for players waiting for opponent to join
  - [ ] 2.5 Display current room code to players for sharing
  - [ ] 2.6 Add connection status indicator to show WebSocket connection state
  - [ ] 2.7 Update turn indicator to show local vs remote player information
  - [ ] 2.8 Add "Change Game Mode" option to existing hamburger menu
  - [ ] 2.9 Modify winner modal to handle online game completion and room cleanup
  - [ ] 2.10 Ensure all existing local multiplayer UI remains unchanged

- [ ] 3.0 WebSocket Client Integration and Connection Management
  - [ ] 3.1 Create WebSocket client module using Socket.io client library
  - [ ] 3.2 Implement connection establishment and authentication
  - [ ] 3.3 Add automatic reconnection logic with exponential backoff
  - [ ] 3.4 Implement connection status monitoring and UI updates
  - [ ] 3.5 Handle room joining and player assignment events
  - [ ] 3.6 Add real-time move broadcasting and receiving
  - [ ] 3.7 Implement game state synchronization between players
  - [ ] 3.8 Add disconnection handling and rejoin attempts
  - [ ] 3.9 Create event handlers for all server-to-client messages
  - [ ] 3.10 Implement client-side message queuing during connection interruptions

- [ ] 4.0 Server-Side Game Logic Integration and Move Validation
  - [ ] 4.1 Import and adapt existing movement validation modules for server use
  - [ ] 4.2 Create server-side game state management mirroring client structure
  - [ ] 4.3 Implement move validation using existing js/movement/ modules
  - [ ] 4.4 Add server-side board state tracking and consistency validation
  - [ ] 4.5 Implement turn management and player switching logic
  - [ ] 4.6 Add game end detection and winner determination
  - [ ] 4.7 Create move broadcasting system to synchronize game state
  - [ ] 4.8 Implement anti-cheat validation for all player moves
  - [ ] 4.9 Add game state persistence during player reconnection
  - [ ] 4.10 Ensure <100ms server-side move validation response time

- [ ] 5.0 Error Handling and Fallback Systems
  - [ ] 5.1 Create comprehensive error message system for connection issues
  - [ ] 5.2 Implement fallback message when server is unavailable
  - [ ] 5.3 Add handling for invalid or expired room codes
  - [ ] 5.4 Implement full room error handling (room capacity exceeded)
  - [ ] 5.5 Add network timeout handling and retry logic
  - [ ] 5.6 Create graceful degradation to local multiplayer when online fails
  - [ ] 5.7 Implement client-side error recovery and state cleanup
  - [ ] 5.8 Add server-side error logging and monitoring
  - [ ] 5.9 Create user-friendly error notifications and recovery suggestions
  - [ ] 5.10 Test error scenarios and ensure proper fallback behavior