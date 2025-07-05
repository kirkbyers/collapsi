# Collapsi Testing Guide

This document outlines testing patterns, practices, and guidelines for the Collapsi game project.

## Overview

The Collapsi project uses Jest as its primary testing framework with a comprehensive test suite covering unit tests, integration tests, and coverage reporting. The testing strategy focuses on critical game logic while maintaining fast execution times.

## Test Structure

### Test Organization

```
js/                          # Source files with co-located unit tests
├── game.js
├── game.test.js
├── board.js
├── board.test.js
├── movement/
│   ├── core/
│   │   ├── card-movement.js
│   │   ├── card-movement.test.js
│   │   └── ...
│   └── ...
tests/                       # Integration tests and utilities
├── integration/
│   ├── movement/
│   ├── game-flow/
│   └── ui-integration/
└── utils/                   # Test utilities and helpers
    ├── test-helpers.js
    ├── game-fixtures.js
    ├── dom-mocks.js
    └── test-cleanup.js
```

### Test Types

1. **Unit Tests**: Test individual functions and modules in isolation
2. **Integration Tests**: Test interactions between multiple modules
3. **Performance Tests**: Verify execution times meet requirements (<100ms for movement validation)

## Testing Patterns

### 1. Unit Test Pattern

```javascript
// game.test.js example
const fs = require('fs');
const path = require('path');

// Load source code
const gameCode = fs.readFileSync(path.join(__dirname, 'game.js'), 'utf8');
eval(gameCode);

describe('Game Logic Tests', () => {
  beforeEach(() => {
    // Reset global state
    global.gameState = null;
  });

  test('should initialize new game correctly', () => {
    const result = initializeNewGame();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(16);
  });
});
```

### 2. Integration Test Pattern

```javascript
// Integration test example
import { assertions, testUtils } from '../../utils/test-helpers.js';
import { gameStates } from '../../utils/game-fixtures.js';

describe('Movement Integration Tests', () => {
  beforeEach(() => {
    setupTestEnvironment();
    jest.clearAllMocks();
  });

  test('complete movement flow', () => {
    const gameState = testUtils.deepClone(gameStates.initialGameState);
    // Test complete flow...
  });
});
```

### 3. Mock Strategy

#### DOM Mocking
```javascript
// Mock DOM elements for browser-dependent code
const mockElement = {
  querySelector: jest.fn(),
  addEventListener: jest.fn(),
  classList: {
    add: jest.fn(),
    remove: jest.fn()
  }
};

global.document = {
  getElementById: jest.fn(() => mockElement),
  querySelector: jest.fn(() => mockElement)
};
```

#### Function Mocking
```javascript
// Mock game functions
global.validateMove = jest.fn().mockReturnValue({ valid: true });
global.executeMove = jest.fn().mockReturnValue({ success: true });
```

## Test Utilities

### Test Helpers (`tests/utils/test-helpers.js`)

- **Assertions**: Standardized test assertions for game states
- **Performance Helpers**: Timing and performance measurement utilities
- **Mock Helpers**: Utilities for creating mock DOM elements and functions

### Game Fixtures (`tests/utils/game-fixtures.js`)

- **Game States**: Pre-configured game states for testing
- **Move Patterns**: Common movement patterns for validation testing
- **Board Configurations**: Various board setups for edge case testing

### Test Cleanup (`tests/utils/test-cleanup.js`)

- **Environment Setup**: Initialize test environment before each test
- **Cleanup**: Reset global state and clear mocks after tests

## Coverage Requirements

### Coverage Thresholds

- **Global Coverage**: 80% (lines, statements, branches, functions)
- **Critical Areas**: 90% coverage required
  - Movement system (`js/movement/**/*.js`)
  - Core game logic (`js/game.js`)

### Coverage Analysis

```bash
# Run coverage analysis
npm run test:coverage

# Generate HTML coverage report
npm run test:coverage-html
```

### Coverage Exclusions

Files excluded from coverage requirements:
- Test files (`*.test.js`)
- Test utilities (`tests/utils/`)
- UI files that depend heavily on DOM manipulation

## Test Scripts

### Available Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run movement system tests
npm run test:movement

# Run in watch mode
npm run test:watch

# CI-ready test run
npm run test:ci
```

### Performance Requirements

- **Full test suite**: Must complete in <5 seconds
- **Individual tests**: Should complete in <100ms for critical path tests
- **Parallel execution**: Configured to use 50% of available CPU cores

## Best Practices

### 1. Test Naming

Use descriptive test names that explain the behavior being tested:

```javascript
// Good
test('should return valid moves for player on A card with 1 space movement', () => {});

// Bad
test('test move validation', () => {});
```

### 2. Test Organization

Group related tests using `describe` blocks:

```javascript
describe('Movement Validation', () => {
  describe('Standard Card Movement', () => {
    test('should validate A card movement', () => {});
    test('should validate 2 card movement', () => {});
  });
  
  describe('Joker Movement', () => {
    test('should validate joker early completion', () => {});
  });
});
```

### 3. Test Data Management

Use factory functions and fixtures for consistent test data:

```javascript
// Use game fixtures
const gameState = testUtils.deepClone(gameStates.initialGameState);

// Create specific test scenarios
const boardWithCollapsedCards = factories.createBoardWithCollapsedCards([
  { row: 0, col: 0 },
  { row: 1, col: 1 }
]);
```

### 4. Error Testing

Test both success and failure scenarios:

```javascript
test('should handle invalid move gracefully', () => {
  const result = validateMove(invalidMove);
  expect(result.valid).toBe(false);
  expect(result.reason).toContain('Invalid');
});
```

### 5. Mock Verification

Verify that mocked functions are called with expected parameters:

```javascript
expect(global.executeMove).toHaveBeenCalledWith(
  expectedFromPosition,
  expectedToPosition,
  expectedPath
);
```

## Debugging Tests

### Common Issues

1. **Mock State**: Ensure mocks are reset between tests
2. **Global State**: Clear global variables in `beforeEach`
3. **Async Operations**: Use proper async/await patterns
4. **DOM Dependencies**: Mock DOM elements properly

### Debugging Tools

```javascript
// Add debug logging
console.log('Game state:', JSON.stringify(gameState, null, 2));

// Use Jest debugging
expect(result).toMatchSnapshot(); // For complex objects
```

## Continuous Integration

### CI Configuration

The test suite is configured for CI environments:

```bash
npm run test:ci
```

This command:
- Runs all tests with coverage
- Outputs coverage reports in CI-friendly format
- Exits with proper status codes
- Disables watch mode

### Coverage Reporting

Coverage reports are generated in multiple formats:
- **Text**: Console output for quick review
- **LCOV**: For CI integration
- **HTML**: Detailed visual reports

## Future Considerations

### Scaling Tests

As the codebase grows:
- Consider test sharding for large test suites
- Implement parallel test execution for integration tests
- Add visual regression testing for UI components

### Test Maintenance

- Regularly review and update test fixtures
- Remove obsolete tests when functionality changes
- Maintain test documentation alongside code changes

## Performance Benchmarks

Current test suite performance metrics:
- **Total execution time**: ~4.3 seconds
- **Test count**: 702 tests across 24 test suites
- **Coverage**: Varies by module (see coverage reports)

These metrics should be maintained or improved as the codebase evolves.