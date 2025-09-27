// Gemini Water Usage Tracker - Content Script

class GeminiWaterTracker {
  constructor() {
    this.isTracking = false;
    this.lastPromptLength = 0;
    this.waterUsagePerChar = 0.0001; // Estimated ml per character (adjustable)
    this.complexityMultipliers = {
      code: 1.5,
      creative: 1.3,
      analysis: 1.4,
      simple: 1.0
    };
    
    this.init();
  }

  init() {
    console.log('Gemini Water Usage Tracker initialized');
    this.setupObservers();
    this.trackExistingElements();
  }

  setupObservers() {
    // Observer for DOM changes (new elements appearing)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.trackNewElements(mutation.addedNodes);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  trackExistingElements() {
    // Find and track existing prompt input areas
    setTimeout(() => {
      this.attachToPromptInput();
    }, 2000); // Wait for page to load
  }

  trackNewElements(nodes) {
    nodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        this.attachToPromptInput();
      }
    });
  }

  attachToPromptInput() {
    // Multiple selectors to catch different versions of Gemini interface
    const selectors = [
      'div[contenteditable="true"]',
      'textarea',
      '[data-test-id="prompt-textarea"]',
      '.ql-editor',
      '[role="textbox"]'
    ];

    let inputElement = null;
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (this.isPromptInput(element)) {
          inputElement = element;
          break;
        }
      }
      if (inputElement) break;
    }

    if (inputElement && !inputElement.hasAttribute('data-water-tracked')) {
      console.log('Found prompt input element:', inputElement);
      inputElement.setAttribute('data-water-tracked', 'true');
      this.attachInputListeners(inputElement);
    }

    // Also look for send buttons
    this.attachToSendButton();
  }

  isPromptInput(element) {
    const parent = element.parentElement;
    const grandParent = parent?.parentElement;
    
    // Check if element is likely a prompt input based on context
    const indicators = [
      element.placeholder?.toLowerCase().includes('message'),
      element.placeholder?.toLowerCase().includes('ask'),
      element.placeholder?.toLowerCase().includes('prompt'),
      parent?.classList?.toString().includes('input'),
      grandParent?.classList?.toString().includes('compose'),
      element.getAttribute('aria-label')?.includes('message'),
      element.offsetHeight > 20 && element.offsetWidth > 200
    ];

    return indicators.some(indicator => indicator === true);
  }

  attachInputListeners(inputElement) {
    // Track typing in the input
    inputElement.addEventListener('input', (e) => {
      this.handleInput(e);
    });

    // Track when user presses Enter (might send message)
    inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        this.handlePotentialSubmit(e);
      }
    });
  }

  attachToSendButton() {
    // Look for send/submit buttons
    const buttonSelectors = [
      'button[aria-label*="Send"]',
      'button[data-test-id="send-button"]',
      'button:has(svg)',
      '[role="button"]'
    ];

    buttonSelectors.forEach(selector => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(button => {
        if (this.isSendButton(button) && !button.hasAttribute('data-water-tracked')) {
          button.setAttribute('data-water-tracked', 'true');
          button.addEventListener('click', (e) => {
            this.handleSubmit(e);
          });
        }
      });
    });
  }

  isSendButton(button) {
    const text = button.textContent?.toLowerCase() || '';
    const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
    const title = button.getAttribute('title')?.toLowerCase() || '';
    
    return text.includes('send') || 
           ariaLabel.includes('send') || 
           title.includes('send') ||
           button.querySelector('svg'); // Many send buttons use arrow icons
  }

  handleInput(event) {
    const text = this.getElementText(event.target);
    this.lastPromptLength = text.length;
    
    // Optional: Show real-time water usage estimate
    if (text.length > 0) {
      const estimatedUsage = this.calculateWaterUsage(text);
      console.log(`Current prompt water estimate: ${estimatedUsage.toFixed(4)} ml`);
    }
  }

  handlePotentialSubmit(event) {
    // Handle Enter key submission
    setTimeout(() => {
      this.processPromptSubmission();
    }, 100);
  }

  handleSubmit(event) {
    // Handle button click submission
    setTimeout(() => {
      this.processPromptSubmission();
    }, 100);
  }

  processPromptSubmission() {
    // Find the current prompt text
    const inputElement = document.querySelector('[data-water-tracked="true"]');
    if (!inputElement) return;

    const promptText = this.getElementText(inputElement);
    
    if (promptText.length > 0) {
      const waterUsage = this.calculateWaterUsage(promptText);
      this.recordWaterUsage(promptText, waterUsage);
      
      console.log(`Prompt submitted! Water usage: ${waterUsage.toFixed(4)} ml`);
    }
  }

  getElementText(element) {
    // Handle different types of input elements
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      return element.value || '';
    } else if (element.contentEditable === 'true') {
      return element.textContent || element.innerText || '';
    }
    return '';
  }

  calculateWaterUsage(text) {
    const baseUsage = text.length * this.waterUsagePerChar;
    const complexity = this.detectComplexity(text);
    const multiplier = this.complexityMultipliers[complexity] || 1.0;
    
    return baseUsage * multiplier;
  }

  detectComplexity(text) {
    const lowerText = text.toLowerCase();
    
    // Code detection
    if (lowerText.includes('function') || 
        lowerText.includes('code') || 
        lowerText.includes('programming') ||
        lowerText.includes('script') ||
        text.includes('{}') || 
        text.includes('()')) {
      return 'code';
    }
    
    // Creative writing detection
    if (lowerText.includes('write a story') ||
        lowerText.includes('poem') ||
        lowerText.includes('creative') ||
        lowerText.includes('imagine')) {
      return 'creative';
    }
    
    // Analysis detection
    if (lowerText.includes('analyze') ||
        lowerText.includes('explain') ||
        lowerText.includes('compare') ||
        lowerText.includes('research')) {
      return 'analysis';
    }
    
    return 'simple';
  }

  async recordWaterUsage(promptText, waterUsage) {
    const timestamp = Date.now();
    const today = new Date().toDateString();
    
    // Get existing data
    const result = await chrome.storage.local.get(['waterUsageData', 'dailyUsage']);
    
    const waterUsageData = result.waterUsageData || [];
    const dailyUsage = result.dailyUsage || {};
    
    // Add new entry
    waterUsageData.push({
      timestamp,
      length: promptText.length,
      waterUsage,
      complexity: this.detectComplexity(promptText),
      date: today
    });
    
    // Update daily total
    dailyUsage[today] = (dailyUsage[today] || 0) + waterUsage;
    
    // Keep only last 1000 entries to prevent storage bloat
    if (waterUsageData.length > 1000) {
      waterUsageData.splice(0, waterUsageData.length - 1000);
    }
    
    // Save to storage
    await chrome.storage.local.set({
      waterUsageData,
      dailyUsage,
      totalWaterUsage: (result.totalWaterUsage || 0) + waterUsage,
      lastUpdated: timestamp
    });

    // Notify background script
    chrome.runtime.sendMessage({
      type: 'WATER_USAGE_RECORDED',
      data: { waterUsage, today }
    });
  }
}

// Initialize the tracker when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GeminiWaterTracker();
  });
} else {
  new GeminiWaterTracker();
}