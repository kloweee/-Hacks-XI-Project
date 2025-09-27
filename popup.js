// Gemini Water Usage Tracker - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  await loadWaterUsageData();
  setupEventListeners();
});

async function loadWaterUsageData() {
  try {
    const result = await chrome.storage.local.get([
      'waterUsageData',
      'dailyUsage',
      'totalWaterUsage'
    ]);

    const waterUsageData = result.waterUsageData || [];
    const dailyUsage = result.dailyUsage || {};
    const totalWaterUsage = result.totalWaterUsage || 0;

    const today = new Date().toDateString();
    const todayUsage = dailyUsage[today] || 0;

    // Calculate week usage
    const weekUsage = calculateWeekUsage(dailyUsage);
    
    // Count today's prompts
    const todayPrompts = waterUsageData.filter(entry => entry.date === today).length;

    // Update UI
    updateDisplay(todayUsage, weekUsage, totalWaterUsage, todayPrompts);
    updateWaterVisual(todayUsage);
    updateRecentHistory(waterUsageData);

  } catch (error) {
    console.error('Error loading water usage data:', error);
    showError();
  }
}

function calculateWeekUsage(dailyUsage) {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  let weekTotal = 0;
  for (let d = new Date(weekAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toDateString();
    weekTotal += dailyUsage[dateStr] || 0;
  }
  
  return weekTotal;
}

function updateDisplay(todayUsage, weekUsage, totalUsage, promptsCount) {
  document.getElementById('todayValue').textContent = formatWaterUsage(todayUsage);
  document.getElementById('weekValue').textContent = formatWaterUsage(weekUsage);
  document.getElementById('totalValue').textContent = formatWaterUsage(totalUsage);
  document.getElementById('promptsToday').textContent = promptsCount;
}

function updateWaterVisual(todayUsage) {
  const usageElement = document.getElementById('todayUsage');
  const equivalenceElement = document.getElementById('equivalence');
  
  usageElement.textContent = `${formatWaterUsage(todayUsage)} today`;
  
  // Add fun equivalences
  const equivalence = getWaterEquivalence(todayUsage);
  equivalenceElement.textContent = equivalence;
  
  // Change water drop based on usage
  const dropElement = document.getElementById('waterDrop');
  if (todayUsage > 10) {
    dropElement.textContent = '🌊'; // High usage
  } else if (todayUsage > 1) {
    dropElement.textContent = '💧'; // Medium usage
  } else {
    dropElement.textContent = '💦'; // Low usage
  }
}

function getWaterEquivalence(ml) {
  if (ml < 0.001) return 'Less than a dewdrop';
  if (ml < 0.1) return 'About a small raindrop';
  if (ml < 1) return 'Like a few tears';
  if (ml < 5) return 'About a teaspoon';
  if (ml < 15) return 'About a tablespoon';
  if (ml < 250) return 'Less than a cup of water';
  if (ml < 500) return 'About 2 cups of water';
  if (ml < 1000) return 'Nearly a water bottle';
  return 'More than a water bottle!';
}

function formatWaterUsage(ml) {
  if (ml < 0.001) return '< 0.001 ml';
  if (ml < 1) return `${(ml * 1000).toFixed(0)} μl`;
  if (ml < 1000) return `${ml.toFixed(2)} ml`;
  return `${(ml / 1000).toFixed(2)} L`;
}

function updateRecentHistory(waterUsageData) {
  const historyElement = document.getElementById('recentHistory');
  
  if (waterUsageData.length === 0) {
    historyElement.innerHTML = '<div class="loading">No prompts tracked yet</div>';
    return;
  }

  // Get last 5 entries
  const recentEntries = waterUsageData.slice(-5).reverse();
  
  historyElement.innerHTML = recentEntries.map(entry => {
    const time = new Date(entry.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `
      <div class="history-item">
        <span>${time} - ${entry.length} chars (${entry.complexity})</span>
        <span>${formatWaterUsage(entry.waterUsage)}</span>
      </div>
    `;
  }).join('');
}

function setupEventListeners() {
  document.getElementById('resetData').addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all water usage data? This cannot be undone.')) {
      try {
        await chrome.storage.local.clear();
        
        // Reset badge
        await chrome.action.setBadgeText({ text: '' });
        
        // Reload display
        await loadWaterUsageData();
        
        alert('All data has been reset!');
      } catch (error) {
        console.error('Error resetting data:', error);
        alert('Error resetting data. Please try again.');
      }
    }
  });
}

function showError() {
  document.getElementById('todayUsage').textContent = 'Error loading data';
  document.getElementById('recentHistory').innerHTML = 
    '<div class="loading">Error loading history</div>';
}

// Refresh data every few seconds while popup is open
setInterval(loadWaterUsageData, 3000);