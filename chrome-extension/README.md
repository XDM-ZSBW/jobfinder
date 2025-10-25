# JobMatch AI Chrome Extension

AI-powered job matching assistant for LinkedIn job postings.

## Features

- 🎯 **Real-time Job Analysis**: Automatically analyzes LinkedIn job postings as you browse
- 📊 **Match Scoring**: Calculates compatibility score based on your resume
- 💡 **Smart Insights**: Identifies matching skills, skill gaps, and provides recommendations
- 🔒 **Secure Authentication**: Integrates with your JobMatch AI account
- ⚡ **Instant Widget**: Shows match score directly on LinkedIn job pages

## Installation

### Step 1: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder from this project

### Step 2: Create Icons (Temporary)

Since we don't have icon files yet, you need to create placeholder icon files or the extension won't load:

**Option A: Create simple placeholder PNGs** (recommended for testing)
- Create three files in `chrome-extension/icons/`:
  - `icon16.png` (16x16 pixels)
  - `icon48.png` (48x48 pixels)
  - `icon128.png` (128x128 pixels)

**Option B: Use online icon generator**
- Visit https://www.favicon-generator.org/
- Upload any image
- Download generated icons
- Rename and place them in `chrome-extension/icons/`

### Step 3: Login and Use

1. Click the extension icon in Chrome toolbar
2. Log in with your JobMatch AI credentials
3. Navigate to any LinkedIn job posting (e.g., https://www.linkedin.com/jobs/view/...)
4. The extension will automatically analyze the job and display match results

## How It Works

1. **Content Script**: Scrapes job data from LinkedIn pages
2. **Background Worker**: Communicates with JobMatch AI backend API
3. **Popup Interface**: Shows detailed analysis and login interface
4. **Widget Overlay**: Displays quick match score on LinkedIn pages

## API Endpoints Used

- `POST /api/auth/login` - Authentication
- `POST /api/jobs/analyze` - Job analysis
- `POST /api/jobs/match` - Match score calculation
- `GET /api/users/me` - User profile

## Configuration

The extension is configured to connect to:
- Backend API: `http://34.134.208.48:4000`
- Frontend Dashboard: `http://34.134.208.48:3000`

To change these URLs, edit:
- `scripts/background.js` (API_BASE_URL)
- `popup/popup.js` (API_BASE_URL)
- `manifest.json` (host_permissions)

## Troubleshooting

### Extension won't load
- Make sure all icon files exist in `chrome-extension/icons/`
- Check Chrome DevTools Console for errors

### Can't login
- Verify backend API is running: `http://34.134.208.48:4000/api/health`
- Check network requests in Chrome DevTools

### Not detecting LinkedIn jobs
- Make sure you're on a job detail page (URL contains `/jobs/view/`)
- Check content script is injecting (view page source in DevTools)

### Widget not appearing
- Open browser console and look for errors
- Verify authentication is successful
- Try refreshing the LinkedIn page

## Development

To modify the extension:

1. Edit files in `chrome-extension/`
2. Go to `chrome://extensions/`
3. Click the reload icon on the JobMatch AI extension
4. Test changes on LinkedIn

## Security

- Authentication tokens are stored securely in Chrome local storage
- All API requests use HTTPS (in production)
- No sensitive data is logged or stored locally

## Future Enhancements

- [ ] Support for more job sites (Indeed, Glassdoor, etc.)
- [ ] Offline caching of analysis results
- [ ] Browser notifications for high-match jobs
- [ ] Save jobs directly from extension
- [ ] Generate custom cover letters
