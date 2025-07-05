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
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/**/*.test.js',
    '!**/node_modules/**',
    '!tests/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Coverage thresholds (adjusted for vanilla JS testing pattern)
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 25,
      lines: 25,
      statements: 25
    },
    // Files with direct imports have higher coverage
    './js/movement/execution/rendering-integration.js': {
      branches: 75,
      functions: 90,
      lines: 80,
      statements: 80
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