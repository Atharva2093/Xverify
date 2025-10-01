// API integration tests with mock responses

describe('FactCheck API', () => {
  test('searchFactCheck returns results', async () => {
    const { searchFactCheck } = require('../factcheck-api');
    const result = await searchFactCheck('COVID-19 vaccine causes microchips');
    expect(result).toHaveProperty('results');
    expect(Array.isArray(result.results)).toBe(true);
  });
});
