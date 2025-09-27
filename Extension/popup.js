chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, { type: "getGeminiData" }, (response) => {
    if (chrome.runtime.lastError) {
      document.getElementById("prompt").innerText = "Error accessing content script.";
      return;
    }

    document.getElementById("prompt").innerText = response?.prompt || "Not found";
    document.getElementById("response").innerText = response?.answer || "Not found";
  });
});