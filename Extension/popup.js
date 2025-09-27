// popup.js - This script runs when the user opens the extension popup.

document.getElementById('extractButton').addEventListener('click', () => {
    const statusElement = document.getElementById('status');
    statusElement.textContent = 'Extracting content...';

    // 1. Query for the currently active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        
        // 2. Send a message to the content script running in the active tab
        chrome.tabs.sendMessage(activeTab.id, { action: 'extractContent' }, (response) => {
            
            // Handle potential errors (e.g., if content script hasn't run or tab closed)
            if (chrome.runtime.lastError) {
                statusElement.textContent = 'Error: Make sure you are on the Gemini page and refresh the page if needed.';
                console.error(chrome.runtime.lastError);
                return;
            }

            if (response && response.success && response.data) {
                const { prompt, response: modelResponse } = response.data;
                
                // Update UI with extracted content
                document.getElementById('promptContent').innerHTML = `<p>${prompt}</p>`;
                document.getElementById('responseContent').innerHTML = `<p>${modelResponse}</p>`;
                
                statusElement.textContent = 'Content successfully extracted!';
                
            } else {
                // Handle cases where content script ran but couldn't find the elements
                document.getElementById('promptContent').innerHTML = '<p>Could not find prompt.</p>';
                document.getElementById('responseContent').innerHTML = '<p>Could not find response.</p>';
                statusElement.textContent = 'Extraction failed. Ensure a conversation has been completed.';
            }
        });
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
