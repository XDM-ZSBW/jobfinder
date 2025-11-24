#!/usr/bin/env pwsh
# Sync current local code to VM
# This deploys whatever is in your current working directory

$ErrorActionPreference = "Stop"
$PROJECT = "futurelink-private-112912460"
$VM_NAME = "jobmatch-vm"
$ZONE = "us-central1-a"

Write-Host "=== Syncing Code to VM ===" -ForegroundColor Cyan
Write-Host ""

# Create temp archive
Write-Host "[1/3] Creating archive of current code..." -ForegroundColor Yellow
$tempZip = "$env:TEMP\jobmatch-sync-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"

# Archive only the essential directories/files
Compress-Archive -Path @(
    "backend",
    "frontend",
    "shared",
    "infra",
    "docker-compose.yml",
    ".env.example"
) -DestinationPath $tempZip -Force -ErrorAction Stop

Write-Host "  ✓ Archive created: $('{0:N2}' -f ((Get-Item $tempZip).Length / 1MB)) MB" -ForegroundColor Green
Write-Host ""

# Upload to VM
Write-Host "[2/3] Uploading to VM..." -ForegroundColor Yellow
gcloud compute scp $tempZip ${VM_NAME}:/tmp/jobmatch-sync.zip --zone=$ZONE --project=$PROJECT

Write-Host "  ✓ Upload complete" -ForegroundColor Green
Write-Host ""

# Extract on VM
Write-Host "[3/3] Extracting on VM..." -ForegroundColor Yellow

$extractScript = @'
#!/bin/bash
set -e

echo "Backing up old code..."
if [ -d /opt/jobmatch/jobmatch-ai ]; then
    sudo mv /opt/jobmatch/jobmatch-ai /opt/jobmatch/jobmatch-ai.backup.$(date +%Y%m%d-%H%M%S)
fi

echo "Extracting new code..."
sudo mkdir -p /opt/jobmatch/jobmatch-ai
cd /opt/jobmatch/jobmatch-ai
sudo unzip -q /tmp/jobmatch-sync.zip
sudo chown -R dash:dash /opt/jobmatch/jobmatch-ai
rm /tmp/jobmatch-sync.zip

echo "✓ Code extracted to /opt/jobmatch/jobmatch-ai"
'@

$extractScript | Out-File -FilePath extract-temp.sh -Encoding UTF8
gcloud compute scp extract-temp.sh ${VM_NAME}:/tmp/extract.sh --zone=$ZONE --project=$PROJECT
Remove-Item extract-temp.sh

gcloud compute ssh $VM_NAME --zone=$ZONE --project=$PROJECT --command="sed -i 's/\r$//' /tmp/extract.sh && chmod +x /tmp/extract.sh && /tmp/extract.sh"

# Cleanup local temp
Remove-Item $tempZip

Write-Host ""
Write-Host "=== Sync Complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Rebuild and restart services on VM:" -ForegroundColor Yellow
Write-Host "  gcloud compute ssh $VM_NAME --zone=$ZONE" -ForegroundColor White
Write-Host "  cd /opt/jobmatch" -ForegroundColor White
Write-Host "  docker compose down" -ForegroundColor White
Write-Host "  docker compose build --no-cache" -ForegroundColor White
Write-Host "  docker compose up -d" -ForegroundColor White
Write-Host ""
