// Vercel serverless function handler
// This wraps the Express app for Vercel's serverless function runtime

let app;
try {
  // Import the Express app from the built backend
  // The compiled JS uses CommonJS exports, so we use .app
  const backendApp = require('../backend/dist/index.js');
  
  // Get the Express app (it's exported as .app in CommonJS)
  app = backendApp.app || backendApp.default || backendApp;
  
  if (!app) {
    throw new Error('Express app not found in backend/dist/index.js');
  }
} catch (error) {
  console.error('Error loading Express app:', error);
  // Fallback handler that returns error TwiML
  app = (req, res) => {
    if (req.path && req.path.startsWith('/api/voice')) {
      const errorTwiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say language="en-US" voice="Polly.Joanna-Neural">We apologize, but we are experiencing technical difficulties. Please try again later.</Say>\n</Response>';
      res.set('Content-Type', 'application/xml; charset=utf-8');
      res.status(200).send(errorTwiml);
    } else {
      res.status(500).json({ error: 'Internal server error', message: 'Failed to load application' });
    }
  };
}

// Vercel serverless function handler
// Export as a handler function that receives (req, res)
module.exports = (req, res) => {
  try {
    // Vercel provides the URL in req.url, but Express needs req.path
    // Extract path from URL if not already set
    if (!req.path && req.url) {
      // Remove query string for path extraction
      const urlPath = req.url.split('?')[0];
      req.path = urlPath;
    }
    
    // Ensure Express can handle the request properly
    // Vercel's request object is compatible with Express, but we need to ensure path is set
    if (!req.path) {
      req.path = req.url || '/';
    }
    
    // Delegate to Express app
    return app(req, res);
  } catch (error) {
    console.error('Error in API handler:', error);
    console.error('Request URL:', req.url);
    console.error('Request path:', req.path);
    console.error('Request method:', req.method);
    
    // If it's a voice route, return TwiML error
    const path = req.path || req.url || '';
    if (path.startsWith('/api/voice') || path.includes('/voice/incoming')) {
      const errorTwiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say language="en-US" voice="Polly.Joanna-Neural">We apologize, but we are experiencing technical difficulties. Please try again later.</Say>\n</Response>';
      res.set('Content-Type', 'application/xml; charset=utf-8');
      res.status(200).send(errorTwiml);
    } else {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
};

