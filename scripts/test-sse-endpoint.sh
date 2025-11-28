#!/bin/bash
# Test Server-Sent Events endpoint with curl

AGENT_ID="${1:-demo-agent}"
BASE_URL="${2:-http://localhost:8000}"

echo "Testing SSE endpoint: ${BASE_URL}/api/agents/${AGENT_ID}/state/stream"
echo "Press Ctrl+C to stop"
echo ""

curl -N -H "Accept: text/event-stream" \
     -H "Cache-Control: no-cache" \
     "${BASE_URL}/api/agents/${AGENT_ID}/state/stream"

