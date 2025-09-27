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
  
  // Print extracted prompt with clear formatting
  console.log('🌊 AQUACONSCIOUS - PROMPT EXTRACTED 🌊');
  console.log('═══════════════════════════════════════');
  console.log('Timestamp:', timestamp);
  console.log('Prompt Length:', prompt.length, 'characters');
  console.log('Prompt Text:');
  console.log('───────────────────────────────────────');
  console.log(prompt);
  console.log('═══════════════════════════════════════');
  
  // Store in localStorage (persistent across sessions)
  const localPrompts = JSON.parse(localStorage.getItem('aquaconsciousPrompts') || '[]');
  localPrompts.push(promptData);
  localStorage.setItem('aquaconsciousPrompts', JSON.stringify(localPrompts));
  
  // Also store in sessionStorage for immediate access
  const sessionPrompts = JSON.parse(sessionStorage.getItem('aquaconsciousPrompts') || '[]');
  sessionPrompts.push(promptData);
  sessionStorage.setItem('aquaconsciousPrompts', JSON.stringify(sessionPrompts));
  
  console.log('✅ Prompt successfully stored! Total prompts:', localPrompts.length);
  
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
  console.log('🔍 Aquaconscious: Attempting to extract prompt text...');
  
  // Common selectors for Gemini's input area (may need adjustment)
  const selectors = [
    'rich-textarea[placeholder*="Enter a prompt"]',
    'textarea[placeholder*="Enter a prompt"]',
    '[data-testid="prompt-textarea"]',
    '.ql-editor',
    '[contenteditable="true"]',
    'div[role="textbox"]',
    'textarea',
    'div[contenteditable="true"]'
  ];
  
  for (const selector of selectors) {
    console.log(`🔍 Checking selector: ${selector}`);
    const element = document.querySelector(selector);
    if (element) {
      console.log('✅ Found element:', element);
      let text = '';
      if (element.tagName.toLowerCase() === 'textarea' || element.tagName.toLowerCase() === 'input') {
        text = element.value;
      } else {
        text = element.textContent || element.innerText;
      }
      
      console.log('📝 Extracted text length:', text.length);
      if (text && text.trim().length > 0) {
        console.log('✅ Successfully extracted prompt text!');
        return text.trim();
      } else {
        console.log('⚠️ Element found but no text content');
      }
    } else {
      console.log('❌ Element not found for selector');
    }
  }
  
  console.log('❌ Aquaconscious: No prompt text could be extracted');
  return null;
}

// Monitor for send button clicks or Enter key presses
function setupPromptCapture() {
  console.log('🔍 Aquaconscious: Setting up prompt capture listeners...');
  
  // Monitor for send button clicks
  const sendButtonSelectors = [
    'button[data-testid="send-button"]',
    'button[aria-label*="Send"]',
    '[data-testid="send-button"]',
    '.send-button',
    'button[type="submit"]'
  ];
  
  // Add click listeners to potential send buttons
  sendButtonSelectors.forEach(selector => {
    document.addEventListener('click', (e) => {
      if (e.target.matches(selector) || e.target.closest(selector)) {
        console.log('🎯 Aquaconscious: Send button clicked, extracting prompt...');
        setTimeout(() => {
          const prompt = extractPrompt();
          if (prompt) {
            storePrompt(prompt);
          } else {
            console.log('⚠️ Aquaconscious: No prompt text found after send button click');
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
        
        console.log('⌨️ Aquaconscious: Enter key pressed, extracting prompt...');
        setTimeout(() => {
          const prompt = extractPrompt();
          if (prompt) {
            storePrompt(prompt);
          } else {
            console.log('⚠️ Aquaconscious: No prompt text found after Enter key press');
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
  const sessionPrompts = JSON.parse(sessionStorage.getItem('aquaconsciousPrompts') || '[]');
  
  console.log('🌊 AQUACONSCIOUS - STORED PROMPTS SUMMARY 🌊');
  console.log('═══════════════════════════════════════════════');
  console.log('Total prompts in localStorage:', localPrompts.length);
  console.log('Total prompts in sessionStorage:', sessionPrompts.length);
  console.log('═══════════════════════════════════════════════');
  
  localPrompts.forEach((prompt, index) => {
    console.log(`📝 Prompt #${index + 1} (${prompt.timestamp}):`);
    console.log(prompt.text.substring(0, 100) + (prompt.text.length > 100 ? '...' : ''));
    console.log('───────────────────────────────────────────────');
  });
  
  return {
    localStorage: localPrompts,
    sessionStorage: sessionPrompts
  };
}

// Function to clear stored prompts
function clearStoredPrompts() {
  const count = JSON.parse(localStorage.getItem('aquaconsciousPrompts') || '[]').length;
  localStorage.removeItem('aquaconsciousPrompts');
  sessionStorage.removeItem('aquaconsciousPrompts');
  console.log(`🗑️ Aquaconscious: Cleared ${count} stored prompts`);
}

// Function to print the last extracted prompt
function printLastPrompt() {
  const prompts = JSON.parse(localStorage.getItem('aquaconsciousPrompts') || '[]');
  if (prompts.length > 0) {
    const lastPrompt = prompts[prompts.length - 1];
    console.log('🌊 LAST EXTRACTED PROMPT 🌊');
    console.log('═══════════════════════════════════════');
    console.log('Timestamp:', lastPrompt.timestamp);
    console.log('Text:');
    console.log(lastPrompt.text);
    console.log('═══════════════════════════════════════');
  } else {
    console.log('❌ No prompts have been extracted yet');
  }
}

// Make functions available globally for debugging
window.aquaconscious = {
  getStoredPrompts,
  extractPrompt,
  storePrompt,
  clearStoredPrompts,
  printLastPrompt
};

// Initialize the extension
initialize();