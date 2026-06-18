const API_BASE = 'https://whoreadtos.com';

const TOS_KEYWORDS = [
  'terms', 'privacy', 'tos', 'conditions', 'legal', 'policy',
  'agreement', 'eula', 'disclaimer', 'cookie', 'gdpr'
];

function isTosPage(url, title) {
  const combined = `${url} ${title}`.toLowerCase();
  return TOS_KEYWORDS.some(kw => combined.includes(kw));
}

function showState(id) {
  ['stateLoading', 'stateManual', 'stateResults', 'stateError'].forEach(s => {
    document.getElementById(s).style.display = s === id ? '' : 'none';
  });
}

function setGrade(grade) {
  const badge = document.getElementById('gradeBadge');
  badge.textContent = grade;
  badge.className = `grade-badge grade-${grade}`;
  badge.style.display = '';
}

function renderResults(data) {
  setGrade(data.score);

  const list = document.getElementById('findingsList');
  list.innerHTML = '';
  (data.items || []).forEach(item => {
    const li = document.createElement('li');
    li.className = 'finding-item';
    li.innerHTML = `
      <span class="risk-dot risk-${item.risk}"></span>
      <div class="finding-body">
        <div class="finding-text">${escapeHtml(item.text)}</div>
        <div class="finding-section">${escapeHtml(item.section)}</div>
      </div>
    `;
    list.appendChild(li);
  });

  const ms = data.analysis_time_ms;
  document.getElementById('analysisTime').textContent =
    ms ? `Analyzed in ${(ms / 1000).toFixed(1)}s` : '';

  showState('stateResults');
}

function showError(msg) {
  document.getElementById('errorMsg').textContent = msg;
  showState('stateError');
}

async function analyze(text, url) {
  showState('stateLoading');
  try {
    const res = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, url })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
    renderResults(data);
  } catch (err) {
    showError(err.message || 'Something went wrong. Please try again.');
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function extractPageText() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const selectors = ['main', 'article', '.content', '#content', 'body'];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) return el.innerText.slice(0, 8000);
      }
      return document.body.innerText.slice(0, 8000);
    }
  });
  return results?.[0]?.result || '';
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url || '';
  const title = tab.title || '';

  // Set site name in header
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    document.getElementById('siteName').textContent = hostname;
  } catch (_) {
    document.getElementById('siteName').textContent = title;
  }

  if (isTosPage(url, title)) {
    try {
      const text = await extractPageText();
      if (text.length >= 100) {
        await analyze(text, url);
      } else {
        showState('stateManual');
      }
    } catch (_) {
      showState('stateManual');
    }
  } else {
    showState('stateManual');
  }
}

// Wire up manual analyze button
document.getElementById('btnManual').addEventListener('click', async () => {
  const text = document.getElementById('manualText').value.trim();
  if (text.length < 100) {
    showError('Please paste at least 100 characters of text.');
    return;
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await analyze(text, tab?.url || '');
});

// Wire up retry button
document.getElementById('btnRetry').addEventListener('click', () => init());

init();
