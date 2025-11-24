# Quick deployment script for voice and SMS endpoints
# Deploys to yourl-web VM

param(
    [switch]$DryRun
)

$VM_NAME = "yourl-web"
$PROJECT = "yourl-cloud"
$ZONE = "us-central1-a"

Write-Host "`n🚀 Deploying Voice & SMS to jobmatch.zip...`n" -ForegroundColor Cyan

# Step 1: Copy files to VM
Write-Host "📤 Step 1: Uploading voice.py and sms.py..." -ForegroundColor Yellow
if (-not $DryRun) {
    gcloud compute scp backend/api/voice.py backend/api/sms.py "${VM_NAME}:/home/dash/" --project=$PROJECT --zone=$ZONE
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Upload failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Files uploaded" -ForegroundColor Green
}

# Step 2: Find backend location and deploy
Write-Host "`n📦 Step 2: Deploying to backend..." -ForegroundColor Yellow

$deployCommands = @"
# Find the backend directory
BACKEND_DIR=\$(find /var/www /home -name 'backend' -type d 2>/dev/null | grep -v node_modules | head -1)

if [ -z "\$BACKEND_DIR" ]; then
    echo "Backend directory not found, checking /opt..."
    BACKEND_DIR=\$(find /opt -name 'backend' -type d 2>/dev/null | head -1)
fi

if [ -z "\$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found!"
    echo "Please specify the backend path manually"
    exit 1
fi

echo "Found backend at: \$BACKEND_DIR"

# Copy files
sudo cp ~/voice.py \$BACKEND_DIR/api/
sudo cp ~/sms.py \$BACKEND_DIR/api/

# Update main.py to include voice and sms routers
cd \$BACKEND_DIR

# Backup main.py
sudo cp main.py main.py.backup

# Add imports if not present
if ! grep -q "from backend.api import.*voice.*sms" main.py; then
    echo "Adding voice and sms imports..."
    sudo sed -i 's/from backend.api import \(.*\)/from backend.api import \1, voice, sms/' main.py
fi

# Add routers if not present
if ! grep -q "app.include_router(voice.router)" main.py; then
    echo "Adding voice router..."
    echo "app.include_router(voice.router)  # Twilio voice integration" | sudo tee -a main.py
fi

if ! grep -q "app.include_router(sms.router)" main.py; then
    echo "Adding SMS router..."
    echo "app.include_router(sms.router)  # Twilio SMS integration" | sudo tee -a main.py
fi

echo "✅ Backend files updated"

# Find and restart the service
echo ""
echo "🔄 Restarting backend service..."

if sudo systemctl list-units --type=service | grep -q jobmatch; then
    sudo systemctl restart jobmatch-backend || sudo systemctl restart jobmatch
    echo "✅ Service restarted"
elif [ -f /var/run/gunicorn.pid ]; then
    sudo kill -HUP \$(cat /var/run/gunicorn.pid)
    echo "✅ Gunicorn reloaded"
elif pgrep -f uvicorn > /dev/null; then
    sudo pkill -HUP -f uvicorn
    echo "✅ Uvicorn reloaded"
else
    echo "⚠️  No service found - manual restart needed"
    echo "Run: cd \$BACKEND_DIR && uvicorn main:app --reload"
fi

echo ""
echo "✅ Deployment complete!"
echo "Test with: curl https://jobmatch.zip/api/voice/health"
"@

if (-not $DryRun) {
    $deployCommands | gcloud compute ssh $VM_NAME --project=$PROJECT --zone=$ZONE --command "bash -s"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Deployment failed" -ForegroundColor Red
        Write-Host "`nTry manual deployment:" -ForegroundColor Yellow
        Write-Host "1. SSH: gcloud compute ssh $VM_NAME --project=$PROJECT --zone=$ZONE"
        Write-Host "2. Find backend: find /var/www /home /opt -name 'backend' -type d"
        Write-Host "3. Copy files: sudo cp ~/voice.py ~/sms.py <backend>/api/"
        Write-Host "4. Restart: sudo systemctl restart jobmatch-backend"
        exit 1
    }
} else {
    Write-Host "`n[DRY RUN] Would execute deployment commands on VM" -ForegroundColor Yellow
}

# Step 3: Test the endpoints
Write-Host "`n🧪 Step 3: Testing endpoints..." -ForegroundColor Yellow
if (-not $DryRun) {
    Start-Sleep -Seconds 3
    
    Write-Host "Testing voice health endpoint..."
    try {
        $response = curl -s https://jobmatch.zip/api/voice/health 2>&1
        if ($response -like "*healthy*") {
            Write-Host "✅ Voice endpoint working!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Voice endpoint not responding yet" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Could not test endpoint" -ForegroundColor Yellow
    }
    
    Write-Host "`nTesting SMS health endpoint..."
    try {
        $response = curl -s https://jobmatch.zip/api/sms/health 2>&1
        if ($response -like "*healthy*") {
            Write-Host "✅ SMS endpoint working!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  SMS endpoint not responding yet" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Could not test endpoint" -ForegroundColor Yellow
    }
}

Write-Host "`n" -NoNewline
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Test voice: Call (626) 995-9974"
Write-Host "2. Test SMS: Send 'HELP' to (626) 995-9974"
Write-Host "3. Check logs: gcloud compute ssh $VM_NAME --project=$PROJECT --zone=$ZONE --command='tail -f /var/log/nginx/access.log'"
