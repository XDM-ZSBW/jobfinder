// JobMatch AI - LinkedIn Job Scraper Content Script

console.log('✅ [JobMatch] Content script loaded');

class LinkedInJobScraper {
  constructor() {
    console.log('✅ [JobMatch] LinkedInJobScraper initialized');
    this.jobData = null;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.init();
  }

  init() {
    console.log('✅ [JobMatch] Initializing scraper on URL:', window.location.href);
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
        console.log('🌐 [JobMatch] URL changed, waiting 3 seconds for page to load...');
        setTimeout(() => {
          console.log('🔄 [JobMatch] Starting job scrape after URL change');
          this.scrapeJob();
        }, 3000);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  scrapeJob() {
    console.log('🔍 [JobMatch] Starting job scrape...');
    
    if (!this.isJobPage()) {
      console.log('⚠️ [JobMatch] Not a job page, removing widget');
      this.removeMatchWidget();
      return;
    }

    const jobData = this.extractJobData();
    if (jobData && this.hasRequiredFields(jobData)) {
      console.log('✅ [JobMatch] Job data extracted successfully:', {
        title: jobData.title,
        company: jobData.company
      });
      this.jobData = jobData;
      this.sendToBackground(jobData);
      this.injectMatchWidget();
    } else {
      console.log('⚠️ [JobMatch] Job data incomplete or missing required fields');
    }
  }

  isJobPage() {
    // Check if we're on a LinkedIn job details page (not search/listing pages)
    const url = window.location.href;
    
    // Must have /jobs/ in the URL and be a specific job view (not the main jobs page)
    const isJobDetailsPage = url.includes('/jobs/') && 
                             !url.endsWith('/jobs/') && // Not the main jobs listing page
                             (url.includes('/view/') || // Individual job view
                              url.includes('/collections/') || // Collections
                              document.querySelector('.jobs-details') || // Job details container
                              document.querySelector('.jobs-unified-top-card') || // Job top card
                              document.querySelector('[data-job-id]')); // Job ID data attribute
    
    console.log('🔍 [JobMatch] isJobPage check:', { url, isJobDetailsPage });
    return isJobDetailsPage;
  }

  extractJobData() {
    try {
      console.log('🔍 [JobMatch] Extracting job data...');
      
      // Extract job title - try multiple selectors
      const title = this.getTextContent([
        '.job-details-jobs-unified-top-card__job-title',
        '.jobs-unified-top-card__job-title',
        'h1.jobs-details-top-card__job-title-text',
        'h1.job-details-jobs-unified-top-card__job-title-link',
        'h1.t-24'
      ]);
      console.log('📋 [JobMatch] Title:', title);

      // Extract company name
      const company = this.getTextContent([
        '.job-details-jobs-unified-top-card__company-name',
        '.jobs-unified-top-card__company-name',
        '.jobs-unified-top-card__subtitle-primary-grouping a',
        '.jobs-details-top-card__company-name'
      ]);
      console.log('🏢 [JobMatch] Company:', company);

      // Extract location
      const location = this.getTextContent([
        '.job-details-jobs-unified-top-card__bullet',
        '.jobs-unified-top-card__bullet',
        '.jobs-unified-top-card__subtitle-primary-grouping span',
        '.jobs-details-top-card__location'
      ]);
      console.log('📍 [JobMatch] Location:', location);

      // Extract job description - try multiple selectors
      const description = this.getTextContent([
        '.jobs-description-content__text',
        '.jobs-box__html-content',
        '#job-details',
        'div.jobs-box__html-content',
        'div.jobs-description-content__text'
      ]);
      console.log('📄 [JobMatch] Description length:', description?.length || 0);

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
    const hasFields = jobData.title && jobData.description;
    console.log('✅ [JobMatch] Required fields check:', {
      title: !!jobData.title,
      description: !!jobData.description,
      company: !!jobData.company,
      hasFields
    });
    return hasFields;
  }

  async sendToBackground(jobData) {
    // Check retry count
    if (this.retryCount >= this.maxRetries) {
      console.error('❌ [JobMatch] Max retries reached, showing error to user');
      this.displayError('Extension reloaded. Please refresh this page to continue.');
      return;
    }
    
    console.log('📤 [JobMatch] Sending job data to background script:', {
      title: jobData.title,
      company: jobData.company,
      descriptionLength: jobData.description?.length
    });
    
    // Check if chrome.runtime is available
    if (!chrome.runtime) {
      console.error('❌ [JobMatch] chrome.runtime is not available');
      this.displayError('Extension not loaded properly. Please reload the extension.');
      return;
    }
    
    console.log('🔍 [JobMatch] chrome.runtime is available, sending message...');
    
    try {
      chrome.runtime.sendMessage({
        type: 'JOB_DATA_SCRAPED',
        data: jobData
      }, (response) => {
        if (chrome.runtime.lastError) {
          const errorMsg = chrome.runtime.lastError.message;
          console.error('❌ [JobMatch] Error sending job data to background:', errorMsg);
          
          // Retry after a short delay if context was invalidated and we haven't exceeded max retries
          if (errorMsg.includes('Extension context invalidated')) {
            this.retryCount++;
            console.log(`🔄 [JobMatch] Context invalidated, retrying in 2 seconds... (${this.retryCount}/${this.maxRetries})`);
            setTimeout(() => {
              this.sendToBackground(jobData);
            }, 2000);
          }
        } else {
          console.log('✅ [JobMatch] Successfully sent job data to background');
          this.retryCount = 0; // Reset retry count on success
        }
      });
    } catch (error) {
      console.error('❌ [JobMatch] Error sending to background:', error);
      
      // Retry if context was invalidated and we haven't exceeded max retries
      if (error.message && error.message.includes('Extension context invalidated')) {
        this.retryCount++;
        if (this.retryCount < this.maxRetries) {
          console.log(`🔄 [JobMatch] Retrying after context invalidation... (${this.retryCount}/${this.maxRetries})`);
          setTimeout(() => {
            this.sendToBackground(jobData);
          }, 2000);
        }
      }
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

    const score = data.qualityScore || data.matchScore || 0;
    const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
    
    // Show cache warning if using cached data
    const cacheWarning = data.cached ? `
      <div class="jobmatch-cache-warning">
        <span class="cache-icon">📡</span>
        <span class="cache-text">${data.cacheWarning || 'Using cached data'}</span>
      </div>
    ` : '';

    // Show red flags if any
    const redFlagsHtml = data.redFlags && data.redFlags.length > 0 ? `
      <div class="jobmatch-warning">
        <h4>⚠️ Red Flags</h4>
        <ul>
          ${data.redFlags.map(flag => `<li>${flag}</li>`).join('')}
        </ul>
      </div>
    ` : '';

    // Show suggestions if any
    const suggestionsHtml = data.suggestions && data.suggestions.length > 0 ? `
      <div class="jobmatch-suggestions">
        <h4>💡 Suggestions</h4>
        <ul>
          ${data.suggestions.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
    ` : '';

    content.innerHTML = `
      ${cacheWarning}
      <div class="jobmatch-score">
        <div class="score-circle" style="border-color: ${scoreColor}">
          <span class="score-value">${score}</span>
          <span class="score-label">Quality</span>
        </div>
      </div>
      ${redFlagsHtml}
      ${suggestionsHtml}
      ${data.requiredSkills && data.requiredSkills.length > 0 ? `
        <div class="jobmatch-skills">
          <h4>Required Skills</h4>
          <div class="skill-tags">
            ${data.requiredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </div>
      ` : ''}
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

