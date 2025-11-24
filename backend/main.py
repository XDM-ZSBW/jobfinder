"""
Main FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import settings
from backend.api import auth, assessment, matching, articulation, forums, referrals, xdmiq, social_auth, gcp_cli, marketplace, canvas, security, conversations, seo, users, chat, voice, sms
from backend.security.security_headers import SecurityHeadersMiddleware
from backend.security.rate_limiter import RateLimiterMiddleware

# Read version
try:
    with open("VERSION", "r") as f:
        app_version = f.read().strip().split("\n")[0]
except:
    app_version = "REV001"

app = FastAPI(
    title="AI-Enabled LLC Matching Platform",
    description="Job matching platform for LLC owners who work with AI",
    version=app_version,
)

# Security middleware (applied first)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimiterMiddleware, requests_per_minute=60)

# CORS middleware (restrict in production)
# In development, allow all methods/headers to avoid preflight issues.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(assessment.router)
app.include_router(matching.router)
app.include_router(articulation.router)
app.include_router(forums.router)
app.include_router(referrals.router)
app.include_router(xdmiq.router)
app.include_router(social_auth.router)
app.include_router(marketplace.router)
app.include_router(canvas.router)
app.include_router(security.router)
app.include_router(conversations.router)
app.include_router(chat.router)
app.include_router(seo.router)
app.include_router(users.router)  # GDPR-compliant user data management
app.include_router(voice.router)  # Twilio voice integration
app.include_router(sms.router)  # Twilio SMS integration

# GCP CLI Backdoor (Documented Feature)
if settings.GCP_CLI_ENABLED:
    app.include_router(gcp_cli.router)


@app.get("/")
async def root():
    """Root endpoint."""
    try:
        with open("VERSION", "r") as f:
            version = f.read().strip().split("\n")[0]
    except:
        version = "REV001"
    
    return JSONResponse({
        "message": "AI-Enabled LLC Matching Platform API",
        "version": version,
        "release": "REV001",
        "status": "operational"
    })


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        with open("VERSION", "r") as f:
            version = f.read().strip().split("\n")[0]
    except:
        version = "REV001"
    
    return JSONResponse({
        "status": "healthy",
        "service": "backend",
        "version": version,
        "release": "REV001"
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

