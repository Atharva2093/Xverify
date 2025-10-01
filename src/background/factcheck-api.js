// Xverify FactCheck API Integration
// ES6, async/await, error handling

const FACTCHECK_API_URL = 'https://factchecktools.googleapis.com/v1alpha1/claims:search';
const RATE_LIMIT = 10; // max requests per minute
let requestCount = 0;
let lastReset = Date.now();
let cache = {};

// Get API key from environment (manifest or injected)
function getApiKey() {
  // In production, use chrome.storage or env injection
  return process.env.FACTCHECK_API_KEY || '';
}

// Rate limiting
function canRequest() {
  const now = Date.now();
  if (now - lastReset > 60000) {
    requestCount = 0;
    lastReset = now;
  }
  return requestCount < RATE_LIMIT;
}

// Cache results in Chrome storage
function cacheResult(claim, result) {
  cache[claim] = result;
  chrome.storage.local.set({ factcheck_cache: cache });
}

function getCachedResult(claim) {
  return cache[claim] || null;
}

// Search FactCheck API
async function searchFactCheck(claim) {
  if (!canRequest()) {
    return { error: 'Rate limit exceeded', results: [] };
  }
  const cached = getCachedResult(claim);
  if (cached) return cached;
  const apiKey = getApiKey();
  if (!apiKey) return { error: 'API key missing', results: [] };
  try {
    const url = `${FACTCHECK_API_URL}?query=${encodeURIComponent(claim)}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const results = (data.claims || []).map(item => ({
      claimant: item.claimant,
      text: item.text,
      rating: item.claimReview?.[0]?.textualRating || 'Unrated',
      source: item.claimReview?.[0]?.url || '',
    }));
    cacheResult(claim, { results });
    requestCount++;
    return { results };
  } catch (err) {
    console.error('FactCheck API error:', err);
    return { error: 'API unavailable', results: [] };
  }
}

// Parse ClaimReview schema from webpage metadata
function parseClaimReviewMeta() {
  const metas = document.querySelectorAll('script[type="application/ld+json"]');
  let claimReviews = [];
  metas.forEach(meta => {
    try {
      const json = JSON.parse(meta.textContent);
      if (json['@type'] === 'ClaimReview') claimReviews.push(json);
      if (Array.isArray(json)) {
        json.forEach(j => {
          if (j['@type'] === 'ClaimReview') claimReviews.push(j);
        });
      }
    } catch (err) {}
  });
  return claimReviews;
}

export { searchFactCheck, parseClaimReviewMeta };
