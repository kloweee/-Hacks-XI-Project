// Gemini Water Usage Tracker - Background Script

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'WATER_USAGE_RECORDED') {
    handleWaterUsageRecorded(message.data);
  }
  return true;
});

async function handleWaterUsageRecorded(data) {
  // Update badge with today's usage
  const result = await chrome.storage.local.get(['dailyUsage']);
  const dailyUsage = result.dailyUsage || {};
  const todayUsage = dailyUsage[data.today] || 0;
  
  // Set badge text (show ml used today)
  const badgeText = todayUsage < 1 ? `${(todayUsage * 1000).toFixed(0)}μl` : `${todayUsage.toFixed(1)}ml`;
  
  try {
    await chrome.action.setBadgeText({ text: badgeText });
    await chrome.action.setBadgeBackgroundColor({ color: '#4285f4' });
  } catch (error) {
    console.log('Could not set badge:', error);
  }
}

// Initialize badge on startup
chrome.runtime.onStartup.addListener(async () => {
  await updateBadge();
});

chrome.runtime.onInstalled.addListener(async () => {
  await updateBadge();
});

async function updateBadge() {
  try {
    const result = await chrome.storage.local.get(['dailyUsage']);
    const dailyUsage = result.dailyUsage || {};
    const today = new Date().toDateString();
    const todayUsage = dailyUsage[today] || 0;
    
    const badgeText = todayUsage < 1 ? `${(todayUsage * 1000).toFixed(0)}μl` : `${todayUsage.toFixed(1)}ml`;
    
    await chrome.action.setBadgeText({ text: badgeText });
    await chrome.action.setBadgeBackgroundColor({ color: '#4285f4' });
  } catch (error) {
    console.log('Could not update badge:', error);
  }
}