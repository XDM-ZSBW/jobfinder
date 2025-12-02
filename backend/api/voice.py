"""
Twilio Voice API endpoints for JobMatch.
Handles incoming voice calls and provides TwiML responses.
"""
from fastapi import APIRouter, Request, Form, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import Response
from typing import Optional
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/voice", tags=["voice"])

# Store active websocket connections
active_connections: dict[str, WebSocket] = {}


def generate_twiml_response(message: str, gather: bool = False, 
                            gather_action: str = None, 
                            gather_num_digits: int = 1,
                            use_conversation_relay: bool = True) -> str:
    """
    Generate TwiML response for Twilio with ElevenLabs voice via ConversationRelay.
    
    Args:
        message: Text to speak to the caller (used as initial message if ConversationRelay)
        gather: Whether to gather input from caller (not used with ConversationRelay)
        gather_action: URL to POST gathered input to (not used with ConversationRelay)
        gather_num_digits: Number of digits to gather (not used with ConversationRelay)
        use_conversation_relay: Use ConversationRelay with ElevenLabs (default: True)
    
    Returns:
        TwiML XML string with ElevenLabs voice via ConversationRelay
    """
    from config import settings
    
    # Get websocket URL from config (set via TWILIO_WEBSOCKET_URL env var)
    websocket_url = settings.TWILIO_WEBSOCKET_URL
    
    # ElevenLabs voice ID
    elevenlabs_voice = "NYC9WEgkq1u4jiqBseQ9-turbo_v2_5-0.8_0.8_0.6"
    
    twiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n'
    
    if use_conversation_relay:
        # Use ConversationRelay with ElevenLabs for real-time bidirectional conversation
        twiml += '  <Connect>\n'
        twiml += f'    <ConversationRelay url="{websocket_url}" '
        twiml += f'ttsProvider="ElevenLabs" '
        twiml += f'voice="{elevenlabs_voice}" '
        twiml += 'enableAutopilot="false" '
        twiml += 'enableVoiceActivityDetection="true" />\n'
        twiml += '  </Connect>\n'
    else:
        # Fallback to Say with ElevenLabs (if Twilio supports it directly)
        # Note: Twilio's Say verb doesn't directly support ElevenLabs,
        # so ConversationRelay is the recommended approach
        voice_attrs = 'language="en-US" voice="Polly.Joanna-Neural"'
        
        if gather:
            twiml += f'  <Gather action="{gather_action}" numDigits="{gather_num_digits}" timeout="10">\n'
            twiml += f'    <Say {voice_attrs}>{message}</Say>\n'
            twiml += '  </Gather>\n'
            # Fallback if no input
            twiml += f'  <Say {voice_attrs}>We didn\'t receive any input. Goodbye!</Say>\n'
        else:
            twiml += f'  <Say {voice_attrs}>{message}</Say>\n'
    
    twiml += '</Response>'
    return twiml


@router.post("/incoming")
@router.get("/incoming")
async def handle_incoming_call(
    request: Request,
    From: Optional[str] = Form(None),
    To: Optional[str] = Form(None),
    CallSid: Optional[str] = Form(None),
    CallStatus: Optional[str] = Form(None)
):
    """
    Handle incoming Twilio voice calls.
    Twilio webhook URL: https://jobmatch.zip/api/voice/incoming
    
    Query params (from Twilio):
        From: Caller's phone number
        To: Called phone number
        CallSid: Unique call identifier
        CallStatus: Call status (ringing, in-progress, etc.)
    """
    # Log the incoming call
    logger.info(f"Incoming call - From: {From}, To: {To}, CallSid: {CallSid}, Status: {CallStatus}")
    
    # Generate welcome message with natural pronunciation
    # Fixed: "L L C" -> "LLC", "A I" -> "AI"
    # Improved phrasing for natural flow
    message = (
        "Welcome to Job Match dot zip, the AI powered job matching platform for LLC owners. "
        "Press 1 to learn about our services. "
        "Press 2 to speak with our AI assistant. "
        "Press 3 to schedule a callback. "
        "Press 9 to end this call."
    )
    
    # Generate TwiML with ConversationRelay (ElevenLabs voice)
    # Note: ConversationRelay enables bidirectional real-time conversation via websocket
    # The menu system will be handled through the websocket connection
    twiml = generate_twiml_response(
        message=message,
        gather=False,  # ConversationRelay handles interaction via websocket
        use_conversation_relay=True
    )
    
    return Response(content=twiml, media_type="application/xml")


@router.post("/menu")
async def handle_menu_selection(
    request: Request,
    Digits: Optional[str] = Form(None),
    CallSid: Optional[str] = Form(None)
):
    """
    Handle menu selection from caller.
    
    Args:
        Digits: The digit(s) pressed by caller
        CallSid: Unique call identifier
    """
    logger.info(f"Menu selection - CallSid: {CallSid}, Digits: {Digits}")
    
    if not Digits:
        message = "We didn't receive any input. Goodbye!"
        twiml = generate_twiml_response(message)
        return Response(content=twiml, media_type="application/xml")
    
    # Handle different menu options with natural pronunciation
    if Digits == "1":
        message = (
            "Job Match helps LLC owners find perfect job matches using AI. "
            "We analyze your skills, experience, and goals to match you with opportunities. "
            "Visit jobmatch dot zip to get started. Goodbye!"
        )
    elif Digits == "2":
        message = (
            "Our AI assistant is available on our website at jobmatch dot zip. "
            "You can chat with our intelligent matching system twenty four seven. "
            "Visit us online to get started. Goodbye!"
        )
    elif Digits == "3":
        message = (
            "To schedule a callback, please visit jobmatch dot zip and fill out our contact form. "
            "Our team will reach out within twenty four hours. Goodbye!"
        )
    elif Digits == "9":
        message = "Thank you for calling Job Match. Goodbye!"
    else:
        message = "Invalid selection. Please visit jobmatch dot zip for assistance. Goodbye!"
    
    twiml = generate_twiml_response(message)
    return Response(content=twiml, media_type="application/xml")


