chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const isGemini = tab.url.includes('gemini.google.com') || 
                     tab.url.includes('bard.google.com');
    
    if (!isGemini) {
      // Disable extension functionality
      chrome.action.disable(tabId);
    } else {
      chrome.action.enable(tabId);
    }
  }
});
