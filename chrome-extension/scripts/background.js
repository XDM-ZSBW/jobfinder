// JobMatch AI - Background Service Worker

const API_BASE_URL = 'http://34.134.208.48:4000';

// Store current job data and analysis
let currentJobData = null;
let currentAnalysis = null;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'JOB_DATA_SCRAPED') {
    handleJobDataScraped(message.data, sender.tab.id);
  } else if (message.type === 'OPEN_POPUP') {
    chrome.action.openPopup();
  }
  return true;
});

// Handle scraped job data
async function handleJobDataScraped(jobData, tabId) {
  currentJobData = jobData;
  
  try {
    // Get auth token from storage
    const { authToken } = await chrome.storage.local.get('authToken');
    
    if (!authToken) {
      sendMessageToTab(tabId, {
        type: 'MATCH_ERROR',
        error: 'Please log in to JobMatch AI'
      });
      return;
    }

    // Analyze job with backend API
    const analysis = await analyzeJob(jobData, authToken);
    currentAnalysis = analysis;

    // Send results back to content script
    sendMessageToTab(tabId, {
      type: 'MATCH_RESULT',
      data: {
        matchScore: analysis.matchScore,
        insights: extractInsights(analysis)
      }
    });

    // Show notification for high-match jobs
    if (analysis.matchScore >= 80) {
      showHighMatchNotification(jobData, analysis.matchScore);
    }
  } catch (error) {
    console.error('Error analyzing job:', error);
    sendMessageToTab(tabId, {
      type: 'MATCH_ERROR',
      error: error.message || 'Failed to analyze job'
    });
  }
}

// Analyze job with backend API
async function analyzeJob(jobData, authToken) {
  try {
    // Check if we have cached analysis for this job
    const cacheKey = `job_analysis_${hashJobData(jobData)}`;
    const cachedAnalysis = await getCachedAnalysis(cacheKey);
    
    if (cachedAnalysis && !isCacheExpired(cachedAnalysis.timestamp)) {
      console.log('Using cached job analysis');
      return cachedAnalysis.data;
    }

    // First, analyze the job posting
    const jobAnalysisResponse = await fetch(`${API_BASE_URL}/api/jobs/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        description: jobData.description,
        title: jobData.title,
        company: jobData.company
      })
    });

    if (!jobAnalysisResponse.ok) {
      if (jobAnalysisResponse.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (jobAnalysisResponse.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      } else if (jobAnalysisResponse.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      const error = await jobAnalysisResponse.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || 'Failed to analyze job');
    }

    const jobAnalysis = await jobAnalysisResponse.json();

    // Get user's resume/profile
    const profileResponse = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!profileResponse.ok) {
      if (profileResponse.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error('Failed to fetch user profile');
    }

    const profile = await profileResponse.json();

    // Calculate match score
    const matchResponse = await fetch(`${API_BASE_URL}/api/jobs/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        jobDescription: jobData.description,
        resumeText: profile.resume || ''
      })
    });

    if (!matchResponse.ok) {
      if (matchResponse.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (matchResponse.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      } else if (matchResponse.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      throw new Error('Failed to calculate match score');
    }

    const matchResult = await matchResponse.json();

    const analysisResult = {
      ...jobAnalysis,
      ...matchResult,
      jobData,
      timestamp: Date.now()
    };

    // Cache the analysis result
    await cacheAnalysis(cacheKey, analysisResult);

    return analysisResult;
  } catch (error) {
    console.error('Job analysis error:', error);
    
    // If it's a network error, try to return cached data
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      const cacheKey = `job_analysis_${hashJobData(jobData)}`;
      const cachedAnalysis = await getCachedAnalysis(cacheKey);
      
      if (cachedAnalysis) {
        console.log('Using cached analysis due to network error');
        return {
          ...cachedAnalysis.data,
          cached: true,
          cacheWarning: 'Using cached data due to connection issues'
        };
      }
    }
    
    throw error;
  }
}

