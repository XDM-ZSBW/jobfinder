# Deployment Architecture

## Overview

JobMatch uses **Vercel-only deployment**:

- **Frontend + Backend**: Deployed to **Vercel**
- **URL**: `https://jobmatch.zip`

## Deployment Workflow

### Vercel Deployment
**Workflow**: `.github/workflows/deploy-vercel-ci-cd.yml`
- **Triggers**: Push to `main` branch (automatic)
- **Deploys**: Frontend + TypeScript Express backend
- **Platform**: Vercel serverless functions

## Current Setup

### Vercel
- ✅ Frontend (React)
- ✅ TypeScript Express backend (`backend/src/index.ts`)
- ✅ API routes: `/api/auth`, `/api/users`, `/api/jobs`
- ❌ WebSocket support (not available on Vercel serverless)

## Deployment Commands

### Deploy to Vercel (Automatic)
```bash
# Push to main branch - automatically deploys via GitHub Actions
git push origin main
```

## Environment Variables

### Vercel (via GitHub Secrets)
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Twilio Configuration

Twilio webhooks point to:
- **Voice Incoming**: `https://jobmatch.zip/api/voice/incoming` (Vercel)

**Note**: WebSocket endpoints are not available on Vercel serverless functions. If Twilio ConversationRelay is required, consider:
1. Using Twilio's `<Say>` verb instead of ConversationRelay
2. Using Twilio's built-in TTS instead of ElevenLabs via WebSocket

## Troubleshooting

### Voice Calls Not Connecting
- ✅ Check Twilio console for webhook errors
- ✅ Verify `/api/voice/incoming` endpoint is accessible
- ✅ Check Vercel function logs for errors
- ✅ Verify environment variables are set in Vercel dashboard

