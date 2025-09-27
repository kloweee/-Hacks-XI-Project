// popup.js

// Function to update the popup UI
function updatePopupUI(data) {
  document.getElementById("prompt").innerText = data?.prompt || "Not found";
  document.getElementById("response").innerText = data?.answer || "Not found";
  document.getElementById("count").innerText = data?.count || "0";
  document.getElementById("water_count").innerText = "You used "+ data?.water_cost + " mL of water with this prompt!" || "0.00";
}

// 1. Initial data request when the popup opens
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, { type: "getGeminiData" }, (response) => {
    if (chrome.runtime.lastError) {
      document.getElementById("prompt").innerText = "Error accessing content script or page is not Gemini/Bard.";
      return;
    }
    updatePopupUI(response);
  });
});

// 2. Listener for real-time updates from content.js (via MutationObserver)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "geminiDataUpdate") {
        updatePopupUI(message.data);
    }
    // Need to return true for asynchronous sendResponse, though not strictly needed here
    // since we're not sending a response back to the content script.
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  const url = tabs[0].url;
  if (!url.includes('gemini.google.com') && !url.includes('bard.google.com')) {
    document.body.innerHTML = '<p>This extension only works on Gemini AI</p>';
    return;
  }
});