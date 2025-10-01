// Xverify Content Script: Extracts claims, sends to background, highlights flagged text
// ES6, async/await, error handling

// Utility: Extract visible text from body (excluding scripts, styles, hidden)
function extractVisibleText() {
	try {
		return document.body.innerText || '';
	} catch (err) {
		console.error('Text extraction error:', err);
		return '';
	}
}

// Utility: Split text into claims/sentences
function splitClaims(text) {
	// Split by period, exclamation, question mark, filter short sentences
	return text
		.split(/[.!?]\s+/)
		.map(s => s.trim())
		.filter(s => s.length > 20);
}

// Highlight flagged claims in DOM
function highlightClaims(claims, results) {
	claims.forEach((claim, idx) => {
		const result = results[idx];
		if (!result || !result.flagged) return;
		// Find claim in DOM
		const regex = new RegExp(claim.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
		while (walker.nextNode()) {
			const node = walker.currentNode;
			if (regex.test(node.textContent)) {
				// Wrap flagged text
				const span = document.createElement('span');
				span.style.background = 'rgba(255,0,0,0.3)';
				span.style.borderRadius = '4px';
				span.style.padding = '2px';
				span.title = `Fake News Risk: ${Math.round(result.confidence * 100)}%`;
				// Badge icon
				const badge = document.createElement('span');
				badge.textContent = `⚠️ ${Math.round(result.confidence * 100)}%`;
				badge.style.marginLeft = '4px';
				badge.style.fontSize = '0.8em';
				badge.style.color = 'red';
				// Replace text
				span.textContent = claim;
				node.parentNode.replaceChild(span, node);
				span.appendChild(badge);
				break;
			}
		}
	});
}

// Send claims to background for analysis
async function analyzeClaims(claims) {
	return new Promise((resolve) => {
		chrome.runtime.sendMessage({ type: 'analyze_claims', claims }, (response) => {
			if (chrome.runtime.lastError) {
				console.error('Message error:', chrome.runtime.lastError);
				resolve([]);
			} else {
				resolve(response?.results || []);
			}
		});
	});
}

// Main scan function
async function scanPage() {
	try {
		const text = extractVisibleText();
		const claims = splitClaims(text);
		if (claims.length === 0) return;
		const results = await analyzeClaims(claims);
		highlightClaims(claims, results);
	} catch (err) {
		console.error('Scan error:', err);
	}
}

// Handle dynamic content (debounced)
let scanTimeout;
function debounceScan() {
	clearTimeout(scanTimeout);
	scanTimeout = setTimeout(scanPage, 1000);
}

// Initial scan
scanPage();

// Listen for DOM changes (dynamic content)
const observer = new MutationObserver(debounceScan);
observer.observe(document.body, { childList: true, subtree: true });

// Listen for background responses (if needed)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg.type === 'scan_results') {
		highlightClaims(msg.claims, msg.results);
		sendResponse({ status: 'ok' });
	}
});

// Error handling for iframes
try {
	Array.from(document.getElementsByTagName('iframe')).forEach(iframe => {
		iframe.contentWindow?.postMessage({ type: 'xverify_scan' }, '*');
	});
} catch (err) {
	console.warn('Iframe scan error:', err);
}