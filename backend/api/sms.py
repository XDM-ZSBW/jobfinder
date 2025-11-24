"""
Twilio SMS API endpoints for JobMatch.
Handles incoming SMS messages and provides TwiML responses.
"""
from fastapi import APIRouter, Request, Form
from fastapi.responses import Response
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/sms", tags=["sms"])


def generate_twiml_sms(message: str) -> str:
    """
    Generate TwiML response for SMS.
    
    Args:
        message: Text message to send back
    
    Returns:
        TwiML XML string
    """
    twiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n'
    twiml += f'  <Message>{message}</Message>\n'
    twiml += '</Response>'
    return twiml


@router.post("/incoming")
@router.get("/incoming")
async def handle_incoming_sms(
    request: Request,
    From: Optional[str] = Form(None),
    To: Optional[str] = Form(None),
    Body: Optional[str] = Form(None),
    MessageSid: Optional[str] = Form(None)
):
    """
    Handle incoming Twilio SMS messages.
    Twilio webhook URL: https://jobmatch.zip/api/sms/incoming
    
    Args:
        From: Sender's phone number
        To: Recipient's phone number (your Twilio number)
        Body: Message text
        MessageSid: Unique message identifier
    """
    logger.info(f"Incoming SMS - From: {From}, Body: {Body[:50] if Body else 'empty'}, MessageSid: {MessageSid}")
    
    # Parse message body (case-insensitive)
    body_lower = (Body or "").lower().strip()
    
    # Auto-responder based on keywords
    if body_lower in ["help", "info", "start"]:
        message = (
            "Welcome to JobMatch! 🚀\n\n"
            "Reply with:\n"
            "• INFO - Learn about our services\n"
            "• DEMO - Get a demo link\n"
            "• CALL - Request a callback\n"
            "• WEB - Visit our website\n\n"
            "Or visit: jobmatch.zip"
        )
    elif body_lower == "info":
        message = (
            "JobMatch uses AI to match LLC owners with perfect job opportunities. "
            "We analyze your skills, experience, and goals to find your ideal match. "
            "Learn more at jobmatch.zip"
        )
    elif body_lower == "demo":
        message = (
            "Get started with JobMatch:\n"
            "👉 https://jobmatch.zip/assessment\n\n"
            "Complete our quick assessment and let our AI find your perfect match!"
        )
    elif body_lower == "call":
        message = (
            "We'd love to chat! 📞\n\n"
            "Visit jobmatch.zip to schedule a callback, "
            "or reply with your preferred time and we'll reach out."
        )
    elif body_lower == "web":
        message = "Visit us at: https://jobmatch.zip"
    elif body_lower in ["stop", "unsubscribe"]:
        message = "You have been unsubscribed. Reply START to opt back in."
    elif body_lower == "start":
        message = (
            "Welcome back to JobMatch! Reply HELP for options or visit jobmatch.zip"
        )
    else:
        # Default response for unrecognized messages
        message = (
            f"Thanks for your message! We'll get back to you soon.\n\n"
            f"For immediate help, visit jobmatch.zip or reply HELP for options."
        )
    
    # Generate TwiML response
    twiml = generate_twiml_sms(message)
    return Response(content=twiml, media_type="application/xml")


@router.post("/status")
async def handle_sms_status(
    request: Request,
    MessageSid: Optional[str] = Form(None),
    MessageStatus: Optional[str] = Form(None),
    ErrorCode: Optional[str] = Form(None)
):
    """
    Handle SMS status callbacks from Twilio.
    
    Args:
        MessageSid: Unique message identifier
        MessageStatus: sent, delivered, failed, undelivered
        ErrorCode: Error code if failed
    """
    logger.info(f"SMS status - MessageSid: {MessageSid}, Status: {MessageStatus}, Error: {ErrorCode}")
    
    # You could store SMS logs in database here
    # await store_sms_log(MessageSid, MessageStatus, ErrorCode)
    
    return {"status": "received"}


@router.get("/health")
async def sms_health_check():
    """Health check for SMS service."""
    return {
        "status": "healthy",
        "service": "sms",
        "endpoints": {
            "incoming": "/api/sms/incoming",
            "status": "/api/sms/status"
        }
    }
