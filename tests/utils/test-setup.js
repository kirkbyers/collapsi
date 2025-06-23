/**
 * Jest test setup file
 * Runs before all tests to configure the test environment
 */

// Mock localStorage for all tests
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(() => null),
    removeItem: jest.fn(() => null),
    clear: jest.fn(() => null),
  },
  writable: true,
});

// Mock sessionStorage for all tests
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(() => null),
    removeItem: jest.fn(() => null),
    clear: jest.fn(() => null),
  },
  writable: true,
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment the following lines to suppress console output in tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Add custom Jest matchers if needed
expect.extend({
  // Example custom matcher - can be removed if not needed
  toBeValidMove(received) {
    const pass = received && typeof received === 'object' && 
                 'from' in received && 'to' in received;
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid move`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid move with 'from' and 'to' properties`,
        pass: false,
      };
    }
  },
});

// Global test timeout (5 seconds to meet performance requirements)
jest.setTimeout(5000);

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset localStorage mocks if they exist
  if (window.localStorage && window.localStorage.getItem && window.localStorage.getItem.mockReset) {
    window.localStorage.getItem.mockReset();
    window.localStorage.setItem.mockReset();
    window.localStorage.removeItem.mockReset();
    window.localStorage.clear.mockReset();
  }
  
  // Reset sessionStorage mocks if they exist
  if (window.sessionStorage && window.sessionStorage.getItem && window.sessionStorage.getItem.mockReset) {
    window.sessionStorage.getItem.mockReset();
    window.sessionStorage.setItem.mockReset();
    window.sessionStorage.removeItem.mockReset();
    window.sessionStorage.clear.mockReset();
  }
});