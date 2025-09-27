document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('infoButton');
    
    button.addEventListener('click', () => {
        // Simple action: Alert a message
        alert('Hello, Chrome Extension World!'); 
        
        // This will close the popup automatically after the alert is dismissed
    });
});

// popup.js
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  const url = tabs[0].url;
  if (!url.includes('gemini.google.com') && !url.includes('bard.google.com')) {
    document.body.innerHTML = '<p>This extension only works on Gemini AI</p>';
    return;
  }
  // Initialize your popup
});
