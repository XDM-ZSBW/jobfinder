# Verify Twilio Configuration in Production
# Usage: .\scripts\verify-twilio-production.ps1

$ErrorActionPreference = "Stop"

$BaseUrl = "https://jobmatch.zip"
$VoiceHealthEndpoint = "$BaseUrl/api/voice/health"
$VoiceIncomingEndpoint = "$BaseUrl/api/voice/incoming"

Write-Host "🔍 Verifying Twilio Configuration in Production" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Gray
Write-Host ""

# 1. Health Check
Write-Host "1️⃣ Checking health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri $VoiceHealthEndpoint -Method Get -ErrorAction Stop
    Write-Host "✅ Health check passed" -ForegroundColor Green
    Write-Host "   Status: $($healthResponse.status)" -ForegroundColor Gray
    Write-Host "   Service: $($healthResponse.service)" -ForegroundColor Gray
    if ($healthResponse.endpoints) {
        Write-Host "   Endpoints:" -ForegroundColor Gray
        $healthResponse.endpoints.PSObject.Properties | ForEach-Object {
            Write-Host "     - $($_.Name): $($_.Value)" -ForegroundColor Gray
        }
    }
    if ($healthResponse.active_connections) {
        Write-Host "   Active WebSocket connections: $($healthResponse.active_connections)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Test Incoming Call Endpoint
Write-Host "2️⃣ Testing incoming call endpoint..." -ForegroundColor Yellow
try {
    $testParams = @{
        From = "+1234567890"
        To = "+0987654321"
        CallSid = "TEST_VERIFY_$(Get-Date -Format 'yyyyMMddHHmmss')"
        CallStatus = "ringing"
    }
    
    $queryString = ($testParams.GetEnumerator() | ForEach-Object { "$($_.Key)=$([System.Web.HttpUtility]::UrlEncode($_.Value))" }) -join "&"
    $incomingUrl = "$VoiceIncomingEndpoint?$queryString"
    
    $twimlResponse = Invoke-WebRequest -Uri $incomingUrl -Method Get -Headers @{"Accept" = "application/xml"} -ErrorAction Stop
    
    Write-Host "✅ Incoming call endpoint responded" -ForegroundColor Green
    Write-Host "   Status Code: $($twimlResponse.StatusCode)" -ForegroundColor Gray
    Write-Host "   Content Type: $($twimlResponse.Headers.'Content-Type')" -ForegroundColor Gray
    
    $twimlContent = $twimlResponse.Content
    
    # Check for ConversationRelay
    if ($twimlContent -match "ConversationRelay") {
        Write-Host "✅ ConversationRelay found in TwiML" -ForegroundColor Green
        
        # Extract WebSocket URL
        if ($twimlContent -match 'url="([^"]+)"') {
            $websocketUrl = $matches[1]
            Write-Host "   WebSocket URL: $websocketUrl" -ForegroundColor Gray
            
            if ($websocketUrl -match "^wss://") {
                Write-Host "✅ WebSocket URL uses secure protocol (wss://)" -ForegroundColor Green
            } else {
                Write-Host "⚠️ WebSocket URL does not use secure protocol" -ForegroundColor Yellow
            }
        }
        
        # Extract TTS Provider
        if ($twimlContent -match 'ttsProvider="([^"]+)"') {
            $ttsProvider = $matches[1]
            Write-Host "   TTS Provider: $ttsProvider" -ForegroundColor Gray
        }
        
        # Extract Voice
        if ($twimlContent -match 'voice="([^"]+)"') {
            $voice = $matches[1]
            Write-Host "   Voice: $voice" -ForegroundColor Gray
            
            if ($voice -match "NYC9WEgkq1u4jiqBseQ9") {
                Write-Host "✅ ElevenLabs voice ID configured correctly" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Voice ID may not be ElevenLabs" -ForegroundColor Yellow
            }
        }
        
        # Check for enableVoiceActivityDetection
        if ($twimlContent -match 'enableVoiceActivityDetection="true"') {
            Write-Host "✅ Voice Activity Detection enabled" -ForegroundColor Green
        }
        
    } else {
        Write-Host "⚠️ ConversationRelay not found in TwiML" -ForegroundColor Yellow
        Write-Host "   Response preview:" -ForegroundColor Gray
        Write-Host $twimlContent.Substring(0, [Math]::Min(500, $twimlContent.Length)) -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ Incoming call endpoint test failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 3. WebSocket Endpoint Warning
Write-Host "3️⃣ WebSocket Endpoint Status..." -ForegroundColor Yellow
Write-Host "⚠️ IMPORTANT: Vercel serverless functions do NOT support WebSockets" -ForegroundColor Yellow
Write-Host "   The WebSocket endpoint (/api/voice/websocket) will not work on Vercel" -ForegroundColor Yellow
Write-Host "   Twilio ConversationRelay requires WebSocket support" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Options:" -ForegroundColor Gray
Write-Host "   1. Use Twilio's <Say> verb instead of ConversationRelay" -ForegroundColor Gray
Write-Host "   2. Deploy backend to Cloud Run for WebSocket support" -ForegroundColor Gray
Write-Host "   3. Use Twilio's built-in TTS instead of ElevenLabs" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ Twilio Configuration Verification Complete" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  - Health endpoint: ✅ Working" -ForegroundColor Green
Write-Host "  - Incoming call endpoint: ✅ Working" -ForegroundColor Green
Write-Host "  - TwiML generation: ✅ Working" -ForegroundColor Green
Write-Host "  - WebSocket support: ❌ Not available on Vercel" -ForegroundColor Red

