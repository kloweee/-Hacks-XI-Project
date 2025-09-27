// content.js
var promptcount = 0

// Function to find the LAST (most recent) user prompt and AI response
function extractLatestGeminiData() {
  // 1. Identify all prompt and response elements. 
  //    These are placeholders; you'll need to use the browser's DevTools 
  //    "Inspect Element" to find the actual, stable CSS selectors 
  //    for the containers holding the user prompt and the AI's reply.

  // **ASSUMED PLACEHOLDERS - YOU MUST VERIFY THESE SELECTORS**
  const promptSelector = '.query-text-line.ng-star-inserted'; 
  const responseSelector = '.markdown.markdown-main-panel';

  const allPrompts = document.querySelectorAll(promptSelector);
  const allResponses = document.querySelectorAll(responseSelector);
  
  // 2. Get the *last* elements, which represent the current conversation turn.
  const lastPromptElement = allPrompts[allPrompts.length - 1];
  const lastResponseEntity = allResponses[allResponses.length - 1];

  var promptText = lastPromptElement?.innerText.trim() || '';
  var answerText = lastResponseEntity?.innerText.trim() || '';
  const totalChar = promptText.length + answerText.length;
  const token_count = Math.ceil(totalChar / 4); 

  const water_per_token = 0.18; // in mL/kWh
  const water_cost_ml = (water_per_token * token_count).toFixed(2); // in mL

  promptcount = length(allPrompts);

  return {
    prompt: lastPromptElement?.innerText.trim() || 'Prompt element not found',
    answer: lastResponseEntity?.innerText.trim() || 'Response element not found',
    count: promptcount || 'dont know!',
    water_cost: water_cost_ml || '0.00'
  };
}

// ---------------------------------------------------------------------
// New Logic: MutationObserver to detect new messages
// ---------------------------------------------------------------------

// function setupMutationObserver() {
//     // This needs to be a stable selector for the main CHAT CONTAINER 
//     // that holds all conversation turns (both prompt and response blocks).
//     // **YOU MUST FIND THE CORRECT CONTAINER SELECTOR FOR GEMINI**
//     const chatContainerSelector = 'content-container'; // e.g., 'div[role="main"]' 
//     const chatContainer = document.querySelector(chatContainerSelector);

//     if (!chatContainer) {
//         console.warn("Gemini chat container not found. Cannot set up observer.");
//         // Try again after a short delay in case the page is still loading
//         setTimeout(setupMutationObserver, 1000); 
//         return;
//     }

//     const observerConfig = { childList: true, subtree: true };

//     const callback = (mutationsList, observer) => {
//         for (const mutation of mutationsList) {
//             // Check if new nodes (like a new response block) were added
//             if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
//                 // Wait briefly for the response text to fully render before trying to extract
//                 setTimeout(sendDataToPopup, 500); 
//                 break; // Process only once per major change
//             }
//         }
//     };

//     const observer = new MutationObserver(callback);
//     observer.observe(chatContainer, observerConfig);
//     console.log("MutationObserver set up for Gemini chat.");
// }

function sendDataToPopup() {
    // This function can be called by both the message listener and the observer
    const data = extractLatestGeminiData();
    chrome.runtime.sendMessage({ type: "geminiDataUpdate", data: data });
}


// Listen for messages from popup.js (to open the popup initially)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getGeminiData") {
    const data = extractLatestGeminiData();
    sendResponse(data);
  }
});

// Start observing the page once the content script loads
// setupMutationObserver();

// Optional: Send initial data when the script loads, for the first message on the page
sendDataToPopup();