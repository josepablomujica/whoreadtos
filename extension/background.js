const TOS_KEYWORDS = [
  'terms', 'privacy', 'tos', 'conditions', 'legal', 'policy',
  'agreement', 'eula', 'disclaimer', 'cookie', 'gdpr'
];

function isTosPage(url, title) {
  const combined = `${url} ${title}`.toLowerCase();
  return TOS_KEYWORDS.some(kw => combined.includes(kw));
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;

  const detected = isTosPage(tab.url, tab.title || '');

  chrome.action.setBadgeText({
    tabId,
    text: detected ? 'TOS' : ''
  });

  chrome.action.setBadgeBackgroundColor({
    tabId,
    color: '#1D9E75'
  });
});
