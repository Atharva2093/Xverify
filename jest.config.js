module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'jsx'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^chrome$': '<rootDir>/jest.chrome.mock.js'
  }
};
