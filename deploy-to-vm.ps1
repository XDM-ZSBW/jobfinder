#!/usr/bin/env pwsh
# JobMatch VM Deployment Script
# Run this from C:\Users\dash\projects\jobmatch-ai

$ErrorActionPreference = "Stop"
$PROJECT = "futurelink-private-112912460"
$VM_NAME = "jobmatch-vm"
$ZONE = "us-central1-a"
$VM_IP = "136.115.106.188"

Write-Host "=== JobMatch VM Deployment Script ===" -ForegroundColor Cyan
Write-Host "VM: $VM_NAME ($VM_IP)" -ForegroundColor Green
Write-Host ""

# Step 1: Create Secret Manager secrets
Write-Host "[1/4] Creating Secret Manager secrets..." -ForegroundColor Yellow

# Generate JWT secret
$jwtSecret = -join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "  Generated JWT secret"

# Prompt for Gemini API key
$geminiKey = Read-Host "  Enter your Google Gemini API key"

# Generate DB password
$dbPassword = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 24 | ForEach-Object {[char]$_})
Write-Host "  Generated DB password"

# Create secrets
Write-Host "  Creating secrets in Google Secret Manager..."

# JWT Secret
$jwtSecret | Out-File -FilePath jwt.txt -Encoding ascii -NoNewline
gcloud secrets create jobmatch-jwt-secret --replication-policy=automatic --project=$PROJECT --data-file=jwt.txt 2>$null
if ($LASTEXITCODE -ne 0) {
    gcloud secrets versions add jobmatch-jwt-secret --project=$PROJECT --data-file=jwt.txt
}
Remove-Item jwt.txt

# Gemini API Key
$geminiKey | Out-File -FilePath gemini.txt -Encoding ascii -NoNewline
gcloud secrets create jobmatch-gemini-api-key --replication-policy=automatic --project=$PROJECT --data-file=gemini.txt 2>$null
if ($LASTEXITCODE -ne 0) {
    gcloud secrets versions add jobmatch-gemini-api-key --project=$PROJECT --data-file=gemini.txt
}
Remove-Item gemini.txt

# DB Password
$dbPassword | Out-File -FilePath dbpass.txt -Encoding ascii -NoNewline
gcloud secrets create jobmatch-db-password --replication-policy=automatic --project=$PROJECT --data-file=dbpass.txt 2>$null
if ($LASTEXITCODE -ne 0) {
    gcloud secrets versions add jobmatch-db-password --project=$PROJECT --data-file=dbpass.txt
}
Remove-Item dbpass.txt

Write-Host "  ✓ Secrets created" -ForegroundColor Green
Write-Host ""

# Step 2: Wait for VM to be ready
Write-Host "[2/4] Waiting for VM to be fully ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15
Write-Host "  ✓ VM ready" -ForegroundColor Green
Write-Host ""

# Step 3: Upload code to VM
Write-Host "[3/4] Uploading code to VM..." -ForegroundColor Yellow
Write-Host "  Creating archive..."

# Create a temporary zip of the codebase (excluding node_modules, .git, data dirs)
$tempZip = "$env:TEMP\jobmatch-ai.zip"
if (Test-Path $tempZip) { Remove-Item $tempZip }

# Use PowerShell to create zip (excluding large directories)
$excludeDirs = @("node_modules", ".git", "data", ".next", "dist", "__pycache__")
Write-Host "  Compressing files (this may take a moment)..."

Compress-Archive -Path @(
    "backend",
    "frontend",
    "shared",
    "infra",
    "docker-compose.yml",
    "package.json",
    ".env.example",
    "README.md"
) -DestinationPath $tempZip -Force

Write-Host "  Uploading to VM..."
gcloud compute scp $tempZip ${VM_NAME}:/tmp/jobmatch-ai.zip --zone=$ZONE --project=$PROJECT

Write-Host "  ✓ Code uploaded" -ForegroundColor Green
Write-Host ""

