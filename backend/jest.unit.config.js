module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/**/__tests__/**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/setup.ts']
}; 