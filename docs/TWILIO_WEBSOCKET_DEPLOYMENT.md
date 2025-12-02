# Twilio WebSocket Endpoint Deployment Guide

## Overview

The Twilio voice integration uses **ConversationRelay** with ElevenLabs TTS, which requires a WebSocket endpoint. This guide ensures the endpoint is properly deployed and accessible.

## Deployment Requirements

### ⚠️ Important: WebSocket Support

**Vercel serverless functions do NOT support WebSockets.** You must deploy the backend to a platform that supports persistent WebSocket connections:

- ✅ **Google Cloud Run** (Recommended) - Supports WebSockets
- ✅ **VM/Container** - Full WebSocket support
- ❌ **Vercel Serverless** - Does NOT support WebSockets

## Current Configuration

- **WebSocket Endpoint**: `/api/voice/websocket`
- **Full URL**: `wss://jobmatch.zip/api/voice/websocket`
- **Voice Provider**: ElevenLabs
- **Voice ID**: `NYC9WEgkq1u4jiqBseQ9-turbo_v2_5-0.8_0.8_0.6`

## Deployment Steps

### Option 1: Deploy to Cloud Run (Recommended)

```powershell
# Deploy backend to Cloud Run (supports WebSockets)
.\scripts\deploy-to-cloud-run.ps1

# Or manually:
$PROJECT_ID = "futurelink-private-112912460"
$SERVICE_NAME = "jobmatch-backend"
$REGION = "us-central1"

# Build and deploy
docker build -f Dockerfile.cloudrun -t gcr.io/$PROJECT_ID/$SERVICE_NAME:latest .
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest

gcloud run deploy $SERVICE_NAME `
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest `
    --platform managed `
    --region $REGION `
    --port 8080 `
    --memory 1Gi `
    --cpu 2 `
    --min-instances 1 `
    --timeout 300 `
    --allow-unauthenticated `
    --set-env-vars "TWILIO_WEBSOCKET_URL=wss://jobmatch.zip/api/voice/websocket"
```

### Option 2: Update Vercel Configuration

If you must use Vercel, you'll need to:
1. Deploy backend to Cloud Run separately
2. Update `TWILIO_WEBSOCKET_URL` to point to Cloud Run URL
3. Keep frontend on Vercel, backend on Cloud Run

## Verify Deployment

### 1. Check WebSocket Endpoint

```powershell
# Test WebSocket endpoint (requires wscat or similar tool)
# Install: npm install -g wscat
wscat -c wss://jobmatch.zip/api/voice/websocket
```

### 2. Check Health Endpoint

```powershell
curl https://jobmatch.zip/api/voice/health
# Should show: "websocket": "/api/voice/websocket"
```

### 3. Test Twilio Call

1. Call your Twilio number
2. Check logs for WebSocket connection
3. Verify ElevenLabs voice is used

## Environment Variables

Set in your deployment platform:

```env
TWILIO_WEBSOCKET_URL=wss://jobmatch.zip/api/voice/websocket
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number
```

## Troubleshooting

### WebSocket Connection Fails

1. **Check deployment platform**: Ensure it supports WebSockets (Cloud Run ✅, Vercel ❌)
2. **Verify URL**: Must use `wss://` (secure WebSocket) in production
3. **Check firewall**: Ensure WebSocket connections aren't blocked
4. **Review logs**: Check backend logs for WebSocket connection errors

### Voice Not Working

1. **Verify ElevenLabs configuration**: Check voice ID is correct
2. **Check TwiML**: Verify ConversationRelay is properly configured
3. **Test WebSocket**: Ensure endpoint is accessible
4. **Review Twilio logs**: Check Twilio console for errors

## Production Checklist

- [ ] Backend deployed to Cloud Run (or WebSocket-supporting platform)
- [ ] `TWILIO_WEBSOCKET_URL` environment variable set
- [ ] WebSocket endpoint accessible at `wss://jobmatch.zip/api/voice/websocket`
- [ ] Health check shows websocket endpoint
- [ ] Test call confirms ElevenLabs voice is working
- [ ] Logs show WebSocket connections being established

## Architecture

```
Twilio Call
    ↓
TwiML Response (with ConversationRelay)
    ↓
WebSocket Connection (wss://jobmatch.zip/api/voice/websocket)
    ↓
FastAPI WebSocket Handler
    ↓
ElevenLabs TTS (voice: NYC9WEgkq1u4jiqBseQ9-turbo_v2_5-0.8_0.8_0.6)
    ↓
Audio Stream Back to Caller
```

