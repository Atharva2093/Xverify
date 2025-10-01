// Mock Chrome APIs for Jest
window.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    },
    lastError: null,
    openOptionsPage: jest.fn()
  },
  storage: {
    sync: {
      set: jest.fn(),
      get: jest.fn()
    },
    local: {
      set: jest.fn(),
      get: jest.fn()
    }
  }
};
