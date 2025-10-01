import React, { useEffect, useState } from 'react';
import './tailwind.css';

const STATUS = {
  scanning: 'Scanning...',
  complete: 'Scan complete',
  noIssues: 'No issues found',
};

function ClaimItem({ claim, confidence, verdict, source, severity, onFeedback }) {
  const color = severity === 'high' ? 'bg-red-100 border-red-500' : severity === 'uncertain' ? 'bg-yellow-100 border-yellow-500' : 'bg-green-100 border-green-500';
  return (
    <div className={`border-l-4 p-2 mb-2 ${color}`}>
      <div className="flex justify-between items-center">
        <span className="font-medium" title={claim}>{claim.length > 100 ? claim.slice(0, 100) + '...' : claim}</span>
        <span className="ml-2 text-xs">{Math.round(confidence * 100)}%</span>
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs">{verdict} {source && <a href={source} className="underline ml-1" target="_blank" rel="noopener noreferrer">Source</a>}</span>
        <div>
          <button className="mx-1" onClick={() => onFeedback('correct')}>👍</button>
          <button className="mx-1" onClick={() => onFeedback('incorrect')}>👎</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [status, setStatus] = useState(STATUS.scanning);
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    chrome.runtime.sendMessage({ type: 'get_scan_results' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        setError('Failed to load scan results');
        setLoading(false);
        return;
      }
      setClaims(response.claims || []);
      setStatus(response.status || STATUS.complete);
      setLoading(false);
    });
  }, []);

  function handleRescan() {
    setLoading(true);
    setStatus(STATUS.scanning);
    chrome.runtime.sendMessage({ type: 'rescan_page' }, (response) => {
      setClaims(response.claims || []);
      setStatus(response.status || STATUS.complete);
      setLoading(false);
    });
  }

  function handleFeedback(idx, type) {
    chrome.runtime.sendMessage({ type: 'user_feedback', claimIdx: idx, feedback: type }, () => {});
  }

  return (
    <div className="p-4 w-80">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-lg">Xverify Scan</span>
        <button title="Settings" className="text-gray-500" onClick={() => chrome.runtime.openOptionsPage()}>
          ⚙️
        </button>
      </div>
      <div className="mb-2">
        {loading ? <span className="animate-pulse">{STATUS.scanning}</span> : <span>{status}</span>}
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div>
        {claims.length === 0 && !loading ? <div className="text-green-600">No issues found.</div> :
          claims.map((c, idx) => (
            <ClaimItem
              key={idx}
              claim={c.text}
              confidence={c.confidence}
              verdict={c.verdict}
              source={c.source}
              severity={c.severity}
              onFeedback={type => handleFeedback(idx, type)}
            />
          ))}
      </div>
      <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded" onClick={handleRescan}>Rescan Page</button>
    </div>
  );
}