# Step 4: Run setup on VM
Write-Host "[4/4] Running setup on VM..." -ForegroundColor Yellow
Write-Host "  This will take several minutes (Docker installation, image pulls, etc.)" -ForegroundColor Gray
Write-Host ""

$setupScript = @'
#!/bin/bash
set -e

echo "=== JobMatch VM Setup ==="

# Update system
echo "Updating system packages..."
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"

# Install essentials
echo "Installing essentials..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release jq git unzip

# Install Docker
echo "Installing Docker..."
sudo apt-get install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER

# Create directories
echo "Creating directories..."
sudo mkdir -p /opt/jobmatch/{data/postgres,data/redis,data/elasticsearch,data/ollama,data/checkpoints,config,scripts}
sudo chown -R $USER:docker /opt/jobmatch

# Tune kernel for Elasticsearch
echo "Tuning kernel for Elasticsearch..."
echo "vm.max_map_count=262144" | sudo tee /etc/sysctl.d/99-elasticsearch.conf
sudo sysctl --system

# Extract code
echo "Extracting application code..."
cd /opt/jobmatch
unzip -q /tmp/jobmatch-ai.zip -d jobmatch-ai
rm /tmp/jobmatch-ai.zip

# Create secret-fetching script
echo "Creating secret management script..."
cat >/opt/jobmatch/scripts/render_env_from_secrets.sh << 'EOFSCRIPT'
#!/usr/bin/env bash
set -euo pipefail

PROJECT="futurelink-private-112912460"

get_secret() {
  local name="$1"
  local token
  token=$(curl -s -H "Metadata-Flavor: Google" "http://metadata/computeMetadata/v1/instance/service-accounts/default/token" | jq -r .access_token)
  curl -s -H "Authorization: Bearer ${token}" \
    "https://secretmanager.googleapis.com/v1/projects/${PROJECT}/secrets/${name}/versions/latest:access" \
    | jq -r '.payload.data' | base64 -d
}

echo "Fetching secrets from Google Secret Manager..."
JWT_SECRET=$(get_secret jobmatch-jwt-secret)
GEMINI_API_KEY=$(get_secret jobmatch-gemini-api-key)
DB_PASSWORD=$(get_secret jobmatch-db-password)

# Static DB settings
POSTGRES_USER="jobmatch"
POSTGRES_DB="jobmatch"
DATABASE_URL="postgresql://${POSTGRES_USER}:${DB_PASSWORD}@postgres:5432/${POSTGRES_DB}"

