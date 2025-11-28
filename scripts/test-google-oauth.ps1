# Test Google OAuth Setup
# Verifies that Google OAuth endpoints are accessible and configured

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Google OAuth Setup Test" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "Checking backend server..." -ForegroundColor Yellow
$backendUrl = $env:BACKEND_URL
if (-not $backendUrl) {
    $backendUrl = "http://localhost:8000"
    Write-Host "  BACKEND_URL not set, using default: $backendUrl" -ForegroundColor Gray
}

try {
    $healthCheck = Invoke-WebRequest -Uri "$backendUrl/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  ✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Backend is NOT running at $backendUrl" -ForegroundColor Red
    Write-Host "     Start backend with: cd backend && python -m uvicorn main:app --reload" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Testing Google OAuth endpoints..." -ForegroundColor Yellow

# Test login endpoint (should redirect)
try {
    $loginResponse = Invoke-WebRequest -Uri "$backendUrl/api/auth/google/login" -Method GET -MaximumRedirection 0 -ErrorAction Stop
    Write-Host "  ⚠️  Login endpoint returned status: $($loginResponse.StatusCode)" -ForegroundColor Yellow
    Write-Host "     (Expected redirect to Google)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 302 -or $_.Exception.Response.StatusCode -eq 301) {
        Write-Host "  ✅ Login endpoint redirects correctly" -ForegroundColor Green
        $location = $_.Exception.Response.Headers.Location
        if ($location -like "*accounts.google.com*") {
            Write-Host "     Redirects to: Google OAuth" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ❌ Login endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test status endpoint
try {
    $statusResponse = Invoke-WebRequest -Uri "$backendUrl/api/auth/google/status" -Method GET -ErrorAction Stop
    $statusData = $statusResponse.Content | ConvertFrom-Json
    Write-Host "  ✅ Status endpoint works" -ForegroundColor Green
    Write-Host "     Linked: $($statusData.linked)" -ForegroundColor Gray
    Write-Host "     Provider: $($statusData.provider)" -ForegroundColor Gray
} catch {
    Write-Host "  ⚠️  Status endpoint: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "     (This is normal if not authenticated)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Test Complete" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test full flow:" -ForegroundColor Yellow
Write-Host "1. Visit: $backendUrl/api/auth/google/login" -ForegroundColor White
Write-Host "2. Complete Google OAuth" -ForegroundColor White
Write-Host "3. Check status: $backendUrl/api/auth/google/status" -ForegroundColor White
Write-Host ""