// Extract key insights from analysis
function extractInsights(analysis) {
  const insights = [];

  if (analysis.matchScore >= 80) {
    insights.push('🎯 Excellent match! Your skills align well with this role.');
  } else if (analysis.matchScore >= 60) {
    insights.push('👍 Good match with some development areas.');
  } else {
    insights.push('⚠️ This role may require additional skills.');
  }

  if (analysis.requiredSkills && analysis.requiredSkills.length > 0) {
    const topSkills = analysis.requiredSkills.slice(0, 3).join(', ');
    insights.push(`💼 Key skills: ${topSkills}`);
  }

  if (analysis.missingSkills && analysis.missingSkills.length > 0) {
    const missingCount = analysis.missingSkills.length;
    insights.push(`📚 ${missingCount} skill gap${missingCount > 1 ? 's' : ''} identified`);
  }

  if (analysis.experienceLevel) {
    insights.push(`📊 Experience level: ${analysis.experienceLevel}`);
  }

  return insights.slice(0, 4); // Limit to 4 insights
}

// Send message to specific tab
function sendMessageToTab(tabId, message) {
  chrome.tabs.sendMessage(tabId, message).catch(error => {
    console.error('Error sending message to tab:', error);
  });
}

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('JobMatch AI extension installed');
});

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.notifications.clear(notificationId);
  
  // Open the popup to show analysis
  chrome.action.openPopup();
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  chrome.notifications.clear(notificationId);
  
  if (buttonIndex === 0) {
    // View Analysis - open popup
    chrome.action.openPopup();
  } else if (buttonIndex === 1) {
    // Apply Now - open LinkedIn job page
    if (currentJobData && currentJobData.url) {
      chrome.tabs.create({ url: currentJobData.url });
    }
  }
});

// Provide current data to popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_CURRENT_DATA') {
    sendResponse({
      jobData: currentJobData,
      analysis: currentAnalysis
    });
  } else if (message.type === 'CLEAR_CACHE') {
    clearCurrentJobCache();
    sendResponse({ success: true });
  }
  return true;
});

// Show notification for high-match jobs
function showHighMatchNotification(jobData, matchScore) {
  // Check if notifications are enabled
  chrome.storage.local.get(['notificationsEnabled'], (result) => {
    if (result.notificationsEnabled !== false) { // Default to true
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: '🎯 High Match Job Found!',
        message: `${jobData.title} at ${jobData.company} - ${matchScore}% match`,
        buttons: [
          { title: 'View Analysis' },
          { title: 'Apply Now' }
        ],
        priority: 1
      });
    }
  });
}

// Clear cache for current job
async function clearCurrentJobCache() {
  if (currentJobData) {
    const cacheKey = `job_analysis_${hashJobData(currentJobData)}`;
    await chrome.storage.local.remove(cacheKey);
    console.log('Cleared cache for current job');
  }
}

// Cache management functions
function hashJobData(jobData) {
  // Create a simple hash of job data for cache key
  const key = `${jobData.title}_${jobData.company}_${jobData.url}`;
  return btoa(key).replace(/[^a-zA-Z0-9]/g, '');
}

async function getCachedAnalysis(cacheKey) {
  try {
    const result = await chrome.storage.local.get(cacheKey);
    return result[cacheKey] || null;
  } catch (error) {
    console.error('Error getting cached analysis:', error);
    return null;
  }
}

async function cacheAnalysis(cacheKey, analysisData) {
  try {
    const cacheData = {
      data: analysisData,
      timestamp: Date.now()
    };
    await chrome.storage.local.set({ [cacheKey]: cacheData });
    
    // Clean up old cache entries (keep only last 50)
    await cleanupCache();
  } catch (error) {
    console.error('Error caching analysis:', error);
  }
}

function isCacheExpired(timestamp) {
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  return Date.now() - timestamp > CACHE_DURATION;
}

async function cleanupCache() {
  try {
    const allData = await chrome.storage.local.get();
    const cacheEntries = Object.entries(allData)
      .filter(([key]) => key.startsWith('job_analysis_'))
      .map(([key, value]) => ({ key, timestamp: value.timestamp }))
      .sort((a, b) => b.timestamp - a.timestamp);
    
    // Keep only the 50 most recent entries
    if (cacheEntries.length > 50) {
      const toDelete = cacheEntries.slice(50).map(entry => entry.key);
      await chrome.storage.local.remove(toDelete);
    }
  } catch (error) {
    console.error('Error cleaning up cache:', error);
  }
}
