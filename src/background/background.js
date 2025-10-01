// Xverify Background Service Worker: AI Integration
// ES6, async/await, error handling

import { pipeline } from '@xenova/transformers';

let bertModel = null;
let modelLoaded = false;
let modelLoadPromise = null;
let queue = [];
let processing = false;
const MODEL_ID = 'distilbert-base-uncased-finetuned-sst-2-english';
const TIMEOUT_MS = 2000;

// Load BERT model (lazy, cached)
async function loadModel() {
  if (modelLoaded) return bertModel;
  if (modelLoadPromise) return modelLoadPromise;
  modelLoadPromise = pipeline('text-classification', MODEL_ID).then(model => {
    bertModel = model;
    modelLoaded = true;
    return model;
  }).catch(err => {
    console.error('Model load error:', err);
    modelLoaded = false;
    bertModel = null;
    return null;
  });
  return modelLoadPromise;
}

// Analyze claims with BERT
async function analyzeClaim(claim) {
  try {
    const model = await loadModel();
    if (!model) throw new Error('Model not loaded');
    const result = await Promise.race([
      model(claim),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS))
    ]);
    // result: [{label: 'POSITIVE'|'NEGATIVE', score: float}]
    const label = result[0]?.label || 'NEGATIVE';
    const confidence = result[0]?.score || 0;
    return {
      flagged: label === 'NEGATIVE',
      confidence,
      label
    };
  } catch (err) {
    console.error('AI inference error:', err);
    return {
      flagged: false,
      confidence: 0,
      label: 'ERROR'
    };
  }
}

// Queue system for claim analysis
function processQueue() {
  if (processing || queue.length === 0) return;
  processing = true;
  const { claims, sender, sendResponse } = queue.shift();
  Promise.all(claims.map(analyzeClaim)).then(results => {
    sendResponse({ results });
    processing = false;
    if (queue.length > 0) processQueue();
  }).catch(err => {
    console.error('Queue processing error:', err);
    sendResponse({ results: [] });
    processing = false;
    if (queue.length > 0) processQueue();
  });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'analyze_claims' && Array.isArray(msg.claims)) {
    queue.push({ claims: msg.claims, sender, sendResponse });
    processQueue();
    // Indicate async response
    return true;
  }
});

// IndexedDB caching (optional, for model)
// ...existing code for caching if needed...
