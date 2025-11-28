# Test Agent UI API endpoints (PowerShell)

param(
    [string]$AgentId = "demo-agent",
    [string]$BaseUrl = "http://localhost:8000"
)

Write-Host "Testing Agent UI API endpoints" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Get UI Schema
Write-Host "1. Testing GET /api/agents/${AgentId}/ui-schema" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "${BaseUrl}/api/agents/${AgentId}/ui-schema" -Method Get
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
Write-Host ""
Write-Host ""

# Test 2: Get Agent State
Write-Host "2. Testing GET /api/agents/${AgentId}/state" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "${BaseUrl}/api/agents/${AgentId}/state" -Method Get
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
Write-Host ""
Write-Host ""

# Test 3: SSE Stream (5 seconds)
Write-Host "3. Testing SSE Stream (5 seconds)" -ForegroundColor Yellow
Write-Host "Note: PowerShell doesn't handle SSE well. Use curl.exe instead:" -ForegroundColor Gray
Write-Host "  curl.exe -N -H `"Accept: text/event-stream`" ${BaseUrl}/api/agents/${AgentId}/state/stream" -ForegroundColor Gray
Write-Host ""

# Try with curl if available
if (Get-Command curl.exe -ErrorAction SilentlyContinue) {
    Write-Host "Attempting SSE test with curl.exe (will timeout after 5 seconds)..." -ForegroundColor Gray
    $job = Start-Job -ScriptBlock {
        param($url)
        curl.exe -N -H "Accept: text/event-stream" -H "Cache-Control: no-cache" $url
    } -ArgumentList "${BaseUrl}/api/agents/${AgentId}/state/stream"
    
    Start-Sleep -Seconds 5
    Stop-Job $job
    Receive-Job $job
    Remove-Job $job
} else {
    Write-Host "curl.exe not found. Install curl or use the bash script." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Tests complete!" -ForegroundColor Green

