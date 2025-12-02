# Deploy Backend with WebSocket Support for Twilio ConversationRelay
# This ensures the backend is deployed to Cloud Run (not Vercel) for WebSocket support

param(
    [string]$ServiceName = "jobmatch-backend",
    [string]$Region = "us-central1",
    [string]$Domain = "jobmatch.zip"
)

$ErrorActionPreference = "Stop"

# Colors
function Write-Info($message) { Write-Host $message -ForegroundColor Cyan }
function Write-Success($message) { Write-Host $message -ForegroundColor Green }
function Write-Warning($message) { Write-Host $message -ForegroundColor Yellow }
function Write-Error($message) { Write-Host $message -ForegroundColor Red }

# Get project ID
$ProjectId = gcloud config get-value project 2>$null
if (-not $ProjectId) {
    Write-Error "Error: No GCP project configured. Run: gcloud config set project PROJECT_ID"
    exit 1
}

$ImageName = "gcr.io/$ProjectId/$ServiceName`:latest"
$WebSocketUrl = "wss://$Domain/api/voice/websocket"

Write-Info "🚀 Deploying Backend with WebSocket Support"
Write-Info "Project: $ProjectId"
Write-Info "Service: $ServiceName"
Write-Info "Region: $Region"
Write-Info "WebSocket URL: $WebSocketUrl"
Write-Host ""

# Build and push image
Write-Info "🔨 Building Docker image..."
docker build -f Dockerfile.cloudrun -t $ImageName .

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Docker build failed"
    exit 1
}

Write-Info "📤 Pushing image..."
docker push $ImageName

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Failed to push image"
    exit 1
}

# Deploy to Cloud Run with WebSocket support
Write-Info "🚀 Deploying to Cloud Run with WebSocket support..."
gcloud run deploy $ServiceName `
    --image $ImageName `
    --platform managed `
    --region $Region `
    --port 8080 `
    --memory 1Gi `
    --cpu 2 `
    --min-instances 1 `
    --max-instances 10 `
    --timeout 300 `
    --allow-unauthenticated `
    --set-env-vars "TWILIO_WEBSOCKET_URL=$WebSocketUrl" `
    --quiet

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Deployment failed"
    exit 1
}

# Get service URL
$ServiceUrl = gcloud run services describe $ServiceName `
    --region $Region `
    --format="value(status.url)"

Write-Host ""
Write-Success "✅ Deployment successful!"
Write-Success "Service URL: $ServiceUrl"
Write-Success "WebSocket URL: $WebSocketUrl"
Write-Host ""
Write-Info "📝 Next steps:"
Write-Info "1. Verify WebSocket endpoint: curl $ServiceUrl/api/voice/health"
Write-Info "2. Update Twilio webhook URL if needed"
Write-Info "3. Test a call to verify ElevenLabs voice is working"
Write-Host ""

