// Wait for the page to load completely
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error('Element not found within timeout'));
    }, timeout);
  });
}

// Function to store prompt
function storePrompt(prompt) {
  const timestamp = new Date().toISOString();
  const promptData = {
    text: prompt,
    timestamp: timestamp,
    url: window.location.href
  };
  
  // Store in localStorage (persistent across sessions)
  const localPrompts = JSON.parse(localStorage.getItem('aquaconsciousPrompts') || '[]');
  localPrompts.push(promptData);
  localStorage.setItem('aquaconsciousPrompts', JSON.stringify(localPrompts));
  
  // Also store in sessionStorage for immediate access
  const sessionPrompts = JSON.parse(sessionStorage.getItem('aquaconsciousPrompts') || '[]');
  sessionPrompts.push(promptData);
  sessionStorage.setItem('aquaconsciousPrompts', JSON.stringify(sessionPrompts));
  
  console.log('Aquaconscious - Prompt stored:', prompt);
  
  // Send message to popup if it's open
  try {
    chrome.runtime.sendMessage({
      type: 'PROMPT_STORED',
      data: promptData
    }).catch(() => {
      // Ignore errors if popup is not open
    });
  } catch (error) {
    // Ignore messaging errors
  }
}

// Function to extract prompt text
function extractPrompt() {
  // Common selectors for Gemini's input area (may need adjustment)
  const selectors = [
    'rich-textarea[placeholder*="Enter a prompt"]',
    'textarea[placeholder*="Enter a prompt"]',
    '[data-testid="prompt-textarea"]',
    '.ql-editor',
    '[contenteditable="true"]',
    'div[role="textbox"]'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      let text = '';
      if (element.tagName.toLowerCase() === 'textarea' || element.tagName.toLowerCase() === 'input') {
        text = element.value;
      } else {
        text = element.textContent || element.innerText;
      }
      
      if (text && text.trim().length > 0) {
        return text.trim();
      }
    }
  }
  
  return null;
}

// Monitor for send button clicks or Enter key presses
function setupPromptCapture() {
  // Monitor for send button clicks
  const sendButtonSelectors = [
    'button[data-testid="send-button"]',
    'button[aria-label*="Send"]',
    '[data-testid="send-button"]',
    '.send-button'
  ];
  
  // Add click listeners to potential send buttons
  sendButtonSelectors.forEach(selector => {
    document.addEventListener('click', (e) => {
      if (e.target.matches(selector) || e.target.closest(selector)) {
        setTimeout(() => {
          const prompt = extractPrompt();
          if (prompt) {
            storePrompt(prompt);
          }
        }, 100); // Small delay to ensure content is captured
      }
    });
  });
  
  // Monitor for Enter key presses in text areas
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const target = e.target;
      if (target.tagName.toLowerCase() === 'textarea' || 
          target.contentEditable === 'true' ||
          target.getAttribute('role') === 'textbox') {
        
        setTimeout(() => {
          const prompt = extractPrompt();
          if (prompt) {
            storePrompt(prompt);
          }
        }, 100);
      }
    }
  });
}

// Initialize when page loads
async function initialize() {
  try {
    console.log('Aquaconscious extension loaded - monitoring Gemini prompts');
    
    // Wait for the page to be ready
    await new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
    
    // Setup prompt capture
    setupPromptCapture();
    
    // Also setup a MutationObserver to handle dynamically loaded content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Re-setup capture for any new elements
          setupPromptCapture();
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
  } catch (error) {
    console.error('Error initializing Aquaconscious extension:', error);
  }
}

// Function to retrieve stored prompts (for debugging)
function getStoredPrompts() {
  const localPrompts = JSON.parse(localStorage.getItem('aquaconsciousPrompts') || '[]');
  console.log('Stored prompts (localStorage):', localPrompts);
  
  const sessionPrompts = JSON.parse(sessionStorage.getItem('aquaconsciousPrompts') || '[]');
  console.log('Session prompts:', sessionPrompts);
  
  return {
    localStorage: localPrompts,
    sessionStorage: sessionPrompts
  };
}

// Function to clear stored prompts
function clearStoredPrompts() {
  localStorage.removeItem('aquaconsciousPrompts');
  sessionStorage.removeItem('aquaconsciousPrompts');
  console.log('Aquaconscious - All prompts cleared');
}

// Make functions available globally for debugging
window.aquaconscious = {
  getStoredPrompts,
  extractPrompt,
  storePrompt,
  clearStoredPrompts
};

// Initialize the extension
initialize();