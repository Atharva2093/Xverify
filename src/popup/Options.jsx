import React, { useEffect, useState } from 'react';
import { getFeedbackStats } from '../background/feedback';
import './tailwind.css';

export default function Options() {
  const [stats, setStats] = useState({ total: 0, correct: 0, incorrect: 0, accuracy: 0 });
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getFeedbackStats().then(s => {
      setStats(s);
      setLoading(false);
    });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    // Submit false positive report (for demo, just set submitted)
    setSubmitted(true);
    setComment('');
  }

  return (
    <div className="p-4 w-80">
      <h2 className="font-bold text-lg mb-2">Feedback Analytics</h2>
      {loading ? <span className="animate-pulse">Loading...</span> : (
        <div className="mb-4">
          <div>Total Flags: {stats.total}</div>
          <div>Correct: {stats.correct}</div>
          <div>Incorrect: {stats.incorrect}</div>
          <div>Accuracy Rate: {(stats.accuracy * 100).toFixed(1)}%</div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="mb-2">
        <label className="block mb-1">Report False Positive:</label>
        <textarea className="w-full border rounded p-1 mb-2" value={comment} onChange={e => setComment(e.target.value)} placeholder="Describe the issue..." />
        <button type="submit" className="bg-blue-500 text-white py-1 px-3 rounded">Submit</button>
      </form>
      {submitted && <div className="text-green-600">Report submitted!</div>}
    </div>
  );
}
