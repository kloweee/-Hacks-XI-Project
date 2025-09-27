// content.js - This script runs inside the Gemini webpage.
// NOTE: CSS selectors (e.g., '.prompt-class', '.response-class') are placeholders.
// You MUST inspect the Gemini page elements using Developer Tools and update these
// selectors to match the actual classes or IDs used for the user prompt and model response.

/**
 * Finds the latest user prompt and the corresponding model response.
 * @returns {{prompt: string, response: string} | null} The extracted text or null if not found.
 */
function extractLatestContent() {
    // --- PLACEHOLDER SELECTORS: UPDATE THESE ---
    // Example: Select all chat messages
    const messageElements = document.querySelectorAll('div[data-message-id]'); 
    
    if (messageElements.length < 2) {
        // Need at least one prompt and one response
        return null; 
    }

    // Attempt to find the last two messages (User Prompt and Model Response)
    // The exact structure varies. This attempts to grab the last message (response)
    // and the message before it (prompt).
    
    const latestResponseElement = messageElements[messageElements.length - 1];
    const previousPromptElement = messageElements[messageElements.length - 2];

    if (!latestResponseElement || !previousPromptElement) {
        return null;
    }

    // Assuming the text content is deeply nested within the message elements.
    // Use .innerText to get the visible text content.
    const prompt = previousPromptElement.innerText.trim();
    const response = latestResponseElement.innerText.trim();
    
    // Simple validation to ensure we got something meaningful
    if (prompt.length > 0 && response.length > 0) {
        return {
            prompt: prompt,
            response: response
        };
    }
    
    return null;
}

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractContent') {
        const content = extractLatestContent();
        sendResponse({ success: true, data: content });
        // Return true to indicate we will send an asynchronous response
        return true; 
    }
});

// Optional: Use MutationObserver to log when new content is added (useful for debugging selectors)
// const observerConfig = { childList: true, subtree: true };
// const targetNode = document.body; // Or a more specific chat container element

// const observer = new MutationObserver((mutationsList, observer) => {
//     for(const mutation of mutationsList) {
//         if (mutation.type === 'childList') {
//             // console.log('A child node has been added or removed.');
//             // You can call extractLatestContent() here if you want to capture
//             // data automatically right after a response finishes loading.
//         }
//     }
// });

// observer.observe(targetNode, observerConfig);
