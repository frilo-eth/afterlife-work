const nextJest = require('next/jest')

// next/jest wires up the SWC transform, tsconfig path aliases, and env loading,
// so TypeScript tests run without a separate babel or ts-jest setup.
const createJestConfig = nextJest({ dir: './' })

module.exports = createJestConfig({
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
})
