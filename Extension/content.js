
// Function to find ALL user prompts and AI responses and calculate the cumulative cost
function extractLatestGeminiData() {
  const promptSelector = '.query-text-line.ng-star-inserted'; 
  const responseSelector = '.markdown.markdown-main-panel';

  const allPrompts = document.querySelectorAll(promptSelector);
  const allResponses = document.querySelectorAll(responseSelector);
  
  // Initialize total water cost for this *request*. This starts at 0 every time.
  let total_ml_cost = 0;
  
  // Calculate water cost for ALL prompt/response pairs
  const conversationLength = Math.min(allPrompts.length, allResponses.length);

  for (let i = 0; i < conversationLength; i++) {
    const promptText = allPrompts[i]?.innerText.trim() || '';
    const answerText = allResponses[i]?.innerText.trim() || '';
    
    // Only calculate if there is text for this pair
    if (promptText.length > 0 || answerText.length > 0) {
        const totalChar = promptText.length + answerText.length;
        const token_count = Math.ceil(totalChar / 4); 
        
        const water_per_token = 0.18; 
        const water_cost_ml_for_turn = (water_per_token * token_count); 
        
        total_ml_cost += water_cost_ml_for_turn;
    }
  }

  const lastPromptElement = allPrompts[allPrompts.length - 1];
  const lastResponseEntity = allResponses[allResponses.length - 1];
  
  // The final total water cost, formatted to two decimal places
  const final_water_cost_formatted = total_ml_cost.toFixed(2); 

  // return strings/numbers to return to HTML file to display
  return {
    prompt: lastPromptElement?.innerText.trim() || 'Prompt element not found',
    answer: lastResponseEntity?.innerText.trim() || 'Response element not found',
    count: conversationLength || '0',
    water_cost: final_water_cost_formatted || '0.00'
  };
}


function sendDataToPopup() {
    const data = extractLatestGeminiData();
    chrome.runtime.sendMessage({ type: "geminiDataUpdate", data: data });
}


// Listen for messages from popup.js (when the user opens the extension)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getGeminiData") {
    const data = extractLatestGeminiData();
    sendResponse(data);
    return true; 
  }
});
