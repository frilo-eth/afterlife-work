module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1'
    },
    testMatch: ['**/__tests__/**/*.test.[jt]s?(x)']
  }