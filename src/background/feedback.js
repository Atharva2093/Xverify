// Xverify User Feedback System
// ES6, async/await, error handling

// Store feedback in Chrome storage sync
export async function storeFeedback(claimIdx, feedback, comment = '') {
  try {
    const key = `feedback_${claimIdx}`;
    const value = { feedback, comment, timestamp: Date.now() };
    await chrome.storage.sync.set({ [key]: value });
  } catch (err) {
    console.error('Feedback store error:', err);
  }
}

// Get feedback statistics
export async function getFeedbackStats() {
  return new Promise(resolve => {
    chrome.storage.sync.get(null, items => {
      const feedbacks = Object.values(items).filter(i => i.feedback);
      const total = feedbacks.length;
      const correct = feedbacks.filter(f => f.feedback === 'correct').length;
      const incorrect = feedbacks.filter(f => f.feedback === 'incorrect').length;
      const accuracy = total ? correct / total : 0;
      resolve({ total, correct, incorrect, accuracy });
    });
  });
}

// Submit false positive report
export async function submitFalsePositive(claimIdx, comment) {
  await storeFeedback(claimIdx, 'incorrect', comment);
}

// Sync feedback across devices (Chrome storage sync does this)
// Send feedback to backend (if exists)
export async function sendFeedbackToBackend(feedback) {
  // Placeholder: send to local JSON or MongoDB
  // fetch('/api/feedback', { method: 'POST', body: JSON.stringify(feedback) })
}
