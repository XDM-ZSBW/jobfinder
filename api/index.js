// Vercel serverless function handler
// This wraps the Express app for Vercel's serverless function runtime

// Log module resolution paths for debugging
console.log('🔍 Module resolution debug:');
console.log('  __dirname:', __dirname);
console.log('  process.cwd():', process.cwd());
console.log('  NODE_PATH:', process.env.NODE_PATH || 'not set');
console.log('  Module paths:', require.resolve.paths('express') || 'cannot resolve');

let app;
try {
  // Import the Express app from the built backend
  // Try multiple paths in order of preference
  let backendApp;
  const paths = [
    './backend-index.js',           // Direct copy in api/ (most reliable)
    './backend-dist/index.js',      // Copied directory
    '../backend/dist/index.js'      // Original location (fallback)
  ];
  
  let loaded = false;
  for (const path of paths) {
    try {
      console.log(`📦 Attempting to require ${path}`);
      backendApp = require(path);
      console.log(`✅ Successfully loaded from ${path}`);
      loaded = true;
      break;
    } catch (e) {
      console.log(`⚠️ Failed to load from ${path}:`, e.message);
    }
  }
  
  if (!loaded) {
    throw new Error('Could not load backend/dist/index.js from any path');
  }
  
  // Get the Express app (it's exported as .app in CommonJS)
  app = backendApp.app || backendApp.default || backendApp;
  
  if (!app) {
    throw new Error('Express app not found in backend/dist/index.js');
  }
  
  console.log('✅ Express app loaded successfully');
  console.log('App type:', typeof app);
  console.log('App is function?', typeof app === 'function');
  console.log('App has use method?', typeof app.use === 'function');
  console.log('App has listen method?', typeof app.listen === 'function');
} catch (error) {
  console.error('❌ Error loading Express app:', error);
  console.error('Error stack:', error.stack);
  console.error('Error message:', error.message);
  console.error('Error code:', error.code);
  console.error('Error name:', error.name);
  // Log more details about the error
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('MODULE_NOT_FOUND - Missing module:', error.message);
    console.error('Tried paths:', error.path || 'unknown');
  }
  // Fallback handler that returns error TwiML
  app = (req, res) => {
    if (req.path && req.path.startsWith('/api/voice')) {
      const errorTwiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say language="en-US" voice="Polly.Joanna-Neural">We apologize, but we are experiencing technical difficulties. Please try again later.</Say>\n</Response>';
      // Use setHeader for Vercel compatibility (not res.set)
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.status(200).send(errorTwiml);
    } else {
      res.status(500).json({ error: 'Internal server error', message: 'Failed to load application' });
    }
  };
}

// Vercel serverless function handler
// Export as a handler function that receives (req, res)
module.exports = (req, res) => {
  console.log('🚀 API handler called');
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  console.log('App loaded?', !!app);
  console.log('App type:', typeof app);
  
  try {
    // Check if app is loaded
    if (!app) {
      throw new Error('Express app not loaded');
    }
    
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
    
    console.log('Delegating to Express app with path:', req.path);
    
    // Delegate to Express app
    return app(req, res);
  } catch (error) {
    console.error('❌ Error in API handler:', error);
    console.error('Error stack:', error.stack);
    console.error('Request URL:', req.url);
    console.error('Request path:', req.path);
    console.error('Request method:', req.method);
    
    // If it's a voice route, return TwiML error
    const path = req.path || req.url || '';
    if (path.startsWith('/api/voice') || path.includes('/voice/incoming')) {
      const errorTwiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say language="en-US" voice="Polly.Joanna-Neural">We apologize, but we are experiencing technical difficulties. Please try again later.</Say>\n</Response>';
      // Use setHeader for Vercel compatibility (not res.set)
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.status(200).send(errorTwiml);
    } else {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
};

