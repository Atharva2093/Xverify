import React, { useState } from 'react';

export default function DebugToggle() {
  const [debug, setDebug] = useState(false);

  function handleToggle() {
    setDebug(!debug);
    chrome.storage.local.set({ debugMode: !debug });
  }

  return (
    <div className="mt-2">
      <label className="flex items-center">
        <input type="checkbox" checked={debug} onChange={handleToggle} />
        <span className="ml-2">Debug Mode</span>
      </label>
    </div>
  );
}
