import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Generate TwiML response for Twilio with ElevenLabs voice via ConversationRelay.
 * 
 * Note: WebSockets are not supported on Vercel serverless functions.
 * This implementation uses Twilio's <Say> verb as a fallback.
 * For full ConversationRelay support, deploy to Cloud Run.
 */
function generateTwiMLResponse(
  message: string,
  useConversationRelay: boolean = false,
  websocketUrl?: string
): string {
  const elevenlabsVoice = 'NYC9WEgkq1u4jiqBseQ9-turbo_v2_5-0.8_0.8_0.6';
  
  let twiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n';
  
  if (useConversationRelay && websocketUrl) {
    // Use ConversationRelay with ElevenLabs (requires WebSocket support)
    // Note: This won't work on Vercel serverless functions
    twiml += '  <Connect>\n';
    twiml += `    <ConversationRelay url="${websocketUrl}" `;
    twiml += 'ttsProvider="ElevenLabs" ';
    twiml += `voice="${elevenlabsVoice}" `;
    twiml += 'enableAutopilot="false" ';
    twiml += 'enableVoiceActivityDetection="true" />\n';
    twiml += '  </Connect>\n';
  } else {
    // Fallback to Say with Polly (works on Vercel)
    const voiceAttrs = 'language="en-US" voice="Polly.Joanna-Neural"';
    twiml += `  <Say ${voiceAttrs}>${escapeXml(message)}</Say>\n`;
  }
  
  twiml += '</Response>';
  return twiml;
}

/**
 * Escape XML special characters for TwiML
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Handle incoming Twilio voice calls.
 * Twilio webhook URL: https://jobmatch.zip/api/voice/incoming
 */
router.post('/incoming', (req: Request, res: Response) => {
  try {
    const { From, To, CallSid, CallStatus } = req.body;
    
    // Log safely (don't fail if logger has issues)
    try {
      logger.info(`Incoming call - From: ${From}, To: ${To}, CallSid: ${CallSid}, Status: ${CallStatus}`);
    } catch (logError) {
      console.error('Logger error:', logError);
    }
    
    // Generate welcome message with natural pronunciation
    const message = (
      'Welcome to Job Match dot zip, the AI powered job matching platform for LLC owners. ' +
      'Press 1 to learn about our services. ' +
      'Press 2 to speak with our AI assistant. ' +
      'Press 3 to schedule a callback. ' +
      'Press 9 to end this call.'
    );
    
    // Generate TwiML response
    // Note: Using <Say> verb since WebSockets don't work on Vercel
    const websocketUrl = process.env.TWILIO_WEBSOCKET_URL || 'wss://jobmatch.zip/api/voice/websocket';
    const twiml = generateTwiMLResponse(message, false, websocketUrl); // false = use Say verb
    
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(twiml);
  } catch (error) {
    console.error('Error in /api/voice/incoming:', error);
    // Return error TwiML so Twilio doesn't show "application error"
    const errorTwiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say language="en-US" voice="Polly.Joanna-Neural">We apologize, but we are experiencing technical difficulties. Please try again later.</Say>\n</Response>';
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(errorTwiml);
  }
});

/**
 * Handle incoming Twilio voice calls (GET method for compatibility)
 */
router.get('/incoming', (req: Request, res: Response) => {
  try {
    const { From, To, CallSid, CallStatus } = req.query;
    
    // Log safely
    try {
      logger.info(`Incoming call (GET) - From: ${From}, To: ${To}, CallSid: ${CallSid}, Status: ${CallStatus}`);
    } catch (logError) {
      console.error('Logger error:', logError);
    }
    
    const message = (
      'Welcome to Job Match dot zip, the AI powered job matching platform for LLC owners. ' +
      'Press 1 to learn about our services. ' +
      'Press 2 to speak with our AI assistant. ' +
      'Press 3 to schedule a callback. ' +
      'Press 9 to end this call.'
    );
    
    const websocketUrl = process.env.TWILIO_WEBSOCKET_URL || 'wss://jobmatch.zip/api/voice/websocket';
    const twiml = generateTwiMLResponse(message, false, websocketUrl);
    
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(twiml);
  } catch (error) {
    console.error('Error in /api/voice/incoming (GET):', error);
    const errorTwiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say language="en-US" voice="Polly.Joanna-Neural">We apologize, but we are experiencing technical difficulties. Please try again later.</Say>\n</Response>';
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(errorTwiml);
  }
});

/**
 * Handle menu selection from caller.
 */
router.post('/menu', (req: Request, res: Response) => {
  try {
    const { Digits, CallSid } = req.body;
    
    // Log safely
    try {
      logger.info(`Menu selection - CallSid: ${CallSid}, Digits: ${Digits}`);
    } catch (logError) {
      console.error('Logger error:', logError);
    }
    
    if (!Digits) {
      const message = "We didn't receive any input. Goodbye!";
      const twiml = generateTwiMLResponse(message);
      res.set('Content-Type', 'application/xml; charset=utf-8');
      return res.status(200).send(twiml);
    }
    
    let message: string;
    
    switch (Digits) {
      case '1':
        message = (
          'Job Match helps LLC owners find perfect job matches using AI. ' +
          'We analyze your skills, experience, and goals to match you with opportunities. ' +
          'Visit jobmatch dot zip to get started. Goodbye!'
        );
        break;
      case '2':
        message = (
          'Our AI assistant is available on our website at jobmatch dot zip. ' +
          'You can chat with our intelligent matching system twenty four seven. ' +
          'Visit us online to get started. Goodbye!'
        );
        break;
      case '3':
        message = (
          'To schedule a callback, please visit jobmatch dot zip and fill out our contact form. ' +
          'Our team will reach out within twenty four hours. Goodbye!'
        );
        break;
      case '9':
        message = 'Thank you for calling Job Match. Goodbye!';
        break;
      default:
        message = 'Invalid selection. Please visit jobmatch dot zip for assistance. Goodbye!';
    }
    
    const twiml = generateTwiMLResponse(message);
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(twiml);
  } catch (error) {
    console.error('Error in /api/voice/menu:', error);
    const errorTwiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say language="en-US" voice="Polly.Joanna-Neural">We apologize, but we are experiencing technical difficulties. Please try again later.</Say>\n</Response>';
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(errorTwiml);
  }
});

/**
 * Handle call status callbacks from Twilio.
 */
router.post('/status', (req: Request, res: Response) => {
  const { CallSid, CallStatus, CallDuration } = req.body;
  
  logger.info(`Call status update - CallSid: ${CallSid}, Status: ${CallStatus}, Duration: ${CallDuration}`);
  
  // You could store call logs in database here
  // await storeCallLog(CallSid, CallStatus, CallDuration);
  
  res.json({ status: 'received' });
});

/**
 * Health check for voice service.
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'voice',
    endpoints: {
      incoming: '/api/voice/incoming',
      menu: '/api/voice/menu',
      status: '/api/voice/status',
      websocket: '/api/voice/websocket'
    },
    note: 'WebSocket endpoint requires Cloud Run deployment (not available on Vercel)'
  });
});

export default router;

