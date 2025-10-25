// JobMatch AI - Popup Script

const API_BASE_URL = 'http://34.134.208.48:4000';

// DOM Elements
const loginView = document.getElementById('login-view');
const mainView = document.getElementById('main-view');
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const noJobState = document.getElementById('no-job-state');
const jobAnalysisState = document.getElementById('job-analysis-state');
const viewFullBtn = document.getElementById('view-full-btn');

// The popup will detect authentication via polling the check-magic-link endpoint

// Initialize popup
async function init() {
  // Check if user is logged in
  const { authToken } = await chrome.storage.local.get('authToken');
  
  if (authToken) {
    showMainView();
    loadCurrentJobData();
  } else {
    showLoginView();
  }
}

// Show login view
function showLoginView() {
  loginView.style.display = 'block';
  mainView.style.display = 'none';
}

// Show main view
function showMainView() {
  loginView.style.display = 'none';
  mainView.style.display = 'block';
}

// Handle magic link form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const loginSuccess = document.getElementById('login-success');
  
  // Show loading state
  const btnText = loginBtn.querySelector('.btn-text');
  const btnLoader = loginBtn.querySelector('.btn-loader');
  btnText.style.display = 'none';
  btnLoader.style.display = 'block';
  loginBtn.disabled = true;
  loginError.style.display = 'none';
  loginSuccess.style.display = 'none';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/magic-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send magic link');
    }
    
    // Show success message
    loginSuccess.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>📧</span>
        <div>
          <strong>Magic link sent!</strong><br>
          Check your email and click the link to sign in.
        </div>
      </div>
    `;
    loginSuccess.style.display = 'block';
    
    // Start polling for authentication
    startAuthPolling(email);
    
  } catch (error) {
    loginError.textContent = error.message;
    loginError.style.display = 'block';
  } finally {
    btnText.style.display = 'block';
    btnLoader.style.display = 'none';
    loginBtn.disabled = false;
  }
});

// Poll for authentication completion
function startAuthPolling(email) {
  const pollInterval = setInterval(async () => {
    try {
      // Check if user has authenticated by trying to get their profile
      const { authToken } = await chrome.storage.local.get('authToken');
      
      if (authToken) {
        // User has authenticated, stop polling and show main view
        clearInterval(pollInterval);
        showMainView();
        loadCurrentJobData();
        return;
      }
      
      // Check if magic link has been used
      const response = await fetch(`${API_BASE_URL}/api/auth/check-magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          // Store auth token and stop polling
          await chrome.storage.local.set({ authToken: data.token });
          clearInterval(pollInterval);
          showMainView();
          loadCurrentJobData();
        }
      }
    } catch (error) {
      console.error('Auth polling error:', error);
    }
  }, 2000); // Poll every 2 seconds
  
  // Stop polling after 5 minutes
  setTimeout(() => {
    clearInterval(pollInterval);
  }, 300000);
}

// Handle logout
logoutBtn.addEventListener('click', async () => {
  await chrome.storage.local.remove('authToken');
  showLoginView();
  loginForm.reset();
});

// Load current job data from background script
async function loadCurrentJobData() {
  try {
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_DATA' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message to background:', chrome.runtime.lastError);
        showNoJobState();
        return;
      }
      if (response && response.jobData && response.analysis) {
        displayJobAnalysis(response.jobData, response.analysis);
      } else {
        showNoJobState();
      }
    });
  } catch (error) {
    console.error('Error loading current job data:', error);
    showNoJobState();
  }
}

// Show no job state
function showNoJobState() {
  noJobState.style.display = 'block';
  jobAnalysisState.style.display = 'none';
}

