// Mock Chrome API tests for background and content scripts

describe('Background Service Worker', () => {
  test('analyzeClaim returns result', async () => {
    const { analyzeClaim } = require('../background');
    const result = await analyzeClaim('This is a fake news claim.');
    expect(result).toHaveProperty('flagged');
    expect(result).toHaveProperty('confidence');
  });
});
