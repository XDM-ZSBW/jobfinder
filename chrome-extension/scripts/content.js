// JobMatch AI - LinkedIn Job Scraper Content Script

class LinkedInJobScraper {
  constructor() {
    this.jobData = null;
    this.init();
  }

  init() {
    // Wait for page to load completely
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.scrapeJob());
    } else {
      this.scrapeJob();
    }

    // Listen for URL changes (SPA navigation)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(() => this.scrapeJob(), 1000);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  scrapeJob() {
    if (!this.isJobPage()) {
      this.removeMatchWidget();
      return;
    }

    const jobData = this.extractJobData();
    if (jobData && this.hasRequiredFields(jobData)) {
      this.jobData = jobData;
      this.sendToBackground(jobData);
      this.injectMatchWidget();
    }
  }

  isJobPage() {
    return window.location.href.includes('/jobs/view/') || 
           window.location.href.includes('/jobs/collections/');
  }

  extractJobData() {
    try {
      // Extract job title
      const title = this.getTextContent([
        '.job-details-jobs-unified-top-card__job-title',
        '.jobs-unified-top-card__job-title',
        'h1.t-24'
      ]);

      // Extract company name
      const company = this.getTextContent([
        '.job-details-jobs-unified-top-card__company-name',
        '.jobs-unified-top-card__company-name',
        '.jobs-unified-top-card__subtitle-primary-grouping a'
      ]);

      // Extract location
      const location = this.getTextContent([
        '.job-details-jobs-unified-top-card__bullet',
        '.jobs-unified-top-card__bullet',
        '.jobs-unified-top-card__subtitle-primary-grouping span'
      ]);

      // Extract job description
      const description = this.getTextContent([
        '.jobs-description-content__text',
        '.jobs-box__html-content',
        '#job-details'
      ]);

      // Extract job type (full-time, part-time, etc.)
      const jobType = this.extractJobType();

      // Extract salary if available
      const salary = this.getTextContent([
        '.job-details-jobs-unified-top-card__job-insight--highlight',
        '.mt5 .job-details-jobs-unified-top-card__job-insight'
      ]);

      // Get job URL
      const url = window.location.href;

      return {
        title: title || 'Unknown Title',
        company: company || 'Unknown Company',
        location: location || 'Unknown Location',
        description: description || '',
        jobType: jobType || 'Not specified',
        salary: salary || 'Not specified',
        url: url,
        scrapedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error scraping job data:', error);
      return null;
    }
  }

  getTextContent(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent.trim();
      }
    }
    return null;
  }

  extractJobType() {
    const insights = document.querySelectorAll('.jobs-unified-top-card__job-insight');
    for (const insight of insights) {
      const text = insight.textContent.toLowerCase();
      if (text.includes('full-time') || text.includes('part-time') || 
          text.includes('contract') || text.includes('internship')) {
        return insight.textContent.trim();
      }
    }
    return null;
  }

  hasRequiredFields(jobData) {
    return jobData.title && jobData.company && jobData.description;
  }

  sendToBackground(jobData) {
    try {
      chrome.runtime.sendMessage({
        type: 'JOB_DATA_SCRAPED',
        data: jobData
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending job data to background:', chrome.runtime.lastError);
        }
      });
    } catch (error) {
      console.error('Error sending to background:', error);
    }
  }

  injectMatchWidget() {
    // Remove existing widget if present
    this.removeMatchWidget();

    const widgetHtml = `
      <div id="jobmatch-widget" class="jobmatch-widget">
        <div class="jobmatch-header">
          <span class="jobmatch-logo">🎯 JobMatch AI</span>
          <button class="jobmatch-close" id="jobmatch-close">×</button>
        </div>
        <div class="jobmatch-content">
          <div class="jobmatch-loading">
            <div class="jobmatch-spinner"></div>
            <p>Analyzing job match...</p>
          </div>
        </div>
      </div>
    `;

    const widgetContainer = document.createElement('div');
    widgetContainer.innerHTML = widgetHtml;
    document.body.appendChild(widgetContainer.firstElementChild);

    // Add close button listener
    document.getElementById('jobmatch-close')?.addEventListener('click', () => {
      this.removeMatchWidget();
    });

    // Listen for match results from background script
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'MATCH_RESULT') {
        this.displayMatchResult(message.data);
      } else if (message.type === 'MATCH_ERROR') {
        this.displayError(message.error);
      }
    });
  }

  displayMatchResult(data) {
    const widget = document.getElementById('jobmatch-widget');
    if (!widget) return;

    const content = widget.querySelector('.jobmatch-content');
    if (!content) return;

    const score = data.matchScore || 0;
    const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
    
    // Show cache warning if using cached data
    const cacheWarning = data.cached ? `
      <div class="jobmatch-cache-warning">
        <span class="cache-icon">📡</span>
        <span class="cache-text">${data.cacheWarning || 'Using cached data'}</span>
      </div>
    ` : '';

    content.innerHTML = `
      ${cacheWarning}
      <div class="jobmatch-score">
        <div class="score-circle" style="border-color: ${scoreColor}">
          <span class="score-value">${score}</span>
          <span class="score-label">Match</span>
        </div>
      </div>
      <div class="jobmatch-insights">
        <h3>Key Insights</h3>
        <ul>
          ${data.insights?.map(insight => `<li>${insight}</li>`).join('') || '<li>No insights available</li>'}
        </ul>
      </div>
      <button class="jobmatch-details-btn" id="jobmatch-details">View Full Analysis</button>
    `;

    document.getElementById('jobmatch-details')?.addEventListener('click', () => {
      try {
        chrome.runtime.sendMessage({ type: 'OPEN_POPUP' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message to background:', chrome.runtime.lastError);
          }
        });
      } catch (error) {
        console.error('Error opening popup:', error);
      }
    });
  }

  displayError(error) {
    const widget = document.getElementById('jobmatch-widget');
    if (!widget) return;

    const content = widget.querySelector('.jobmatch-content');
    if (!content) return;

    // Determine error type and provide appropriate messaging
    let errorIcon = '⚠️';
    let errorTitle = 'Analysis Failed';
    let errorMessage = error || 'Failed to analyze job';
    let errorHint = 'Please make sure you\'re logged in to JobMatch AI';

    if (error.includes('Authentication failed')) {
      errorIcon = '🔐';
      errorTitle = 'Login Required';
      errorHint = 'Click the extension icon to log in';
    } else if (error.includes('Too many requests')) {
      errorIcon = '⏰';
      errorTitle = 'Rate Limited';
      errorHint = 'Please wait a moment before trying again';
    } else if (error.includes('Server error')) {
      errorIcon = '🔧';
      errorTitle = 'Server Issue';
      errorHint = 'Our servers are experiencing issues. Please try again later';
    } else if (error.includes('fetch') || error.includes('network')) {
      errorIcon = '📡';
      errorTitle = 'Connection Error';
      errorHint = 'Check your internet connection and try again';
    }

    content.innerHTML = `
      <div class="jobmatch-error">
        <span class="error-icon">${errorIcon}</span>
        <div class="error-title">${errorTitle}</div>
        <div class="error-message">${errorMessage}</div>
        <div class="error-hint">${errorHint}</div>
        <button class="jobmatch-retry-btn" id="jobmatch-retry">Try Again</button>
      </div>
    `;

    document.getElementById('jobmatch-retry')?.addEventListener('click', () => {
      this.scrapeJob();
    });
  }

  removeMatchWidget() {
    const widget = document.getElementById('jobmatch-widget');
    if (widget) {
      widget.remove();
    }
  }
}

// Initialize scraper
const scraper = new LinkedInJobScraper();
