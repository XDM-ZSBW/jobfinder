#!/bin/bash
# Test Agent UI API endpoints

AGENT_ID="${1:-demo-agent}"
BASE_URL="${2:-http://localhost:8000}"

echo "Testing Agent UI API endpoints"
echo "================================"
echo ""

# Test 1: Get UI Schema
echo "1. Testing GET /api/agents/${AGENT_ID}/ui-schema"
curl -s "${BASE_URL}/api/agents/${AGENT_ID}/ui-schema" | jq '.' || curl -s "${BASE_URL}/api/agents/${AGENT_ID}/ui-schema"
echo ""
echo ""

# Test 2: Get Agent State
echo "2. Testing GET /api/agents/${AGENT_ID}/state"
curl -s "${BASE_URL}/api/agents/${AGENT_ID}/state" | jq '.' || curl -s "${BASE_URL}/api/agents/${AGENT_ID}/state"
echo ""
echo ""

# Test 3: SSE Stream (5 seconds)
echo "3. Testing SSE Stream (5 seconds)"
timeout 5 curl -N -H "Accept: text/event-stream" \
     -H "Cache-Control: no-cache" \
     "${BASE_URL}/api/agents/${AGENT_ID}/state/stream" || echo "Stream ended"
echo ""
echo ""

echo "Tests complete!"

