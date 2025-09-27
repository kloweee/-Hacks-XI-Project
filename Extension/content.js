function extractGeminiData() {
  // These are placeholders; inspect Gemini's DOM to get accurate class names
  const promptElement = document.querySelector('[class="query-text-line ng-star-inserted"]');
  const responseElement = document.querySelector('[class="markdown markdown-main-panel tutor-markdown-rendering stronger enable-updated-hr-color"]');

  return {
    prompt: promptElement?.innerText || '',
    answer: responseElement?.innerText || ''
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getGeminiData") {
    const data = extractGeminiData();
    sendResponse(data);
  }
});