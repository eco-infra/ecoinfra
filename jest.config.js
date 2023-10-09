/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
};
