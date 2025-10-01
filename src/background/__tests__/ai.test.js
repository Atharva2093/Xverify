// Test cases for AI model inference with sample fake/real news texts

describe('AI Model Inference', () => {
  test('BERT model classifies fake news', async () => {
    const { analyzeClaim } = require('../background');
    const fakeClaim = 'The moon is made of cheese.';
    const realClaim = 'Water boils at 100 degrees Celsius.';
    const fakeResult = await analyzeClaim(fakeClaim);
    const realResult = await analyzeClaim(realClaim);
    expect(fakeResult.flagged).toBe(true);
    expect(realResult.flagged).toBe(false);
  });
});
