# Deploy JobMatch with Ollama Chat Backend
# ⚠️ DEVELOPMENT ONLY - This script uses Ollama (not for production)
# Production deployments should use OpenRouter API instead
# See: scripts/deploy-to-vm.sh for production deployment
# Direct PowerShell script (no WARP needed)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying JobMatch with Ollama Chat Backend..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Build Frontend
Write-Host "📦 Step 1: Building frontend..." -ForegroundColor Cyan
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm build failed" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host "✅ Frontend built successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Create Release Package
Write-Host "📦 Step 2: Creating release package..." -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File scripts/create-release.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Release package creation failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Release package created" -ForegroundColor Green
Write-Host ""

# Step 3: Get VM Info
Write-Host "🌐 Step 3: Getting VM information..." -ForegroundColor Cyan
$vmName = "jobmatch-vm"
$zone = "us-central1-a"
$vmIp = gcloud compute instances describe $vmName --zone=$zone --format="value(networkInterfaces[0].accessConfigs[0].natIP)"
Write-Host "   VM IP: $vmIp" -ForegroundColor White
Write-Host ""

# Step 4: Upload and Deploy
Write-Host "📤 Step 4: Uploading and deploying..." -ForegroundColor Cyan
gcloud compute scp jobmatch.zip "${vmName}:/opt/jobmatch/" --zone=$zone
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Deploying on VM..." -ForegroundColor Cyan
# Convert PowerShell here-string to Unix line endings
$deployCmd = @"
cd /opt/jobmatch
unzip -o jobmatch.zip || true
rm -f jobmatch.zip

# Ensure Ollama is running
if ! systemctl is-active --quiet ollama; then
  echo '🤖 Starting Ollama service...'
  sudo systemctl start ollama
  sudo systemctl enable ollama
fi

# Pull llama3.2 model if not available
if ! ollama list | grep -q llama3.2; then
  echo '📥 Pulling llama3.2 model...'
  ollama pull llama3.2
fi

# Create/update .env file
cat > .env <<ENVEOF
DATABASE_URL=postgresql://jobfinder:jobfinder@postgres:5432/jobfinder
REDIS_URL=redis://redis:6379
ELASTICSEARCH_URL=http://elasticsearch:9200
OPENAI_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
SECRET_KEY=$(openssl rand -hex 32)
ENVIRONMENT=production
CORS_ORIGINS=https://jobmatch.zip,https://www.jobmatch.zip,http://localhost:3000,http://localhost:8000
NEXT_PUBLIC_API_URL=https://jobmatch.zip/api
ENVEOF

# Build and start Docker services
echo '🐳 Building Docker containers...'
docker compose down || true
docker compose build --no-cache
docker compose up -d

# Wait for services
echo '⏳ Waiting for services to start...'
sleep 45

# Verify Ollama
echo '🤖 Verifying Ollama...'
curl -f http://localhost:11434/api/tags || echo '⚠️  Ollama not responding yet'

# Check health
echo '🏥 Checking health endpoints...'
curl -f http://localhost:8000/health || echo '⚠️  Backend health check failed'
curl -f http://localhost:3000 || echo '⚠️  Frontend not responding'

echo '✅ Deployment complete!'
"@ -replace "`r`n", "`n"

gcloud compute ssh $vmName --zone=$zone --command=$deployCmd
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access your application:" -ForegroundColor Cyan
Write-Host "   Chat Interface: https://jobmatch.zip" -ForegroundColor White
Write-Host "   Backend API: https://jobmatch.zip/api" -ForegroundColor White
Write-Host "   API Docs: https://jobmatch.zip/api/docs" -ForegroundColor White
Write-Host "   Health: https://jobmatch.zip/health" -ForegroundColor White
Write-Host ""
Write-Host "🤖 Ollama Chat Backend:" -ForegroundColor Cyan
Write-Host "   Model: llama3.2" -ForegroundColor White
Write-Host "   Endpoint: http://localhost:11434 (on VM)" -ForegroundColor White