// Display job analysis
function displayJobAnalysis(jobData, analysis) {
  noJobState.style.display = 'none';
  jobAnalysisState.style.display = 'block';
  
  // Job info
  document.getElementById('job-title').textContent = jobData.title;
  document.getElementById('job-company').textContent = jobData.company;
  
  // Show cache warning if using cached data
  if (analysis.cached) {
    showCacheWarning(analysis.cacheWarning);
  } else {
    hideCacheWarning();
  }
  
  // Match score
  const score = analysis.matchScore || 0;
  const scoreValue = document.getElementById('score-value');
  const scoreCircle = document.getElementById('score-circle');
  scoreValue.textContent = score;
  
  // Set score color
  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  scoreCircle.style.borderColor = scoreColor;
  
  // Matching skills
  const matchingSkillsContainer = document.getElementById('matching-skills');
  if (analysis.matchingSkills && analysis.matchingSkills.length > 0) {
    matchingSkillsContainer.innerHTML = analysis.matchingSkills
      .map(skill => `<span class="skill-badge skill-match">${skill}</span>`)
      .join('');
  } else {
    matchingSkillsContainer.innerHTML = '<p class="loading-text">No matching skills found</p>';
  }
  
  // Missing skills
  const missingSkillsContainer = document.getElementById('missing-skills');
  if (analysis.missingSkills && analysis.missingSkills.length > 0) {
    missingSkillsContainer.innerHTML = analysis.missingSkills
      .map(skill => `<span class="skill-badge skill-gap">${skill}</span>`)
      .join('');
  } else {
    missingSkillsContainer.innerHTML = '<p class="loading-text">No skills gaps identified</p>';
  }
  
  // Recommendations
  const recommendationsContainer = document.getElementById('recommendations');
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    recommendationsContainer.innerHTML = analysis.recommendations
      .map(rec => `<div class="recommendation-item">${rec}</div>`)
      .join('');
  } else {
    recommendationsContainer.innerHTML = '<p class="loading-text">No recommendations available</p>';
  }
}

// Show cache warning
function showCacheWarning(message) {
  let warningElement = document.getElementById('cache-warning');
  if (!warningElement) {
    warningElement = document.createElement('div');
    warningElement.id = 'cache-warning';
    warningElement.className = 'cache-warning';
    jobAnalysisState.insertBefore(warningElement, jobAnalysisState.firstChild);
  }
  
  warningElement.innerHTML = `
    <div class="cache-warning-content">
      <span class="cache-icon">📡</span>
      <span class="cache-text">${message || 'Using cached data'}</span>
      <button class="cache-refresh-btn" id="refresh-analysis">Refresh</button>
    </div>
  `;
  
  warningElement.style.display = 'block';
  
  // Add refresh functionality
  document.getElementById('refresh-analysis')?.addEventListener('click', () => {
    refreshAnalysis();
  });
}

// Hide cache warning
function hideCacheWarning() {
  const warningElement = document.getElementById('cache-warning');
  if (warningElement) {
    warningElement.style.display = 'none';
  }
}

// Refresh analysis
async function refreshAnalysis() {
  const refreshBtn = document.getElementById('refresh-analysis');
  if (refreshBtn) {
    refreshBtn.textContent = 'Refreshing...';
    refreshBtn.disabled = true;
  }
  
  // Clear cache for current job
  try {
    chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error clearing cache:', chrome.runtime.lastError);
      }
      // Reload current job data
      loadCurrentJobData();
    });
  } catch (error) {
    console.error('Error refreshing analysis:', error);
    loadCurrentJobData();
  }
}

// View full analysis on dashboard
viewFullBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://34.134.208.48:3000/dashboard' });
});

// Settings functionality
const notificationsToggle = document.getElementById('notifications-toggle');

// Load settings
async function loadSettings() {
  const { notificationsEnabled } = await chrome.storage.local.get('notificationsEnabled');
  notificationsToggle.checked = notificationsEnabled !== false; // Default to true
}

// Save settings
notificationsToggle.addEventListener('change', async () => {
  await chrome.storage.local.set({ 
    notificationsEnabled: notificationsToggle.checked 
  });
});

// Initialize
init();
loadSettings();