@router.post("/status")
async def handle_call_status(
    request: Request,
    CallSid: Optional[str] = Form(None),
    CallStatus: Optional[str] = Form(None),
    CallDuration: Optional[str] = Form(None)
):
    """
    Handle call status callbacks from Twilio.
    Optional webhook for tracking call completion, duration, etc.
    
    Args:
        CallSid: Unique call identifier
        CallStatus: completed, busy, no-answer, failed, canceled
        CallDuration: Duration in seconds
    """
    logger.info(f"Call status update - CallSid: {CallSid}, Status: {CallStatus}, Duration: {CallDuration}")
    
    # You could store call logs in database here
    # await store_call_log(CallSid, CallStatus, CallDuration)
    
    return {"status": "received"}


@router.websocket("/websocket")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for Twilio ConversationRelay.
    Handles bidirectional real-time communication with Twilio calls.
    
    This endpoint:
    - Receives audio streams from Twilio
    - Sends text-to-speech responses via ElevenLabs
    - Handles conversation flow and menu navigation
    """
    await websocket.accept()
    call_sid = None
    
    try:
        # Receive initial connection message from Twilio
        initial_message = await websocket.receive_text()
        logger.info(f"WebSocket connection established: {initial_message[:200]}")
        
        try:
            data = json.loads(initial_message)
            call_sid = data.get("event", {}).get("callSid") or data.get("callSid")
            if call_sid:
                active_connections[call_sid] = websocket
                logger.info(f"Registered WebSocket connection for CallSid: {call_sid}")
        except json.JSONDecodeError:
            logger.warning(f"Non-JSON initial message: {initial_message[:100]}")
        
        # Send welcome message via TTS
        welcome_message = {
            "event": "media",
            "streamSid": call_sid or "unknown",
            "media": {
                "payload": "Welcome to Job Match dot zip, the AI powered job matching platform for LLC owners. Press 1 to learn about our services. Press 2 to speak with our AI assistant. Press 3 to schedule a callback. Press 9 to end this call."
            }
        }
        await websocket.send_json(welcome_message)
        
        # Handle incoming messages from Twilio
        while True:
            try:
                message = await websocket.receive_text()
                logger.debug(f"Received WebSocket message: {message[:200]}")
                
                try:
                    data = json.loads(message)
                    event_type = data.get("event", {}).get("type") or data.get("type")
                    
                    # Handle different event types
                    if event_type == "media":
                        # Audio data received - could process for speech recognition
                        # For now, we'll handle menu selections via DTMF
                        pass
                    elif event_type == "start":
                        logger.info(f"Call started: {data.get('event', {}).get('callSid')}")
                    elif event_type == "stop":
                        logger.info(f"Call ended: {data.get('event', {}).get('callSid')}")
                        break
                    elif event_type == "dtmf":
                        # Handle DTMF (keypad) input
                        digit = data.get("dtmf", {}).get("digit") or data.get("digit")
                        if digit:
                            await handle_dtmf_input(websocket, digit, call_sid)
                    
                except json.JSONDecodeError:
                    # Handle non-JSON messages (could be binary audio data)
                    logger.debug("Received non-JSON message (likely audio data)")
                    
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for CallSid: {call_sid}")
                break
            except Exception as e:
                logger.error(f"Error processing WebSocket message: {e}", exc_info=True)
                break
                
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
    finally:
        if call_sid and call_sid in active_connections:
            del active_connections[call_sid]
            logger.info(f"Removed WebSocket connection for CallSid: {call_sid}")
        try:
            await websocket.close()
        except:
            pass


async def handle_dtmf_input(websocket: WebSocket, digit: str, call_sid: Optional[str]):
    """Handle DTMF (keypad) input from caller."""
    logger.info(f"DTMF input received: {digit} (CallSid: {call_sid})")
    
    responses = {
        "1": "Job Match helps LLC owners find perfect job matches using AI. We analyze your skills, experience, and goals to match you with opportunities. Visit jobmatch dot zip to get started. Goodbye!",
        "2": "Our AI assistant is available on our website at jobmatch dot zip. You can chat with our intelligent matching system twenty four seven. Visit us online to get started. Goodbye!",
        "3": "To schedule a callback, please visit jobmatch dot zip and fill out our contact form. Our team will reach out within twenty four hours. Goodbye!",
        "9": "Thank you for calling Job Match. Goodbye!"
    }
    
    message = responses.get(digit, "Invalid selection. Please visit jobmatch dot zip for assistance. Goodbye!")
    
    # Send response via TTS
    response_message = {
        "event": "media",
        "streamSid": call_sid or "unknown",
        "media": {
            "payload": message
        }
    }
    await websocket.send_json(response_message)


@router.get("/health")
async def voice_health_check():
    """Health check for voice service."""
    return {
        "status": "healthy",
        "service": "voice",
        "endpoints": {
            "incoming": "/api/voice/incoming",
            "menu": "/api/voice/menu",
            "status": "/api/voice/status",
            "websocket": "/api/voice/websocket"
        },
        "active_connections": len(active_connections)
    }
