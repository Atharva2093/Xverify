// Jest unit tests for text extraction logic
const { extractVisibleText, splitClaims } = require('../content/content');

describe('Text Extraction', () => {
  test('extractVisibleText returns string', () => {
    document.body.innerHTML = '<div>Test sentence. Another one!</div>';
    expect(typeof extractVisibleText()).toBe('string');
  });

  test('splitClaims splits sentences', () => {
    const text = 'Fake news is dangerous. Real news is important!';
    const claims = splitClaims(text);
    expect(claims.length).toBeGreaterThan(0);
    expect(claims[0]).toContain('Fake news');
  });
});
