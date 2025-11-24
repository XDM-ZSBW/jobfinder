#!/usr/bin/env pwsh
# Setup nginx on JobMatch VM
# Run this from C:\Users\dash\projects\jobmatch-ai

$ErrorActionPreference = "Stop"
$PROJECT = "futurelink-private-112912460"
$VM_NAME = "jobmatch-vm"
$ZONE = "us-central1-a"

Write-Host "=== Setting up nginx on $VM_NAME ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Upload nginx config
Write-Host "[1/3] Uploading nginx configuration..." -ForegroundColor Yellow
gcloud compute scp infra/nginx/jobmatch.conf ${VM_NAME}:/tmp/jobmatch.conf --zone=$ZONE --project=$PROJECT
Write-Host "  ✓ Config uploaded" -ForegroundColor Green
Write-Host ""

# Step 2: Create setup script
Write-Host "[2/3] Creating nginx setup script..." -ForegroundColor Yellow

$nginxSetupScript = @'
#!/bin/bash
set -e

echo "=== Installing and configuring nginx ==="
echo ""

# Install nginx
echo "[1/4] Installing nginx..."
sudo apt-get update -y
sudo apt-get install -y nginx
echo "  ✓ nginx installed"
echo ""

# Stop nginx temporarily
echo "[2/4] Stopping nginx..."
sudo systemctl stop nginx
echo "  ✓ nginx stopped"
echo ""

# Install configuration
echo "[3/4] Installing jobmatch.conf..."
sudo cp /tmp/jobmatch.conf /etc/nginx/sites-available/jobmatch
sudo ln -sf /etc/nginx/sites-available/jobmatch /etc/nginx/sites-enabled/jobmatch

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
echo "  Testing nginx configuration..."
sudo nginx -t
echo "  ✓ Configuration valid"
echo ""

# Start nginx
echo "[4/4] Starting nginx..."
sudo systemctl enable nginx
sudo systemctl start nginx
echo "  ✓ nginx started and enabled"
echo ""

# Show status
echo "=== nginx Status ==="
sudo systemctl status nginx --no-pager | head -10
echo ""

echo "=== Setup Complete! ==="
echo ""
echo "nginx is now configured to:"
echo "  - Proxy / to Next.js frontend (port 3000)"
echo "  - Proxy /api to FastAPI backend (port 8000)"
echo "  - Serve on http://jobmatch.zip"
echo ""
echo "Make sure your Docker services are running:"
echo "  cd /opt/jobmatch"
echo "  docker compose ps"
echo ""
'@

$nginxSetupScript | Out-File -FilePath nginx-setup-remote.sh -Encoding ASCII -NoNewline
$nginxSetupScript | Out-File -FilePath nginx-setup-remote.sh -Encoding UTF8
gcloud compute scp nginx-setup-remote.sh ${VM_NAME}:/tmp/nginx-setup.sh --zone=$ZONE --project=$PROJECT
Remove-Item nginx-setup-remote.sh
Write-Host "  ✓ Setup script uploaded" -ForegroundColor Green
Write-Host ""

# Step 3: Run setup script
Write-Host "[3/3] Running nginx setup on VM..." -ForegroundColor Yellow
Write-Host ""
gcloud compute ssh $VM_NAME --zone=$ZONE --project=$PROJECT --command="chmod +x /tmp/nginx-setup.sh && /tmp/nginx-setup.sh"

Write-Host ""
Write-Host "=== nginx Configuration Complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Make sure Docker services are running:" -ForegroundColor White
Write-Host "     gcloud compute ssh $VM_NAME --zone=$ZONE"
Write-Host "     cd /opt/jobmatch"
Write-Host "     docker compose up -d"
Write-Host ""
Write-Host "  2. Check service status:" -ForegroundColor White
Write-Host "     docker compose ps"
Write-Host ""
Write-Host "  3. Access your site:" -ForegroundColor White
Write-Host "     http://jobmatch.zip"
Write-Host "     http://jobmatch.zip/api/health"
Write-Host "     http://jobmatch.zip/docs"
Write-Host ""
Write-Host "  4. Check nginx logs if issues:" -ForegroundColor White
Write-Host "     ssh to VM, then:"
Write-Host "     sudo tail -f /var/log/nginx/jobmatch_error.log"
Write-Host ""
