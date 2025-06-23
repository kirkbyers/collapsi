/** @type {import('jest').Config} */
module.exports = {
  // Test environment configuration
  testEnvironment: 'jsdom',
  
  // ES6+ module transformation
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  
  // Module file extensions Jest will recognize
  moduleFileExtensions: ['js', 'json'],
  
  // Test file patterns
  testMatch: [
    '**/*.test.js',
    '**/tests/**/*.js'
  ],
  
  // Files to ignore during testing
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/utils/',
    '/.git/'
  ],
  
  // Setup files to run before tests
  setupFilesAfterEnv: [
    '<rootDir>/tests/utils/test-setup.js'
  ],
  
  // Coverage configuration
  collectCoverage: false, // Enable with --coverage flag
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Coverage thresholds (as per PRD requirements)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Critical areas require higher coverage
    './js/movement/**/*.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './js/game.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // Mock configuration
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Module mocking
  moduleNameMapper: {
    // Mock CSS imports (if any get added later)
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  
  // Performance optimization
  maxWorkers: '50%', // Use half of available CPU cores
  
  // Verbose output for debugging
  verbose: false,
  
  // Global setup/teardown
  globalSetup: undefined,
  globalTeardown: undefined,
  
  // Browser-like globals
  testEnvironmentOptions: {
    // JSDOM configuration
    html: '<!DOCTYPE html><html><head></head><body></body></html>',
    url: 'http://localhost',
    userAgent: 'node.js'
  }
};