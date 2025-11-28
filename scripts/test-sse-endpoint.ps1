# Test Server-Sent Events endpoint with curl (PowerShell)

param(
    [string]$AgentId = "demo-agent",
    [string]$BaseUrl = "http://localhost:8000"
)

Write-Host "Testing SSE endpoint: ${BaseUrl}/api/agents/${AgentId}/state/stream" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

try {
    curl.exe -N -H "Accept: text/event-stream" `
             -H "Cache-Control: no-cache" `
             "${BaseUrl}/api/agents/${AgentId}/state/stream"
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. Backend is running on port 8000" -ForegroundColor Yellow
    Write-Host "  2. Agent is registered with ID: $AgentId" -ForegroundColor Yellow
    Write-Host "  3. curl is installed" -ForegroundColor Yellow
}

