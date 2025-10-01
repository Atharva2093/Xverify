// Error logging system for Chrome extension
// Stores errors in Chrome storage

export function logError(error) {
  const entry = {
    message: error.message || String(error),
    stack: error.stack || '',
    timestamp: Date.now()
  };
  chrome.storage.local.get({ errors: [] }, data => {
    const errors = data.errors || [];
    errors.push(entry);
    chrome.storage.local.set({ errors });
  });
}

export function getErrors(callback) {
  chrome.storage.local.get({ errors: [] }, data => {
    callback(data.errors || []);
  });
}
