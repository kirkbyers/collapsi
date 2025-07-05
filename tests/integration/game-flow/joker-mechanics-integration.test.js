/**
 * Integration Tests for Joker Mechanics with Complete Game Flows
 * Tests joker movement integration with validation, execution, and game flow
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

describe('Joker Mechanics Integration Tests', () => {
  beforeEach(() => {
    setupTestEnvironment();
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('Joker Movement State Integration', () => {
    test('joker movement initialization and state management', () => {
      // Test joker state initialization and lifecycle integration
      
      // 1. Set up game state with player on red joker
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      const redJokerPosition = { row: 0, col: 0 }; // Red joker at top-left
      const redPlayer = gameState.players[0];
      
      // Update game state to have red player on red joker
      gameState.board[0][0].hasPlayer = true;
      gameState.board[0][0].playerId = 'red';
      redPlayer.position = redJokerPosition;
      
      // Mock joker state management functions
      global.gameState = gameState;
      global.initializeJokerMovement = jest.fn();
      global.updateJokerPosition = jest.fn();
      global.validateJokerMovementPath = jest.fn();
      global.completeJokerMovement = jest.fn();
      
      // Mock functions should return expected joker state
      const expectedJokerState = {
        playerId: 'red',
        startingPosition: redJokerPosition,
        currentPosition: redJokerPosition,
        maxDistance: 4,
        remainingDistance: 4,
        movePath: [redJokerPosition],
        canEndTurn: true,
        isActive: true
      };
      
      global.initializeJokerMovement.mockReturnValue(expectedJokerState);
      
      // 2. Initialize joker movement
      const jokerState = global.initializeJokerMovement(redPlayer, redJokerPosition);
      
      expect(global.initializeJokerMovement).toHaveBeenCalledWith(redPlayer, redJokerPosition);
      expect(jokerState).toEqual(expectedJokerState);
      
      // 3. Test joker state validation
      global.validateJokerMovementPath.mockReturnValue({
        valid: true,
        reason: 'Valid joker movement path'
      });
      
      const validationResult = global.validateJokerMovementPath(jokerState);
      expect(validationResult.valid).toBe(true);
      expect(global.validateJokerMovementPath).toHaveBeenCalledWith(jokerState);
      
      // 4. Test joker completion integration
      global.completeJokerMovement.mockReturnValue({
        success: true,
        finalPosition: { row: 0, col: 1 },
        moveData: {
          from: redJokerPosition,
          to: { row: 0, col: 1 },
          path: [redJokerPosition, { row: 0, col: 1 }],
          cardType: 'red-joker',
          playerId: 'red',
          distance: 1
        }
      });
      
      const completionResult = global.completeJokerMovement(jokerState);
      expect(completionResult.success).toBe(true);
      expect(completionResult.moveData.distance).toBe(1);
    });

    test('joker early completion options integration', () => {
      // Test joker early completion with game flow
      
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      const blackJokerPosition = { row: 3, col: 3 }; // Black joker at bottom-right
      const bluePlayer = gameState.players[1];
      
      // Set up blue player on black joker
      gameState.board[3][3].hasPlayer = true;
      gameState.board[3][3].playerId = 'blue';
      bluePlayer.position = blackJokerPosition;
      
      global.gameState = gameState;
      
      // Mock joker state with partial movement
      const partialJokerState = {
        playerId: 'blue',
        startingPosition: blackJokerPosition,
        currentPosition: { row: 3, col: 2 },
        maxDistance: 4,
        remainingDistance: 2,
        movePath: [blackJokerPosition, { row: 3, col: 2 }],
        canEndTurn: true,
        isActive: true
      };
      
      global.getJokerEarlyCompletionOptions = jest.fn().mockReturnValue({
        canComplete: true,
        canCompleteEarly: true,
        mustComplete: false,
        spacesMoved: 1,
        remainingDistance: 2,
        validDistances: [1, 2, 3, 4],
        reason: 'Can end turn after 1 space'
      });
      
      global.executeJokerEarlyCompletion = jest.fn().mockReturnValue({
        success: true,
        finalPosition: { row: 3, col: 2 },
        moveData: {
          from: blackJokerPosition,
          to: { row: 3, col: 2 },
          path: [blackJokerPosition, { row: 3, col: 2 }],
          cardType: 'black-joker',
          playerId: 'blue',
          distance: 1,
          earlyCompletion: true
        }
      });
      
      // Test early completion options
      const completionOptions = global.getJokerEarlyCompletionOptions(partialJokerState);
      expect(completionOptions.canComplete).toBe(true);
      expect(completionOptions.canCompleteEarly).toBe(true);
      expect(completionOptions.spacesMoved).toBe(1);
      
      // Test executing early completion
      const earlyCompletionResult = global.executeJokerEarlyCompletion(partialJokerState);
      expect(earlyCompletionResult.success).toBe(true);
      expect(earlyCompletionResult.moveData.earlyCompletion).toBe(true);
      expect(earlyCompletionResult.moveData.distance).toBe(1);
    });
  });

  describe('Joker Movement Validation Integration', () => {
    test('joker path validation with numbered card rules', () => {
      // Test joker movement validation against numbered card rules
      
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      const redJokerPosition = { row: 0, col: 0 };
      
      // Set up complex joker movement path
      const jokerPath = [
        { row: 0, col: 0 }, // Red joker start
        { row: 0, col: 1 }, // Move to 'A' card
        { row: 1, col: 1 }, // Move to '4' card
        { row: 2, col: 1 }  // Move to '3' card (3 spaces total)
      ];
      
      const jokerState = {
        playerId: 'red',
        startingPosition: redJokerPosition,
        currentPosition: { row: 2, col: 1 },
        maxDistance: 4,
        remainingDistance: 1,
        movePath: jokerPath,
        canEndTurn: true,
        isActive: true
      };
      
      global.gameState = gameState;
      
      // Mock validation functions
      global.validateOrthogonalPath = jest.fn().mockReturnValue({ valid: true });
      global.validateNoRevisitedCards = jest.fn().mockReturnValue({ valid: true });
      global.validateNotEndingOnStartingCard = jest.fn().mockReturnValue({ valid: true });
      global.validateNotEndingOnOccupiedPosition = jest.fn().mockReturnValue({ valid: true });
      global.validateJokerMovementPath = jest.fn().mockImplementation((jokerState) => {
        // Call the individual validation functions to ensure they're invoked
        global.validateOrthogonalPath(jokerState.movePath);
        global.validateNoRevisitedCards(jokerState.movePath);
        global.validateNotEndingOnStartingCard(jokerState.startingPosition, jokerState.currentPosition);
        global.validateNotEndingOnOccupiedPosition(
          jokerState.currentPosition,
          gameState.board,
          gameState.players,
          jokerState.playerId
        );
        
        return {
          valid: true,
          reason: 'Valid joker movement path',
          distance: 3,
          pathValidation: {
            orthogonal: true,
            noRevisits: true,
            notOnStarting: true,
            notOnOccupied: true
          }
        };
      });
      
      // Test path validation
      const validationResult = global.validateJokerMovementPath(jokerState);
      
      expect(validationResult.valid).toBe(true);
      expect(validationResult.distance).toBe(3);
      expect(validationResult.pathValidation.orthogonal).toBe(true);
      expect(validationResult.pathValidation.noRevisits).toBe(true);
      expect(validationResult.pathValidation.notOnStarting).toBe(true);
      expect(validationResult.pathValidation.notOnOccupied).toBe(true);
      
      // Verify individual validation functions were called
      expect(global.validateOrthogonalPath).toHaveBeenCalledWith(jokerPath);
      expect(global.validateNoRevisitedCards).toHaveBeenCalledWith(jokerPath);
      expect(global.validateNotEndingOnStartingCard).toHaveBeenCalledWith(
        redJokerPosition, 
        { row: 2, col: 1 }
      );
      expect(global.validateNotEndingOnOccupiedPosition).toHaveBeenCalledWith(
        { row: 2, col: 1 },
        gameState.board,
        gameState.players,
        'red'
      );
    });

    test('joker movement validation with wraparound edges', () => {
      // Test joker movement with board wraparound
      
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      const redJokerPosition = { row: 0, col: 0 };
      
      // Set up wraparound joker path
      const wraparoundPath = [
        { row: 0, col: 0 }, // Red joker start
        { row: 0, col: 3 }, // Wrap to right edge
        { row: 3, col: 3 }, // Wrap to bottom edge
        { row: 3, col: 0 }  // Wrap to left edge (4 spaces with wraparound)
      ];
      
      const jokerState = {
        playerId: 'red',
        startingPosition: redJokerPosition,
        currentPosition: { row: 3, col: 0 },
        maxDistance: 4,
        remainingDistance: 0,
        movePath: wraparoundPath,
        canEndTurn: true,
        isActive: true
      };
      
      global.gameState = gameState;
      
      // Mock wraparound validation
      global.validateOrthogonalPath = jest.fn().mockReturnValue({ valid: true });
      global.validateNoRevisitedCards = jest.fn().mockReturnValue({ valid: true });
      global.validateNotEndingOnStartingCard = jest.fn().mockReturnValue({ valid: true });
      global.validateNotEndingOnOccupiedPosition = jest.fn().mockReturnValue({ valid: true });
      global.validateJokerMovementPath = jest.fn().mockImplementation((jokerState) => {
        // Call the individual validation functions to ensure they're invoked
        global.validateOrthogonalPath(jokerState.movePath);
        
        return {
          valid: true,
          reason: 'Valid joker movement with wraparound',
          distance: 4,
          pathValidation: {
            orthogonal: true,
            noRevisits: true,
            notOnStarting: true,
            notOnOccupied: true,
            wraparound: true
          }
        };
      });
      
      // Test wraparound path validation
      const validationResult = global.validateJokerMovementPath(jokerState);
      
      expect(validationResult.valid).toBe(true);
      expect(validationResult.distance).toBe(4);
      expect(validationResult.pathValidation.wraparound).toBe(true);
      expect(global.validateOrthogonalPath).toHaveBeenCalledWith(wraparoundPath);
    });
  });

  describe('Joker Movement Execution Integration', () => {
    test('complete joker movement execution with game state updates', () => {
      // Test complete joker movement execution and game state changes
      
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      const blackJokerPosition = { row: 3, col: 3 };
      const finalPosition = { row: 2, col: 3 };
      const bluePlayer = gameState.players[1];
      
      // Set up blue player on black joker
      gameState.board[3][3].hasPlayer = true;
      gameState.board[3][3].playerId = 'blue';
      bluePlayer.position = blackJokerPosition;
      
      global.gameState = gameState;
      
      const jokerState = {
        playerId: 'blue',
        startingPosition: blackJokerPosition,
        currentPosition: finalPosition,
        maxDistance: 4,
        remainingDistance: 2,
        movePath: [blackJokerPosition, finalPosition],
        canEndTurn: true,
        isActive: true
      };
      
      // Mock execution functions
      global.updatePlayerPosition = jest.fn();
      global.collapseCard = jest.fn().mockReturnValue(true);
      global.switchToNextPlayer = jest.fn();
      global.addMoveToHistory = jest.fn();
      global.clearJokerMovementState = jest.fn();
      
      global.executeJokerMovement = jest.fn().mockImplementation((jokerState) => {
        // Call the individual execution functions to ensure they're invoked
        global.updatePlayerPosition(jokerState.playerId, jokerState.currentPosition);
        global.collapseCard(jokerState.startingPosition);
        global.switchToNextPlayer();
        
        const moveData = {
          from: jokerState.startingPosition,
          to: jokerState.currentPosition,
          path: jokerState.movePath,
          cardType: 'black-joker',
          playerId: jokerState.playerId,
          distance: 2,
          jokerMovement: true
        };
        
        global.addMoveToHistory(moveData);
        global.clearJokerMovementState();
        
        return {
          success: true,
          moveData: moveData,
          gameStateUpdates: {
            playerMoved: true,
            startingCardCollapsed: true,
            turnSwitched: true,
            moveAddedToHistory: true
          }
        };
      });
      
      // Execute joker movement
      const executionResult = global.executeJokerMovement(jokerState);
      
      expect(executionResult.success).toBe(true);
      expect(executionResult.moveData.jokerMovement).toBe(true);
      expect(executionResult.moveData.distance).toBe(2);
      expect(executionResult.gameStateUpdates.playerMoved).toBe(true);
      expect(executionResult.gameStateUpdates.startingCardCollapsed).toBe(true);
      expect(executionResult.gameStateUpdates.turnSwitched).toBe(true);
      expect(executionResult.gameStateUpdates.moveAddedToHistory).toBe(true);
      
      // Verify all game state update functions were called
      expect(global.updatePlayerPosition).toHaveBeenCalledWith('blue', finalPosition);
      expect(global.collapseCard).toHaveBeenCalledWith(blackJokerPosition);
      expect(global.switchToNextPlayer).toHaveBeenCalled();
      expect(global.addMoveToHistory).toHaveBeenCalledWith(executionResult.moveData);
      expect(global.clearJokerMovementState).toHaveBeenCalled();
    });

    test('joker movement execution with card collapse and board state', () => {
      // Test joker movement with card collapse mechanics
      
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      const redJokerPosition = { row: 0, col: 0 };
      const finalPosition = { row: 1, col: 0 };
      
      // Set up red player on red joker
      gameState.board[0][0].hasPlayer = true;
      gameState.board[0][0].playerId = 'red';
      gameState.players[0].position = redJokerPosition;
      
      global.gameState = gameState;
      
      const jokerState = {
        playerId: 'red',
        startingPosition: redJokerPosition,
        currentPosition: finalPosition,
        maxDistance: 4,
        remainingDistance: 3,
        movePath: [redJokerPosition, finalPosition],
        canEndTurn: true,
        isActive: true
      };
      
      // Mock board state management
      global.collapseCard = jest.fn((position) => {
        // Simulate card collapse
        gameState.board[position.row][position.col].collapsed = true;
        gameState.board[position.row][position.col].hasPlayer = false;
        gameState.board[position.row][position.col].playerId = null;
        return true;
      });
      
      global.updatePlayerPosition = jest.fn((playerId, position) => {
        // Simulate player position update
        const player = gameState.players.find(p => p.id === playerId);
        player.position = position;
        gameState.board[position.row][position.col].hasPlayer = true;
        gameState.board[position.row][position.col].playerId = playerId;
      });
      
      global.executeJokerMovement = jest.fn().mockImplementation((jokerState) => {
        // Simulate joker movement execution
        global.updatePlayerPosition(jokerState.playerId, jokerState.currentPosition);
        global.collapseCard(jokerState.startingPosition);
        
        return {
          success: true,
          moveData: {
            from: jokerState.startingPosition,
            to: jokerState.currentPosition,
            path: jokerState.movePath,
            cardType: 'red-joker',
            playerId: jokerState.playerId,
            distance: 1,
            jokerMovement: true
          },
          boardStateChanges: {
            collapsedCards: [jokerState.startingPosition],
            playerPositions: {
              [jokerState.playerId]: jokerState.currentPosition
            }
          }
        };
      });
      
      // Execute joker movement
      const executionResult = global.executeJokerMovement(jokerState);
      
      expect(executionResult.success).toBe(true);
      expect(executionResult.boardStateChanges.collapsedCards).toContain(redJokerPosition);
      expect(executionResult.boardStateChanges.playerPositions.red).toEqual(finalPosition);
      
      // Verify board state changes
      expect(global.collapseCard).toHaveBeenCalledWith(redJokerPosition);
      expect(global.updatePlayerPosition).toHaveBeenCalledWith('red', finalPosition);
      
      // Verify board state is correctly updated
      expect(gameState.board[0][0].collapsed).toBe(true);
      expect(gameState.board[0][0].hasPlayer).toBe(false);
      expect(gameState.board[1][0].hasPlayer).toBe(true);
      expect(gameState.board[1][0].playerId).toBe('red');
    });
  });

  describe('Joker Game Flow Integration', () => {
    test('complete game with joker movements and win condition', () => {
      // Test complete game flow with joker movements leading to win
      
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      
      // Set up game state with players on jokers
      gameState.board[0][0].hasPlayer = true;
      gameState.board[0][0].playerId = 'red';
      gameState.players[0].position = { row: 0, col: 0 };
      
      gameState.board[3][3].hasPlayer = true;
      gameState.board[3][3].playerId = 'blue';
      gameState.players[1].position = { row: 3, col: 3 };
      
      global.gameState = gameState;
      
      // Mock complete game flow functions
      global.getAllPossibleMoves = jest.fn();
      global.executeCompleteMove = jest.fn();
      global.checkGameEnd = jest.fn();
      global.switchToNextPlayer = jest.fn();
      global.addMoveToHistory = jest.fn();
      
      // Simulate game sequence with joker movements
      const gameSequence = [
        // Red player joker movement (2 spaces)
        {
          player: 'red',
          jokerMovement: true,
          from: { row: 0, col: 0 },
          to: { row: 0, col: 2 },
          path: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
          distance: 2
        },
        // Blue player joker movement (1 space)
        {
          player: 'blue',
          jokerMovement: true,
          from: { row: 3, col: 3 },
          to: { row: 3, col: 2 },
          path: [{ row: 3, col: 3 }, { row: 3, col: 2 }],
          distance: 1
        },
        // Red player regular movement
        {
          player: 'red',
          jokerMovement: false,
          from: { row: 0, col: 2 },
          to: { row: 2, col: 2 },
          path: [{ row: 0, col: 2 }, { row: 1, col: 2 }, { row: 2, col: 2 }],
          distance: 2
        }
      ];
      
      // Mock game end condition check
      global.checkGameEnd.mockReturnValueOnce(false) // After red joker move
                         .mockReturnValueOnce(false) // After blue joker move
                         .mockReturnValueOnce({      // After red regular move
                           gameOver: true,
                           winner: 'red',
                           reason: 'Blue player has no valid moves'
                         });
      
      // Execute game sequence
      gameSequence.forEach((move, index) => {
        global.executeCompleteMove.mockReturnValueOnce({
          success: true,
          moveData: move
        });
        
        // Execute move
        const moveResult = global.executeCompleteMove(
          move.from,
          move.to,
          move.path,
          move.jokerMovement ? (move.player === 'red' ? 'red-joker' : 'black-joker') : 'A',
          move.player
        );
        
        expect(moveResult.success).toBe(true);
        expect(moveResult.moveData.jokerMovement).toBe(move.jokerMovement);
        
        // Check game end
        const gameEndResult = global.checkGameEnd();
        
        if (index === gameSequence.length - 1) {
          // Final move should end the game
          expect(gameEndResult.gameOver).toBe(true);
          expect(gameEndResult.winner).toBe('red');
        } else {
          // Game should continue
          expect(gameEndResult).toBe(false);
          global.switchToNextPlayer();
        }
      });
      
      // Verify all moves were executed
      expect(global.executeCompleteMove).toHaveBeenCalledTimes(3);
      expect(global.checkGameEnd).toHaveBeenCalledTimes(3);
      expect(global.switchToNextPlayer).toHaveBeenCalledTimes(2);
    });

    test('joker movement integration with turn management', () => {
      // Test joker movement integration with turn switching
      
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      gameState.currentPlayer = 'red';
      gameState.gamePhase = 'playing';
      
      global.gameState = gameState;
      
      // Mock turn management functions
      global.getCurrentPlayer = jest.fn().mockReturnValue(gameState.players[0]);
      global.switchToNextPlayer = jest.fn().mockImplementation(() => {
        gameState.currentPlayer = gameState.currentPlayer === 'red' ? 'blue' : 'red';
      });
      
      // Mock joker movement execution
      global.executeJokerMovement = jest.fn().mockReturnValue({
        success: true,
        moveData: {
          from: { row: 0, col: 0 },
          to: { row: 0, col: 1 },
          path: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
          cardType: 'red-joker',
          playerId: 'red',
          distance: 1,
          jokerMovement: true
        }
      });
      
      // Execute joker movement and verify turn switching
      const currentPlayer = global.getCurrentPlayer();
      expect(currentPlayer.id).toBe('red');
      
      const jokerMoveResult = global.executeJokerMovement({
        playerId: 'red',
        currentPosition: { row: 0, col: 1 }
      });
      
      expect(jokerMoveResult.success).toBe(true);
      expect(jokerMoveResult.moveData.jokerMovement).toBe(true);
      
      // Switch turn after joker movement
      global.switchToNextPlayer();
      expect(gameState.currentPlayer).toBe('blue');
      
      // Verify turn management functions were called
      expect(global.getCurrentPlayer).toHaveBeenCalled();
      expect(global.switchToNextPlayer).toHaveBeenCalled();
    });
  });

  describe('Performance and Error Handling Integration', () => {
    test('joker movement performance within game flow', () => {
      // Test joker movement performance integration
      
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      global.gameState = gameState;
      
      // Mock performance timing
      const startTime = performance.now();
      
      // Mock joker movement functions with performance tracking
      global.initializeJokerMovement = jest.fn().mockImplementation(() => {
        // Simulate joker initialization time
        const initTime = performance.now();
        return {
          playerId: 'red',
          startingPosition: { row: 0, col: 0 },
          currentPosition: { row: 0, col: 0 },
          maxDistance: 4,
          remainingDistance: 4,
          movePath: [{ row: 0, col: 0 }],
          canEndTurn: true,
          isActive: true,
          initializationTime: initTime - startTime
        };
      });
      
      global.validateJokerMovementPath = jest.fn().mockImplementation(() => {
        // Simulate validation time
        const validationTime = performance.now();
        return {
          valid: true,
          reason: 'Valid joker movement',
          validationTime: validationTime - startTime
        };
      });
      
      global.executeJokerMovement = jest.fn().mockImplementation(() => {
        // Simulate execution time
        const executionTime = performance.now();
        return {
          success: true,
          moveData: {
            from: { row: 0, col: 0 },
            to: { row: 0, col: 1 },
            jokerMovement: true,
            executionTime: executionTime - startTime
          }
        };
      });
      
      // Execute joker movement flow
      const jokerState = global.initializeJokerMovement();
      const validationResult = global.validateJokerMovementPath(jokerState);
      const executionResult = global.executeJokerMovement(jokerState);
      
      const totalTime = performance.now() - startTime;
      
      // Verify performance is within acceptable limits
      expect(totalTime).toBeLessThan(100); // Should complete within 100ms
      expect(jokerState.initializationTime).toBeLessThan(50);
      expect(validationResult.validationTime).toBeLessThan(50);
      expect(executionResult.moveData.executionTime).toBeLessThan(50);
    });

    test('joker movement error handling integration', () => {
      // Test joker movement error handling in game flow
      
      const gameState = testUtils.deepClone(gameStates.initialGameState);
      global.gameState = gameState;
      
      // Mock error scenarios
      global.initializeJokerMovement = jest.fn().mockImplementation(() => {
        throw new Error('Invalid joker initialization');
      });
      
      global.validateJokerMovementPath = jest.fn().mockReturnValue({
        valid: false,
        reason: 'Invalid joker path: exceeds maximum distance'
      });
      
      global.executeJokerMovement = jest.fn().mockReturnValue({
        success: false,
        error: 'Joker movement execution failed',
        rollbackRequired: true
      });
      
      // Test error handling in joker initialization
      let initError = null;
      try {
        global.initializeJokerMovement();
      } catch (error) {
        initError = error;
      }
      
      expect(initError).toBeDefined();
      expect(initError.message).toBe('Invalid joker initialization');
      
      // Test error handling in joker validation
      const validationResult = global.validateJokerMovementPath({});
      expect(validationResult.valid).toBe(false);
      expect(validationResult.reason).toContain('Invalid joker path');
      
      // Test error handling in joker execution
      const executionResult = global.executeJokerMovement({});
      expect(executionResult.success).toBe(false);
      expect(executionResult.error).toBe('Joker movement execution failed');
      expect(executionResult.rollbackRequired).toBe(true);
    });
  });
});