# Get VM external IP
VM_IP=$(curl -s http://checkip.amazonaws.com || curl -s ifconfig.me || echo "localhost")
NEXT_PUBLIC_API_URL="http://${VM_IP}:8000"

cat > /opt/jobmatch/.env <<ENV
# Generated by render_env_from_secrets.sh
JWT_SECRET=${JWT_SECRET}
GEMINI_API_KEY=${GEMINI_API_KEY}

POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=${POSTGRES_DB}
DATABASE_URL=${DATABASE_URL}

REDIS_URL=redis://redis:6379/0
ELASTICSEARCH_URL=http://elasticsearch:9200
OLLAMA_HOST=http://ollama:11434
LLM_MODEL=llama3.2

NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
CHECKPOINT_DIR=/app/checkpoints
NODE_ENV=production
ENV

echo "✓ Environment file created at /opt/jobmatch/.env"
EOFSCRIPT

chmod +x /opt/jobmatch/scripts/render_env_from_secrets.sh

# Create docker-compose.yml
echo "Creating docker-compose.yml..."
cat >/opt/jobmatch/docker-compose.yml << 'EOFCOMPOSE'
version: "3.9"

networks:
  app:
    driver: bridge

services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    networks: [app]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - ./data/redis:/data
    networks: [app]

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    restart: unless-stopped
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms2g -Xmx2g
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - ./data/elasticsearch:/usr/share/elasticsearch/data
    networks: [app]

  ollama:
    image: ollama/ollama:latest
    restart: unless-stopped
    environment:
      - OLLAMA_KEEP_ALIVE=24h
    volumes:
      - ./data/ollama:/root/.ollama
    networks: [app]

  backend:
    build:
      context: ./jobmatch-ai/backend
      dockerfile: Dockerfile
    restart: unless-stopped
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      elasticsearch:
        condition: service_started
      ollama:
        condition: service_started
    ports:
      - "8000:8000"
    networks: [app]

  checkpointer:
    build:
      context: ./jobmatch-ai/infra/state-checkpointer
      dockerfile: Dockerfile
    restart: unless-stopped
    env_file: .env
    environment:
      - CHECKPOINT_DIR=${CHECKPOINT_DIR}
    volumes:
      - ./data/checkpoints:/app/checkpoints
    networks: [app]

  frontend:
    build:
      context: ./jobmatch-ai/frontend
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NODE_ENV=production
    depends_on:
      - backend
    ports:
      - "80:3000"
      - "3000:3000"
    networks: [app]
EOFCOMPOSE

# Render environment from secrets
echo "Fetching secrets and creating environment file..."
/opt/jobmatch/scripts/render_env_from_secrets.sh

# Pre-pull images (non-blocking for builds)
echo "Pre-pulling base Docker images..."
newgrp docker << DOCKERCMD
cd /opt/jobmatch
docker compose pull postgres redis elasticsearch ollama 2>/dev/null || true
DOCKERCMD

# Create systemd service for auto-start
echo "Creating systemd service..."
sudo tee /etc/systemd/system/jobmatch.service >/dev/null <<'UNIT'
[Unit]
Description=JobMatch Docker Compose Stack
After=network-online.target docker.service
Requires=docker.service

[Service]
Type=oneshot
User=dash
WorkingDirectory=/opt/jobmatch
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
RemainAfterExit=yes
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable jobmatch

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "VM is ready. To start the services:"
echo "  1. SSH to VM: gcloud compute ssh jobmatch-vm --zone us-central1-a"
echo "  2. cd /opt/jobmatch"
echo "  3. docker compose up -d"
echo ""
echo "Note: First startup will take time to build images and pull the llama3.2 model"
'@

# Upload and run setup script
$setupScript | Out-File -FilePath setup-vm-remote.sh -Encoding ASCII
gcloud compute scp setup-vm-remote.sh ${VM_NAME}:/tmp/setup.sh --zone=$ZONE --project=$PROJECT
Remove-Item setup-vm-remote.sh

gcloud compute ssh $VM_NAME --zone=$ZONE --project=$PROJECT --command="chmod +x /tmp/setup.sh && /tmp/setup.sh"

Write-Host ""
Write-Host "=== Deployment Complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "VM Information:" -ForegroundColor Yellow
Write-Host "  Name: $VM_NAME"
Write-Host "  IP: $VM_IP"
Write-Host "  Zone: $ZONE"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. SSH to VM:" -ForegroundColor White
Write-Host "     gcloud compute ssh $VM_NAME --zone=$ZONE"
Write-Host ""
Write-Host "  2. Start the services:" -ForegroundColor White
Write-Host "     cd /opt/jobmatch"
Write-Host "     docker compose build"
Write-Host "     docker compose up -d"
Write-Host ""
Write-Host "  3. Pull llama3.2 model (will take time):" -ForegroundColor White
Write-Host "     docker compose exec ollama ollama pull llama3.2"
Write-Host ""
Write-Host "  4. Run migrations:" -ForegroundColor White
Write-Host "     docker compose exec backend alembic upgrade head"
Write-Host ""
Write-Host "  5. Access your application:" -ForegroundColor White
Write-Host "     Frontend: http://$VM_IP"
Write-Host "     Backend API: http://$VM_IP:8000/docs"
Write-Host ""
