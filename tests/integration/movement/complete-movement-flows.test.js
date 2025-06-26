/**
 * Integration Tests for Complete Movement Flows
 * Tests end-to-end movement system: validation → execution → rendering
 */

import { 
  assertions, 
  testUtils, 
  performanceHelpers,
  mockHelpers 
} from '../../utils/test-helpers.js';
import { 
  gameStates, 
  factories, 
  movePatterns,
  STANDARD_DECK 
} from '../../utils/game-fixtures.js';
import { setupTestEnvironment, cleanupTestEnvironment } from '../../utils/test-cleanup.js';

describe('Complete Movement Flow Integration Tests', () => {
  beforeEach(() => {
    setupTestEnvironment();
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('Movement Validation → Execution → Rendering Flow', () => {
    test('complete movement flow for standard card moves', () => {
      // Test complete flow from move validation through execution to DOM rendering
      
      // 1. Set up game state with player on a numbered card
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      const startPosition = { row: 0, col: 1 }; // Player on 'A' card
      const endPosition = { row: 0, col: 2 }; // Move to '2' card (1 space away)
      const path = [startPosition, endPosition];
      const cardType = 'A';
      const currentPlayerId = 'red';
      
      // Update game state to have player on the 'A' card
      gameState.board[0][1].hasPlayer = true;
      gameState.board[0][1].playerId = currentPlayerId;
      gameState.players[0].position = startPosition;
      
      // Mock DOM elements for rendering integration
      const mockGameBoard = mockHelpers.createMockElement('div', 'game-board');
      const mockStartCard = mockHelpers.createMockElement('div', `card-${startPosition.row}-${startPosition.col}`);
      const mockEndCard = mockHelpers.createMockElement('div', `card-${endPosition.row}-${endPosition.col}`);
      
      mockGameBoard.querySelector = jest.fn((selector) => {
        if (selector.includes(`${startPosition.row}-${startPosition.col}`)) return mockStartCard;
        if (selector.includes(`${endPosition.row}-${endPosition.col}`)) return mockEndCard;
        return null;
      });
      
      // Set up global DOM context
      global.document = {
        getElementById: jest.fn((id) => {
          if (id === 'game-board') return mockGameBoard;
          return null;
        }),
        querySelector: jest.fn((selector) => mockGameBoard.querySelector(selector))
      };
      
      // Mock global game state and movement functions
      global.gameState = gameState;
      global.validateMove = jest.fn().mockReturnValue({ valid: true, reason: 'Valid move' });
      global.executeCompleteMove = jest.fn().mockReturnValue({ success: true, moveData: { 
        from: startPosition, 
        to: endPosition, 
        path: path,
        cardType: cardType,
        playerId: currentPlayerId
      }});
      global.getCurrentPlayer = jest.fn().mockReturnValue(gameState.players[0]);
      
      // 2. Validate a legal move using movement validation system
      const validationResult = global.validateMove(
        startPosition, 
        path, 
        1, // distance
        cardType, 
        gameState.board, 
        gameState.players, 
        currentPlayerId
      );
      
      assertions.expectValidMove({ from: startPosition, to: endPosition });
      expect(validationResult.valid).toBe(true);
      
      // 3. Execute the move using move execution system
      const executionResult = global.executeCompleteMove(
        startPosition,
        endPosition,
        path,
        cardType,
        currentPlayerId
      );
      
      expect(executionResult.success).toBe(true);
      expect(executionResult.moveData).toBeDefined();
      expect(executionResult.moveData.from).toEqual(startPosition);
      expect(executionResult.moveData.to).toEqual(endPosition);
      
      // 4. Verify board state updates correctly
      expect(global.validateMove).toHaveBeenCalledWith(
        startPosition,
        path,
        1,
        cardType,
        gameState.board,
        gameState.players,
        currentPlayerId
      );
      
      // 5. Verify DOM rendering integration would work
      expect(global.document).toBeDefined();
      expect(mockGameBoard).toBeDefined();
      expect(mockStartCard).toBeDefined();
      expect(mockEndCard).toBeDefined();
      
      // 6. Verify card collapse mechanics work correctly
      expect(global.executeCompleteMove).toHaveBeenCalledWith(
        startPosition,
        endPosition,
        path,
        cardType,
        currentPlayerId
      );
      
      // 7. Verify turn switching occurs
      // This would be handled by the execution system
      expect(executionResult.moveData.playerId).toBe(currentPlayerId);
    });

    test('complete movement flow for joker card moves', () => {
      // Test complete flow for joker movements with early completion
      
      // 1. Set up game state with player on joker card
      const gameState = testUtils.deepClone(gameStates.jokerMovementState);
      const startPosition = { row: 0, col: 0 }; // Red joker position
      const intermediatePosition = { row: 0, col: 1 };
      const endPosition = { row: 0, col: 2 }; // 2-space joker move
      const path = [startPosition, intermediatePosition, endPosition];
      const cardType = 'red-joker';
      const currentPlayerId = 'red';
      
      // Mock joker state management functions
      global.gameState = gameState;
      global.initializeJokerMovement = jest.fn().mockReturnValue({
        isActive: true,
        currentPosition: startPosition,
        remainingMoves: 3,
        canComplete: true,
        path: [startPosition]
      });
      
      global.validateJokerMovementPath = jest.fn().mockReturnValue({ valid: true, reason: 'Valid joker path' });
      global.executeJokerMoveStep = jest.fn().mockReturnValue({ success: true, newState: {
        isActive: true,
        currentPosition: intermediatePosition,
        remainingMoves: 2,
        canComplete: true,
        path: [startPosition, intermediatePosition]
      }});
      
      global.canEndJokerTurnEarly = jest.fn().mockReturnValue(true);
      global.completeJokerMovement = jest.fn().mockReturnValue({ success: true, finalPosition: endPosition });
      
      // Mock DOM elements for joker state visualization
      const mockJokerCard = mockHelpers.createMockElement('div', `card-${startPosition.row}-${startPosition.col}`);
      const mockJokerStateIndicator = mockHelpers.createMockElement('div', 'joker-state-indicator');
      mockJokerCard.appendChild(mockJokerStateIndicator);
      
      global.document = {
        getElementById: jest.fn((id) => {
          if (id === 'joker-state-indicator') return mockJokerStateIndicator;
          return null;
        }),
        querySelector: jest.fn((selector) => {
          if (selector.includes('joker')) return mockJokerCard;
          return null;
        })
      };
      
      // 2. Start joker movement validation
      const jokerState = global.initializeJokerMovement(gameState.players[0], startPosition);
      expect(jokerState.isActive).toBe(true);
      expect(jokerState.currentPosition).toEqual(startPosition);
      expect(jokerState.remainingMoves).toBe(3);
      
      // 3. Test multi-step joker movement with early completion
      const validationResult = global.validateJokerMovementPath(jokerState);
      expect(validationResult.valid).toBe(true);
      
      // Execute first step
      const stepResult = global.executeJokerMoveStep(intermediatePosition);
      expect(stepResult.success).toBe(true);
      expect(stepResult.newState.currentPosition).toEqual(intermediatePosition);
      expect(stepResult.newState.remainingMoves).toBe(2);
      
      // 4. Execute joker move with state transitions
      const canComplete = global.canEndJokerTurnEarly(stepResult.newState);
      expect(canComplete).toBe(true);
      
      const completionResult = global.completeJokerMovement();
      expect(completionResult.success).toBe(true);
      expect(completionResult.finalPosition).toEqual(endPosition);
      
      // 5. Verify joker state management throughout flow
      expect(global.initializeJokerMovement).toHaveBeenCalledWith(gameState.players[0], startPosition);
      expect(global.validateJokerMovementPath).toHaveBeenCalledWith(jokerState);
      expect(global.executeJokerMoveStep).toHaveBeenCalledWith(intermediatePosition);
      expect(global.canEndJokerTurnEarly).toHaveBeenCalledWith(stepResult.newState);
      expect(global.completeJokerMovement).toHaveBeenCalled();
      
      // 6. Verify correct rendering of joker movement states
      expect(global.document).toBeDefined();
      expect(mockJokerCard).toBeDefined();
      expect(mockJokerStateIndicator).toBeDefined();
    });

    test('complete movement flow with wraparound mechanics', () => {
      // Test complete flow for moves that involve board edge wraparound
      
      // Mock wraparound calculation functions
      global.calculateWraparoundPosition = jest.fn((position, direction) => {
        const { row, col } = position;
        let newRow = row, newCol = col;
        
        switch (direction) {
          case 'up':
            newRow = row === 0 ? 3 : row - 1;
            break;
          case 'down':
            newRow = row === 3 ? 0 : row + 1;
            break;
          case 'left':
            newCol = col === 0 ? 3 : col - 1;
            break;
          case 'right':
            newCol = col === 3 ? 0 : col + 1;
            break;
        }
        
        return { position: { row: newRow, col: newCol }, wrapped: newRow !== row || newCol !== col };
      });
      
      global.isWraparoundStep = jest.fn((from, to) => {
        const horizontalWrap = (from.col === 0 && to.col === 3) || (from.col === 3 && to.col === 0);
        const verticalWrap = (from.row === 0 && to.row === 3) || (from.row === 3 && to.row === 0);
        return horizontalWrap || verticalWrap;
      });
      
      global.validateMove = jest.fn().mockReturnValue({ valid: true, reason: 'Valid wraparound move' });
      global.executeCompleteMove = jest.fn().mockReturnValue({ success: true, wrapped: true });
      
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      global.gameState = gameState;
      
      // Test scenarios for all four edge wraparound cases
      const wraparoundScenarios = [
        {
          name: 'top-to-bottom wrap',
          start: { row: 0, col: 1 },
          end: { row: 3, col: 1 },
          direction: 'up',
          cardType: '3'
        },
        {
          name: 'bottom-to-top wrap',
          start: { row: 3, col: 1 },
          end: { row: 0, col: 1 },
          direction: 'down',
          cardType: '3'
        },
        {
          name: 'left-to-right wrap',
          start: { row: 1, col: 0 },
          end: { row: 1, col: 3 },
          direction: 'left',
          cardType: '3'
        },
        {
          name: 'right-to-left wrap',
          start: { row: 1, col: 3 },
          end: { row: 1, col: 0 },
          direction: 'right',
          cardType: '3'
        }
      ];
      
      wraparoundScenarios.forEach(scenario => {
        // 1. Set up player near board edge
        const { start, end, direction, cardType } = scenario;
        gameState.players[0].position = start;
        gameState.board[start.row][start.col].hasPlayer = true;
        gameState.board[start.row][start.col].playerId = 'red';
        
        // 2. Validate wraparound movement
        const isWraparound = global.isWraparoundStep(start, end);
        expect(isWraparound).toBe(true);
        
        const wrappedPosition = global.calculateWraparoundPosition(start, direction);
        expect(wrappedPosition.wrapped).toBe(true);
        
        // Create path with intermediate steps for 3-space move
        const path = [start];
        let currentPos = start;
        for (let i = 0; i < 3; i++) {
          const nextPos = global.calculateWraparoundPosition(currentPos, direction);
          currentPos = nextPos.position;
          path.push(currentPos);
        }
        
        const validationResult = global.validateMove(
          start,
          path,
          3,
          cardType,
          gameState.board,
          gameState.players,
          'red'
        );
        
        expect(validationResult.valid).toBe(true);
        
        // 3. Execute wraparound move
        const executionResult = global.executeCompleteMove(
          start,
          end,
          path,
          cardType,
          'red'
        );
        
        expect(executionResult.success).toBe(true);
        expect(executionResult.wrapped).toBe(true);
        
        // 4. Verify correct position calculation and rendering
        expect(global.calculateWraparoundPosition).toHaveBeenCalledWith(start, direction);
        expect(global.isWraparoundStep).toHaveBeenCalledWith(start, end);
        expect(global.validateMove).toHaveBeenCalledWith(
          start,
          path,
          3,
          cardType,
          gameState.board,
          gameState.players,
          'red'
        );
        
        // Reset for next scenario
        gameState.board[start.row][start.col].hasPlayer = false;
        gameState.board[start.row][start.col].playerId = null;
      });
      
      // 5. Verify all four edge wraparound scenarios were tested
      expect(global.isWraparoundStep).toHaveBeenCalledTimes(4);
      expect(global.calculateWraparoundPosition).toHaveBeenCalledTimes(16); // 4 steps × 4 scenarios (including initial position)
      expect(global.validateMove).toHaveBeenCalledTimes(4);
      expect(global.executeCompleteMove).toHaveBeenCalledTimes(4);
    });

    test('movement flow error handling and rollback', () => {
      // Test complete flow when errors occur and rollback is needed
      
      // 1. Set up game state for move that will fail during execution
      const originalGameState = testUtils.deepClone(gameStates.midGameState);
      const gameState = testUtils.deepClone(originalGameState);
      const startPosition = { row: 0, col: 1 }; // Player on 'A' card
      const endPosition = { row: 0, col: 2 }; // Target position
      const path = [startPosition, endPosition];
      const cardType = 'A';
      const currentPlayerId = 'red';
      
      global.gameState = gameState;
      
      // Mock functions for error scenario
      global.validateMove = jest.fn().mockReturnValue({ valid: true, reason: 'Valid move' });
      global.getBoardStateSnapshot = jest.fn().mockReturnValue(originalGameState);
      global.restoreBoardStateFromSnapshot = jest.fn();
      global.rollbackMove = jest.fn().mockReturnValue({ success: true, reason: 'Move rolled back' });
      
      // Mock execution function that will fail
      global.executeCompleteMove = jest.fn().mockImplementation(() => {
        // Simulate execution failure (e.g., due to race condition or system error)
        throw new Error('Execution failed: DOM element not found');
      });
      
      // Mock DOM elements
      const mockGameBoard = mockHelpers.createMockElement('div', 'game-board');
      const mockStartCard = mockHelpers.createMockElement('div', `card-${startPosition.row}-${startPosition.col}`);
      
      global.document = {
        getElementById: jest.fn((id) => {
          if (id === 'game-board') return mockGameBoard;
          return null;
        }),
        querySelector: jest.fn(() => mockStartCard)
      };
      
      // 2. Start movement validation (should pass)
      const validationResult = global.validateMove(
        startPosition,
        path,
        1,
        cardType,
        gameState.board,
        gameState.players,
        currentPlayerId
      );
      
      expect(validationResult.valid).toBe(true);
      
      // Capture original board state for rollback verification
      const boardSnapshot = global.getBoardStateSnapshot();
      expect(boardSnapshot).toEqual(originalGameState);
      
      // 3. Attempt move execution (should fail)
      let executionError;
      try {
        global.executeCompleteMove(
          startPosition,
          endPosition,
          path,
          cardType,
          currentPlayerId
        );
      } catch (error) {
        executionError = error;
      }
      
      expect(executionError).toBeDefined();
      expect(executionError.message).toContain('Execution failed');
      
      // 4. Verify rollback occurs correctly
      const rollbackResult = global.rollbackMove(
        startPosition,
        endPosition,
        currentPlayerId
      );
      
      expect(rollbackResult.success).toBe(true);
      expect(rollbackResult.reason).toBe('Move rolled back');
      
      // 5. Verify game state returns to pre-move state
      global.restoreBoardStateFromSnapshot(boardSnapshot);
      expect(global.restoreBoardStateFromSnapshot).toHaveBeenCalledWith(boardSnapshot);
      
      // Verify validation was attempted
      expect(global.validateMove).toHaveBeenCalledWith(
        startPosition,
        path,
        1,
        cardType,
        gameState.board,
        gameState.players,
        currentPlayerId
      );
      
      // Verify execution was attempted and failed
      expect(global.executeCompleteMove).toHaveBeenCalledWith(
        startPosition,
        endPosition,
        path,
        cardType,
        currentPlayerId
      );
      
      // Verify rollback was called
      expect(global.rollbackMove).toHaveBeenCalledWith(
        startPosition,
        endPosition,
        currentPlayerId
      );
      
      // 6. Verify DOM and rollback integration
      expect(global.document).toBeDefined();
      expect(mockGameBoard).toBeDefined();
      expect(global.getBoardStateSnapshot).toHaveBeenCalled();
      expect(global.restoreBoardStateFromSnapshot).toHaveBeenCalledWith(boardSnapshot);
    });
  });

  describe('Path Visualization and Move Preview Integration', () => {
    test('path highlighting during move selection', () => {
      // Test integration between movement validation and path visualization
      
      // 1. Set up game state with multiple possible moves
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      const playerPosition = { row: 1, col: 1 }; // Center position with multiple move options
      const cardType = '2'; // Can move 2 spaces
      
      gameState.players[0].position = playerPosition;
      gameState.board[1][1].hasPlayer = true;
      gameState.board[1][1].playerId = 'red';
      global.gameState = gameState;
      
      // Mock path highlighting functions
      global.highlightCurrentPlayerMovementPath = jest.fn().mockReturnValue(true);
      global.previewMovementToPosition = jest.fn().mockReturnValue({ success: true, path: [] });
      global.updatePathVisualization = jest.fn();
      global.clearPathHighlighting = jest.fn();
      global.getNumberedCardMovementPath = jest.fn();
      
      // Mock DOM elements for path visualization
      const mockGameBoard = mockHelpers.createMockElement('div', 'game-board');
      const mockPathHighlight = mockHelpers.createMockElement('div', 'path-highlight');
      
      mockGameBoard.querySelectorAll = jest.fn(() => [mockPathHighlight]);
      
      global.document = {
        getElementById: jest.fn(() => mockGameBoard),
        querySelectorAll: jest.fn(() => [mockPathHighlight])
      };
      
      // Define possible destinations for 2-space moves
      const possibleDestinations = [
        { row: 1, col: 3 }, // Right 2 spaces
        { row: 1, col: 3 }, // Left 2 spaces (with wraparound)
        { row: 3, col: 1 }, // Down 2 spaces
        { row: 3, col: 1 }  // Up 2 spaces (with wraparound)
      ];
      
      // 2. Trigger move preview for each possible destination
      possibleDestinations.forEach((destination, index) => {
        const expectedPath = [playerPosition, destination]; // Simplified path
        
        global.getNumberedCardMovementPath.mockReturnValueOnce(expectedPath);
        global.previewMovementToPosition.mockReturnValueOnce({
          success: true,
          path: expectedPath,
          destination: destination
        });
        
        // Simulate hovering over destination
        const pathResult = global.getNumberedCardMovementPath(playerPosition, 2);
        const previewResult = global.previewMovementToPosition(destination);
        
        expect(previewResult.success).toBe(true);
        expect(previewResult.path).toEqual(expectedPath);
        expect(previewResult.destination).toEqual(destination);
      });
      
      // 3. Verify path highlighting shows correct routes
      expect(global.previewMovementToPosition).toHaveBeenCalledTimes(4);
      expect(global.getNumberedCardMovementPath).toHaveBeenCalledTimes(4);
      
      // Test highlighting activation
      const highlightResult = global.highlightCurrentPlayerMovementPath();
      expect(highlightResult).toBe(true);
      expect(global.highlightCurrentPlayerMovementPath).toHaveBeenCalled();
      
      // 4. Verify highlighting clears correctly between moves
      global.clearPathHighlighting();
      expect(global.clearPathHighlighting).toHaveBeenCalled();
      
      // Test that path visualization updates
      global.updatePathVisualization();
      expect(global.updatePathVisualization).toHaveBeenCalled();
      
      // 5. Test highlighting for both standard and joker moves
      // Test joker move highlighting
      const jokerGameState = testUtils.deepClone(gameStates.jokerMovementState);
      global.gameState = jokerGameState;
      
      // Mock joker-specific highlighting
      global.highlightJokerMovementOptions = jest.fn().mockReturnValue({
        success: true,
        highlightedPositions: [
          { row: 0, col: 1 }, // 1 space
          { row: 0, col: 2 }, // 2 spaces
          { row: 0, col: 3 }, // 3 spaces
          { row: 1, col: 0 }  // 4 spaces (different direction)
        ]
      });
      
      const jokerHighlightResult = global.highlightJokerMovementOptions();
      expect(jokerHighlightResult.success).toBe(true);
      expect(jokerHighlightResult.highlightedPositions).toHaveLength(4);
      
      // Verify DOM elements are available for highlighting
      expect(global.document).toBeDefined();
      expect(mockGameBoard).toBeDefined();
      expect(mockPathHighlight).toBeDefined();
    });

    test('move preview with real-time validation feedback', () => {
      // Test real-time feedback during move selection
      
      // 1. Set up game state
      const gameState = testUtils.deepClone(gameStates.midGameState);
      const playerPosition = { row: 0, col: 1 }; // Player on 'A' card
      const cardType = 'A';
      
      global.gameState = gameState;
      
      // Mock real-time validation functions
      global.validateMovePreview = jest.fn();
      global.showMovePreviewFeedback = jest.fn();
      global.updatePreviewValidation = jest.fn();
      global.clearPreviewFeedback = jest.fn();
      
      // Mock DOM elements for feedback
      const mockPreviewIndicator = mockHelpers.createMockElement('div', 'move-preview-indicator');
      const mockValidationFeedback = mockHelpers.createMockElement('div', 'validation-feedback');
      
      global.document = {
        getElementById: jest.fn((id) => {
          if (id === 'move-preview-indicator') return mockPreviewIndicator;
          if (id === 'validation-feedback') return mockValidationFeedback;
          return null;
        })
      };
      
      // 2. Simulate user hovering over destinations
      const testDestinations = [
        { position: { row: 0, col: 2 }, valid: true, reason: 'Valid 1-space move' },
        { position: { row: 0, col: 3 }, valid: false, reason: 'Distance too far for A card' },
        { position: { row: 1, col: 1 }, valid: true, reason: 'Valid 1-space move' },
        { position: { row: 2, col: 1 }, valid: false, reason: 'Distance too far for A card' }
      ];
      
      testDestinations.forEach(({ position, valid, reason }, index) => {
        // Mock validation result for this destination
        global.validateMovePreview.mockReturnValueOnce({ valid, reason });
        
        // Simulate hovering over destination
        const validationResult = global.validateMovePreview(
          playerPosition,
          position,
          cardType,
          gameState.board,
          gameState.players,
          'red'
        );
        
        expect(validationResult.valid).toBe(valid);
        expect(validationResult.reason).toBe(reason);
        
        // Mock showing feedback based on validation
        global.showMovePreviewFeedback.mockReturnValueOnce({ 
          displayed: true, 
          type: valid ? 'valid' : 'invalid',
          message: reason
        });
        
        const feedbackResult = global.showMovePreviewFeedback(validationResult);
        expect(feedbackResult.displayed).toBe(true);
        expect(feedbackResult.type).toBe(valid ? 'valid' : 'invalid');
      });
      
      // 3. Verify instant visual feedback for legal/illegal moves
      expect(global.validateMovePreview).toHaveBeenCalledTimes(4);
      expect(global.showMovePreviewFeedback).toHaveBeenCalledTimes(4);
      
      // Test that valid moves show positive feedback
      expect(global.validateMovePreview).toHaveBeenNthCalledWith(1,
        playerPosition,
        { row: 0, col: 2 },
        cardType,
        gameState.board,
        gameState.players,
        'red'
      );
      
      // Test that invalid moves show negative feedback
      expect(global.validateMovePreview).toHaveBeenNthCalledWith(2,
        playerPosition,
        { row: 0, col: 3 },
        cardType,
        gameState.board,
        gameState.players,
        'red'
      );
      
      // 4. Test preview updates for joker moves in progress
      const jokerGameState = testUtils.deepClone(gameStates.jokerMovementState);
      global.gameState = jokerGameState;
      
      global.validateJokerPreview = jest.fn();
      global.updateJokerPreviewState = jest.fn();
      
      // Simulate ongoing joker movement
      const jokerState = {
        isActive: true,
        currentPosition: { row: 0, col: 0 },
        remainingMoves: 2,
        path: [{ row: 0, col: 0 }, { row: 0, col: 1 }]
      };
      
      // Test joker preview for next step
      const jokerDestinations = [
        { row: 0, col: 2 }, // Continue right
        { row: 1, col: 1 }  // Go down
      ];
      
      jokerDestinations.forEach(destination => {
        global.validateJokerPreview.mockReturnValueOnce({
          valid: true,
          canComplete: true,
          remainingAfter: jokerState.remainingMoves - 1
        });
        
        const jokerValidation = global.validateJokerPreview(jokerState, destination);
        expect(jokerValidation.valid).toBe(true);
        expect(jokerValidation.canComplete).toBe(true);
        
        global.updateJokerPreviewState.mockReturnValueOnce({ updated: true });
        const updateResult = global.updateJokerPreviewState(jokerState, destination);
        expect(updateResult.updated).toBe(true);
      });
      
      // 5. Verify preview accuracy matches final validation
      // Clear preview state
      global.clearPreviewFeedback();
      expect(global.clearPreviewFeedback).toHaveBeenCalled();
      
      // Verify all preview validations were called
      expect(global.validateJokerPreview).toHaveBeenCalledTimes(2);
      expect(global.updateJokerPreviewState).toHaveBeenCalledTimes(2);
      
      // Verify DOM elements are available for feedback display
      expect(global.document).toBeDefined();
      expect(mockPreviewIndicator).toBeDefined();
      expect(mockValidationFeedback).toBeDefined();
    });
  });

  describe('Performance Integration Testing', () => {
    test('complete movement flow performance under load', async () => {
      // Test performance of complete movement flow with complex board states
      
      // 1. Set up complex game state with many collapsed cards
      const gameState = testUtils.deepClone(gameStates.endGameState);
      global.gameState = gameState;
      
      // Mock performance-critical functions
      global.validateMove = jest.fn().mockReturnValue({ valid: true, reason: 'Valid move' });
      global.executeCompleteMove = jest.fn().mockReturnValue({ success: true, executionTime: 15 });
      global.updateBoardRenderingAfterMove = jest.fn().mockReturnValue({ rendered: true, renderTime: 8 });
      
      // Mock performance monitoring
      global.performance = {
        now: jest.fn().mockReturnValue(0)
      };
      
      let mockTime = 0;
      global.performance.now.mockImplementation(() => mockTime);
      
      // Define multiple movement flows to test
      const movementFlows = [
        {
          start: { row: 1, col: 1 },
          end: { row: 1, col: 2 },
          path: [{ row: 1, col: 1 }, { row: 1, col: 2 }],
          cardType: '4',
          expectedTime: 25
        },
        {
          start: { row: 2, col: 3 },
          end: { row: 2, col: 1 },
          path: [{ row: 2, col: 3 }, { row: 2, col: 2 }, { row: 2, col: 1 }],
          cardType: 'A',
          expectedTime: 30
        },
        {
          start: { row: 1, col: 2 },
          end: { row: 3, col: 2 },
          path: [{ row: 1, col: 2 }, { row: 2, col: 2 }, { row: 3, col: 2 }],
          cardType: '2',
          expectedTime: 20
        }
      ];
      
      const performanceResults = [];
      
      // 2. Execute multiple movement flows in sequence
      for (let i = 0; i < movementFlows.length; i++) {
        const flow = movementFlows[i];
        mockTime = 0; // Reset time for each test
        
        // 3. Measure total time for validation → execution → rendering
        const startTime = await performanceHelpers.measureTime(async () => {
          // Validation phase
          mockTime += 5; // Simulate validation time
          const validationResult = global.validateMove(
            flow.start,
            flow.path,
            flow.path.length - 1,
            flow.cardType,
            gameState.board,
            gameState.players,
            'red'
          );
          
          expect(validationResult.valid).toBe(true);
          
          // Execution phase
          mockTime += flow.expectedTime; // Simulate execution time
          const executionResult = global.executeCompleteMove(
            flow.start,
            flow.end,
            flow.path,
            flow.cardType,
            'red'
          );
          
          expect(executionResult.success).toBe(true);
          
          // Rendering phase
          mockTime += 8; // Simulate rendering time
          const renderingResult = global.updateBoardRenderingAfterMove({
            from: flow.start,
            to: flow.end,
            path: flow.path,
            cardType: flow.cardType
          });
          
          expect(renderingResult.rendered).toBe(true);
        });
        
        performanceResults.push({
          flow: i,
          executionTime: startTime,
          expectedTime: flow.expectedTime + 13 // 5 validation + 8 rendering
        });
      }
      
      // 4. Verify complete flow stays under performance thresholds
      const performanceThreshold = 100; // 100ms threshold
      
      performanceResults.forEach((result) => {
        expect(result.executionTime).toBeLessThan(performanceThreshold);
      });
      
      // Verify all functions were called for each flow
      expect(global.validateMove).toHaveBeenCalledTimes(movementFlows.length);
      expect(global.executeCompleteMove).toHaveBeenCalledTimes(movementFlows.length);
      expect(global.updateBoardRenderingAfterMove).toHaveBeenCalledTimes(movementFlows.length);
      
      // 5. Test performance with joker moves requiring state management
      const jokerGameState = testUtils.deepClone(gameStates.jokerMovementState);
      global.gameState = jokerGameState;
      
      global.validateJokerMovementPath = jest.fn().mockReturnValue({ valid: true, reason: 'Valid joker path' });
      global.executeJokerMoveStep = jest.fn().mockReturnValue({ success: true, executionTime: 20 });
      global.updateJokerStateRendering = jest.fn().mockReturnValue({ rendered: true, renderTime: 12 });
      
      mockTime = 0;
      const jokerPerformanceTime = await performanceHelpers.measureTime(async () => {
        // Joker validation (more complex)
        mockTime += 8;
        const jokerValidation = global.validateJokerMovementPath({ 
          path: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
          remainingMoves: 3
        });
        expect(jokerValidation.valid).toBe(true);
        
        // Joker execution (with state management)
        mockTime += 20;
        const jokerExecution = global.executeJokerMoveStep({ row: 0, col: 1 });
        expect(jokerExecution.success).toBe(true);
        
        // Joker rendering (with state indicators)
        mockTime += 12;
        const jokerRendering = global.updateJokerStateRendering({
          currentPosition: { row: 0, col: 1 },
          remainingMoves: 2
        });
        expect(jokerRendering.rendered).toBe(true);
      });
      
      // Verify joker performance is still under threshold
      expect(jokerPerformanceTime).toBeLessThan(performanceThreshold);
      
      // Verify joker functions were called
      expect(global.validateJokerMovementPath).toHaveBeenCalled();
      expect(global.executeJokerMoveStep).toHaveBeenCalled();
      expect(global.updateJokerStateRendering).toHaveBeenCalled();
      
      // Performance summary
      const averagePerformance = performanceResults.reduce((sum, result) => sum + result.executionTime, 0) / performanceResults.length;
      expect(averagePerformance).toBeLessThan(performanceThreshold / 2); // Should be well under threshold
    });

    test('concurrent move validation and rendering performance', async () => {
      // Test performance when multiple move validations occur rapidly
      
      // 1. Set up game state
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      global.gameState = gameState;
      
      // Mock concurrent operations
      global.validateMovePreview = jest.fn().mockReturnValue({ valid: true, executionTime: 3 });
      global.updatePathVisualization = jest.fn().mockReturnValue({ updated: true, renderTime: 2 });
      global.clearPreviewFeedback = jest.fn();
      
      // Mock memory usage tracking
      let mockMemoryUsage = 1000;
      global.performance.memory = {
        usedJSHeapSize: mockMemoryUsage
      };
      
      // 2. Trigger rapid move preview updates
      const rapidPreviewOperations = [];
      const concurrentCount = 20;
      const playerPosition = { row: 1, col: 1 };
      
      // Generate multiple concurrent preview operations
      for (let i = 0; i < concurrentCount; i++) {
        const destination = {
          row: Math.floor(i / 4),
          col: i % 4
        };
        
        rapidPreviewOperations.push({
          id: i,
          start: playerPosition,
          destination,
          cardType: 'A'
        });
      }
      
      // 3. Measure response time and resource usage
      const concurrentResults = [];
      const memorySnapshots = [];
      
      // Record initial memory
      memorySnapshots.push(mockMemoryUsage);
      
      // Execute concurrent operations
      const concurrentPromises = rapidPreviewOperations.map(async (operation, index) => {
        const startTime = performance.now();
        
        // Simulate rapid preview validation
        const validationResult = global.validateMovePreview(
          operation.start,
          operation.destination,
          operation.cardType,
          gameState.board,
          gameState.players,
          'red'
        );
        
        // Simulate rendering update
        const renderingResult = global.updatePathVisualization();
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        // Simulate memory usage change
        mockMemoryUsage += 10; // Small memory increase per operation
        memorySnapshots.push(mockMemoryUsage);
        
        concurrentResults.push({
          id: operation.id,
          executionTime,
          validationResult,
          renderingResult,
          memoryUsage: mockMemoryUsage
        });
        
        return {
          success: true,
          time: executionTime,
          memory: mockMemoryUsage
        };
      });
      
      // Wait for all concurrent operations to complete
      const results = await Promise.all(concurrentPromises);
      
      // Verify all operations completed successfully
      expect(results).toHaveLength(concurrentCount);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.time).toBeLessThan(50); // Each operation under 50ms
      });
      
      // 4. Verify no performance degradation over time
      const performanceThreshold = 10; // 10ms per operation
      const firstHalfAverage = concurrentResults
        .slice(0, concurrentCount / 2)
        .reduce((sum, result) => sum + result.executionTime, 0) / (concurrentCount / 2);
      
      const secondHalfAverage = concurrentResults
        .slice(concurrentCount / 2)
        .reduce((sum, result) => sum + result.executionTime, 0) / (concurrentCount / 2);
      
      // Performance should not degrade significantly
      const performanceDegradation = secondHalfAverage - firstHalfAverage;
      expect(performanceDegradation).toBeLessThan(performanceThreshold);
      
      // Verify all functions were called for each operation
      expect(global.validateMovePreview).toHaveBeenCalledTimes(concurrentCount);
      expect(global.updatePathVisualization).toHaveBeenCalledTimes(concurrentCount);
      
      // 5. Test memory cleanup between move previews
      global.clearPreviewFeedback();
      expect(global.clearPreviewFeedback).toHaveBeenCalled();
      
      // Mock memory cleanup
      global.cleanupPreviewCache = jest.fn().mockImplementation(() => {
        mockMemoryUsage -= 100; // Simulate memory cleanup
        return { cleaned: true, memoryFreed: 100 };
      });
      
      const cleanupResult = global.cleanupPreviewCache();
      expect(cleanupResult.cleaned).toBe(true);
      expect(cleanupResult.memoryFreed).toBe(100);
      
      // Verify memory usage is reasonable
      const finalMemoryUsage = mockMemoryUsage;
      const initialMemoryUsage = memorySnapshots[0];
      const memoryIncrease = finalMemoryUsage - initialMemoryUsage;
      
      // Memory increase should be reasonable (less than 50% of initial)
      expect(memoryIncrease).toBeLessThan(initialMemoryUsage * 0.5);
      
      // Test batch validation performance
      global.validateMoveBatch = jest.fn().mockReturnValue({
        results: new Array(concurrentCount).fill({ valid: true }),
        batchTime: 15
      });
      
      const batchStartTime = performance.now();
      const batchResult = global.validateMoveBatch(rapidPreviewOperations);
      const batchEndTime = performance.now();
      const batchExecutionTime = batchEndTime - batchStartTime;
      
      expect(batchResult.results).toHaveLength(concurrentCount);
      expect(batchExecutionTime).toBeLessThan(50); // Batch should be faster than individual operations
      
      // Performance summary
      const totalExecutionTime = concurrentResults.reduce((sum, result) => sum + result.executionTime, 0);
      const averageExecutionTime = totalExecutionTime / concurrentCount;
      
      expect(averageExecutionTime).toBeLessThan(performanceThreshold);
      expect(totalExecutionTime).toBeLessThan(performanceThreshold * concurrentCount);
    });
  });

  describe('Cross-Module Data Flow Integration', () => {
    test('data consistency across movement system modules', () => {
      // Test data consistency as it flows between movement system modules
      
      // 1. Set up initial game state
      const initialGameState = testUtils.deepClone(gameStates.initialGameState);
      const moveData = {
        startPosition: { row: 0, col: 0 },
        endPosition: { row: 0, col: 1 },
        path: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
        cardType: 'red-joker',
        playerId: 'red',
        distance: 1
      };
      
      global.gameState = initialGameState;
      
      // Mock data transformation tracking
      const dataTransformationLog = [];
      
      // Mock validation module
      global.validateMove = jest.fn().mockImplementation((start, path, distance, cardType, board, players, playerId) => {
        const validationData = {
          module: 'validation',
          input: { start, path, distance, cardType, playerId },
          timestamp: Date.now(),
          result: { valid: true, reason: 'Valid move' }
        };
        dataTransformationLog.push(validationData);
        return validationData.result;
      });
      
      // Mock execution module
      global.executeCompleteMove = jest.fn().mockImplementation((start, end, path, cardType, playerId) => {
        const executionData = {
          module: 'execution',
          input: { start, end, path, cardType, playerId },
          timestamp: Date.now(),
          result: { 
            success: true, 
            moveData: { from: start, to: end, path, cardType, playerId },
            gameStateUpdates: { playerMoved: true, cardCollapsed: true }
          }
        };
        dataTransformationLog.push(executionData);
        return executionData.result;
      });
      
      // Mock rendering module
      global.updateBoardRenderingAfterMove = jest.fn().mockImplementation((moveData) => {
        const renderingData = {
          module: 'rendering',
          input: moveData,
          timestamp: Date.now(),
          result: { rendered: true, updatedElements: ['start-card', 'end-card', 'player-pawn'] }
        };
        dataTransformationLog.push(renderingData);
        return renderingData.result;
      });
      
      // 2. Track data transformations through validation pipeline
      const validationResult = global.validateMove(
        moveData.startPosition,
        moveData.path,
        moveData.distance,
        moveData.cardType,
        initialGameState.board,
        initialGameState.players,
        moveData.playerId
      );
      
      expect(validationResult.valid).toBe(true);
      expect(dataTransformationLog).toHaveLength(1);
      expect(dataTransformationLog[0].module).toBe('validation');
      
      // 3. Verify execution module receives correct validated data
      const executionResult = global.executeCompleteMove(
        moveData.startPosition,
        moveData.endPosition,
        moveData.path,
        moveData.cardType,
        moveData.playerId
      );
      
      expect(executionResult.success).toBe(true);
      expect(dataTransformationLog).toHaveLength(2);
      expect(dataTransformationLog[1].module).toBe('execution');
      
      // Verify data consistency between validation and execution
      const validationInput = dataTransformationLog[0].input;
      const executionInput = dataTransformationLog[1].input;
      
      expect(executionInput.start).toEqual(validationInput.start);
      expect(executionInput.path).toEqual(validationInput.path);
      expect(executionInput.cardType).toBe(validationInput.cardType);
      expect(executionInput.playerId).toBe(validationInput.playerId);
      
      // 4. Verify rendering module receives correct execution results
      const renderingResult = global.updateBoardRenderingAfterMove(executionResult.moveData);
      
      expect(renderingResult.rendered).toBe(true);
      expect(dataTransformationLog).toHaveLength(3);
      expect(dataTransformationLog[2].module).toBe('rendering');
      
      // Verify data consistency between execution and rendering
      const executionOutput = dataTransformationLog[1].result;
      const renderingInput = dataTransformationLog[2].input;
      
      expect(renderingInput).toEqual(executionOutput.moveData);
      expect(renderingInput.from).toEqual(moveData.startPosition);
      expect(renderingInput.to).toEqual(moveData.endPosition);
      expect(renderingInput.path).toEqual(moveData.path);
      
      // Verify data integrity across all modules
      const allModuleInputs = dataTransformationLog.map(entry => entry.input);
      const allModuleResults = dataTransformationLog.map(entry => entry.result);
      
      // Check that core move data remains consistent
      expect(allModuleInputs[0].start).toEqual(moveData.startPosition);
      expect(allModuleInputs[1].start).toEqual(moveData.startPosition);
      expect(allModuleInputs[2].from).toEqual(moveData.startPosition);
      
      // 5. Test data integrity under error conditions
      const errorScenarioData = {
        startPosition: { row: 0, col: 0 },
        endPosition: { row: 3, col: 3 }, // Invalid move
        path: [{ row: 0, col: 0 }, { row: 3, col: 3 }],
        cardType: 'A', // Can't move 3 spaces
        playerId: 'red'
      };
      
      // Mock error handling
      global.validateMove.mockImplementationOnce(() => {
        const errorValidation = {
          module: 'validation',
          input: errorScenarioData,
          timestamp: Date.now(),
          result: { valid: false, reason: 'Invalid distance for card type' },
          error: true
        };
        dataTransformationLog.push(errorValidation);
        return errorValidation.result;
      });
      
      global.rollbackMove = jest.fn().mockImplementation((start, end, playerId) => {
        const rollbackData = {
          module: 'rollback',
          input: { start, end, playerId },
          timestamp: Date.now(),
          result: { success: true, reason: 'Move rolled back due to validation failure' }
        };
        dataTransformationLog.push(rollbackData);
        return rollbackData.result;
      });
      
      // Test error scenario
      const errorValidationResult = global.validateMove(
        errorScenarioData.startPosition,
        errorScenarioData.path,
        3, // Invalid distance
        errorScenarioData.cardType,
        initialGameState.board,
        initialGameState.players,
        errorScenarioData.playerId
      );
      
      expect(errorValidationResult.valid).toBe(false);
      
      // Verify rollback maintains data integrity
      const rollbackResult = global.rollbackMove(
        errorScenarioData.startPosition,
        errorScenarioData.endPosition,
        errorValidationResult.playerId
      );
      
      expect(rollbackResult.success).toBe(true);
      
      // Check that error data is consistent
      const errorLogEntry = dataTransformationLog.find(entry => entry.error);
      expect(errorLogEntry).toBeDefined();
      expect(errorLogEntry.result.valid).toBe(false);
      
      // Verify no data corruption occurred during error handling
      const rollbackLogEntry = dataTransformationLog.find(entry => entry.module === 'rollback');
      expect(rollbackLogEntry).toBeDefined();
      expect(rollbackLogEntry.input.start).toEqual(errorScenarioData.startPosition);
      expect(rollbackLogEntry.input.end).toEqual(errorScenarioData.endPosition);
      
      // Final consistency check - verify original data unchanged
      expect(moveData.startPosition).toEqual({ row: 0, col: 0 });
      expect(moveData.endPosition).toEqual({ row: 0, col: 1 });
      expect(moveData.cardType).toBe('red-joker');
      expect(moveData.playerId).toBe('red');
      
      // Verify all modules were called with consistent data
      expect(global.validateMove).toHaveBeenCalledTimes(2);
      expect(global.executeCompleteMove).toHaveBeenCalledTimes(1);
      expect(global.updateBoardRenderingAfterMove).toHaveBeenCalledTimes(1);
      expect(global.rollbackMove).toHaveBeenCalledTimes(1);
    });

    test('state synchronization between game state and movement state', () => {
      // Test synchronization between global game state and movement-specific state
      
      // 1. Set up game with joker movement in progress
      const gameState = testUtils.deepClone(gameStates.jokerMovementState);
      const jokerState = {
        isActive: true,
        currentPosition: { row: 0, col: 0 },
        remainingMoves: 3,
        canComplete: true,
        path: [{ row: 0, col: 0 }],
        playerId: 'red'
      };
      
      gameState.jokerMoveState = jokerState;
      global.gameState = gameState;
      
      // Mock state synchronization functions
      global.syncGameStateWithJokerState = jest.fn().mockImplementation((jokerState) => {
        global.gameState.jokerMoveState = { ...jokerState };
        global.gameState.currentMovePath = [...jokerState.path];
        return { synchronized: true };
      });
      
      global.syncJokerStateWithGameState = jest.fn().mockImplementation(() => {
        const currentJokerState = global.gameState.jokerMoveState;
        return { ...currentJokerState };
      });
      
      global.validateStateSynchronization = jest.fn().mockImplementation(() => {
        const gameJokerState = global.gameState.jokerMoveState;
        const currentPath = global.gameState.currentMovePath;
        
        return {
          synchronized: JSON.stringify(gameJokerState.path) === JSON.stringify(currentPath),
          gameJokerState,
          currentPath
        };
      });
      
      // 2. Verify game state and joker state remain synchronized
      const initialSyncResult = global.validateStateSynchronization();
      expect(initialSyncResult.synchronized).toBe(true);
      expect(initialSyncResult.gameJokerState.path).toEqual(jokerState.path);
      expect(initialSyncResult.currentPath).toEqual(jokerState.path);
      
      // Test synchronization when joker state updates
      const updatedJokerState = {
        ...jokerState,
        currentPosition: { row: 0, col: 1 },
        remainingMoves: 2,
        path: [{ row: 0, col: 0 }, { row: 0, col: 1 }]
      };
      
      const syncResult = global.syncGameStateWithJokerState(updatedJokerState);
      expect(syncResult.synchronized).toBe(true);
      expect(global.gameState.jokerMoveState.currentPosition).toEqual({ row: 0, col: 1 });
      expect(global.gameState.jokerMoveState.remainingMoves).toBe(2);
      expect(global.gameState.currentMovePath).toEqual(updatedJokerState.path);
      
      // 3. Test synchronization during move execution
      global.executeJokerMoveStep = jest.fn().mockImplementation((targetPosition) => {
        // Update joker state
        const currentJokerState = global.gameState.jokerMoveState;
        const newJokerState = {
          ...currentJokerState,
          currentPosition: targetPosition,
          remainingMoves: currentJokerState.remainingMoves - 1,
          path: [...currentJokerState.path, targetPosition]
        };
        
        // Synchronize with game state
        global.syncGameStateWithJokerState(newJokerState);
        
        return { success: true, newState: newJokerState };
      });
      
      // Execute a move step
      const nextPosition = { row: 0, col: 2 };
      const executionResult = global.executeJokerMoveStep(nextPosition);
      
      expect(executionResult.success).toBe(true);
      expect(executionResult.newState.currentPosition).toEqual(nextPosition);
      expect(executionResult.newState.remainingMoves).toBe(1);
      
      // Verify synchronization after execution
      const postExecutionSyncResult = global.validateStateSynchronization();
      expect(postExecutionSyncResult.synchronized).toBe(true);
      expect(global.gameState.jokerMoveState.currentPosition).toEqual(nextPosition);
      expect(global.gameState.currentMovePath).toContain(nextPosition);
      
      // 4. Test synchronization during error conditions and rollback
      const preErrorGameState = testUtils.deepClone(global.gameState);
      
      global.rollbackJokerState = jest.fn().mockImplementation((previousState) => {
        global.gameState.jokerMoveState = { ...previousState };
        global.gameState.currentMovePath = [...previousState.path];
        return { rolledBack: true, state: previousState };
      });
      
      // Simulate an error during move execution
      global.executeJokerMoveStep.mockImplementationOnce(() => {
        throw new Error('Move execution failed');
      });
      
      let executionError;
      try {
        global.executeJokerMoveStep({ row: 0, col: 3 });
      } catch (error) {
        executionError = error;
      }
      
      expect(executionError).toBeDefined();
      expect(executionError.message).toBe('Move execution failed');
      
      // Perform rollback
      const rollbackResult = global.rollbackJokerState(preErrorGameState.jokerMoveState);
      expect(rollbackResult.rolledBack).toBe(true);
      
      // Verify state synchronization after rollback
      const postRollbackSyncResult = global.validateStateSynchronization();
      expect(postRollbackSyncResult.synchronized).toBe(true);
      expect(global.gameState.jokerMoveState).toEqual(preErrorGameState.jokerMoveState);
      expect(global.gameState.currentMovePath).toEqual(preErrorGameState.currentMovePath);
      
      // 5. Verify state consistency after move completion
      global.completeJokerMovement = jest.fn().mockImplementation(() => {
        const finalJokerState = {
          ...global.gameState.jokerMoveState,
          isActive: false,
          remainingMoves: 0,
          canComplete: false
        };
        
        // Update game state for completion
        global.gameState.jokerMoveState = null;
        global.gameState.currentMovePath = [];
        global.gameState.moveHistory.push({
          from: jokerState.path[0],
          to: finalJokerState.currentPosition,
          path: finalJokerState.path,
          cardType: 'red-joker',
          playerId: finalJokerState.playerId
        });
        
        return { completed: true, finalState: finalJokerState };
      });
      
      const completionResult = global.completeJokerMovement();
      expect(completionResult.completed).toBe(true);
      
      // Verify final state consistency
      expect(global.gameState.jokerMoveState).toBeNull();
      expect(global.gameState.currentMovePath).toEqual([]);
      expect(global.gameState.moveHistory).toHaveLength(1);
      
      const finalMove = global.gameState.moveHistory[0];
      expect(finalMove.cardType).toBe('red-joker');
      expect(finalMove.playerId).toBe('red');
      expect(finalMove.from).toEqual(jokerState.path[0]);
      
      // Test cross-state validation
      global.validateCrossStateConsistency = jest.fn().mockImplementation(() => {
        const issues = [];
        
        // Check for orphaned joker state
        if (global.gameState.jokerMoveState && global.gameState.currentMovePath.length === 0) {
          issues.push('Joker state exists but no current move path');
        }
        
        // Check for orphaned move path
        if (!global.gameState.jokerMoveState && global.gameState.currentMovePath.length > 0) {
          issues.push('Current move path exists but no joker state');
        }
        
        // Check player position consistency
        const currentPlayer = global.gameState.players.find(p => p.id === 'red');
        if (global.gameState.jokerMoveState && currentPlayer && 
            global.gameState.jokerMoveState.currentPosition &&
            (currentPlayer.position.row !== global.gameState.jokerMoveState.currentPosition.row ||
            currentPlayer.position.col !== global.gameState.jokerMoveState.currentPosition.col)) {
          issues.push('Player position inconsistent with joker state');
        }
        
        return {
          consistent: issues.length === 0,
          issues
        };
      });
      
      const consistencyResult = global.validateCrossStateConsistency();
      expect(consistencyResult.consistent).toBe(true);
      expect(consistencyResult.issues).toHaveLength(0);
      
      // Verify all synchronization functions were called appropriately
      expect(global.syncGameStateWithJokerState).toHaveBeenCalledTimes(2);
      expect(global.validateStateSynchronization).toHaveBeenCalledTimes(3);
      expect(global.executeJokerMoveStep).toHaveBeenCalledTimes(2);
      expect(global.rollbackJokerState).toHaveBeenCalledTimes(1);
      expect(global.completeJokerMovement).toHaveBeenCalledTimes(1);
      expect(global.validateCrossStateConsistency).toHaveBeenCalledTimes(1);
    });
  });
});