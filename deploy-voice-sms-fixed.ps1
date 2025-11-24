# Quick deployment script for voice and SMS endpoints
$VM_NAME = "yourl-web"
$PROJECT = "yourl-cloud"
$ZONE = "us-central1-a"

Write-Host "`n🚀 Deploying Voice & SMS to jobmatch.zip...`n" -ForegroundColor Cyan

# Step 1: Copy files to VM
Write-Host "📤 Step 1: Uploading voice.py and sms.py..." -ForegroundColor Yellow
gcloud compute scp backend/api/voice.py backend/api/sms.py "${VM_NAME}:/home/dash/" --project=$PROJECT --zone=$ZONE
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Files uploaded" -ForegroundColor Green

# Step 2: Create deployment script
Write-Host "`n📦 Step 2: Creating deployment script..." -ForegroundColor Yellow
$deployScript = @'
#!/bin/bash
# Find the backend directory
echo "Searching for backend directory..."
BACKEND_DIR=$(find /var/www /home /opt -name "backend" -type d 2>/dev/null | grep -v node_modules | head -1)

if [ -z "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found!"
    echo "Searched: /var/www, /home, /opt"
    exit 1
fi

echo "Found backend at: $BACKEND_DIR"

# Copy files
echo "Copying voice.py and sms.py..."
sudo cp ~/voice.py $BACKEND_DIR/api/
sudo cp ~/sms.py $BACKEND_DIR/api/
echo "✅ Files copied"

# Update main.py
cd $BACKEND_DIR
echo "Updating main.py..."

# Backup
sudo cp main.py main.py.backup.$(date +%s)

# Add imports if not present
if ! grep -q "voice, sms" main.py; then
    echo "Adding imports..."
    sudo sed -i 's/from backend\.api import \(.*\)chat/from backend.api import \1chat, voice, sms/' main.py
fi

# Add routers if not present
if ! grep -q "voice.router" main.py; then
    echo "Adding voice router..."
    echo "app.include_router(voice.router)  # Twilio voice" | sudo tee -a main.py > /dev/null
fi

if ! grep -q "sms.router" main.py; then
    echo "Adding SMS router..."
    echo "app.include_router(sms.router)  # Twilio SMS" | sudo tee -a main.py > /dev/null
fi

echo "✅ main.py updated"

# Restart service
echo ""
echo "🔄 Restarting backend..."

if sudo systemctl list-units --type=service 2>/dev/null | grep -q jobmatch; then
    sudo systemctl restart jobmatch-backend 2>/dev/null || sudo systemctl restart jobmatch 2>/dev/null
    echo "✅ Service restarted"
elif pgrep -f uvicorn > /dev/null; then
    sudo pkill -HUP -f uvicorn
    echo "✅ Uvicorn reloaded"
else
    echo "⚠️ No service found - checking Docker..."
    if command -v docker >/dev/null && docker ps | grep -q backend; then
        docker restart $(docker ps -q --filter name=backend)
        echo "✅ Docker container restarted"
    else
        echo "❌ Could not find running backend"
        echo "Manual restart needed"
    fi
fi

echo ""
echo "✅ Deployment complete!"
'@

# Write script to temp file
$tempScript = "$env:TEMP\deploy-backend.sh"
$deployScript | Out-File -FilePath $tempScript -Encoding ASCII -NoNewline

# Upload and execute
Write-Host "Uploading deployment script..." -ForegroundColor Yellow
gcloud compute scp $tempScript "${VM_NAME}:/tmp/deploy-backend.sh" --project=$PROJECT --zone=$ZONE

Write-Host "Executing deployment..." -ForegroundColor Yellow
gcloud compute ssh $VM_NAME --project=$PROJECT --zone=$ZONE --command="chmod +x /tmp/deploy-backend.sh && /tmp/deploy-backend.sh"

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Deployment failed" -ForegroundColor Red
    exit 1
}

# Step 3: Test
Write-Host "`n🧪 Step 3: Testing endpoints..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

curl -s https://jobmatch.zip/api/voice/health
curl -s https://jobmatch.zip/api/sms/health

Write-Host "`n🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "`nTest now:" -ForegroundColor Cyan
Write-Host "• Call: (626) 995-9974"
Write-Host "• SMS: Send 'HELP' to (626) 995-9974"
