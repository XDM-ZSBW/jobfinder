# JobMatch VM Deployment Guide

## VM Information
- **Name**: jobmatch-vm
- **IP**: 136.115.106.188
- **Zone**: us-central1-a
- **Project**: futurelink-private-112912460
- **Machine Type**: e2-standard-4 (4 vCPUs, 16GB RAM)
- **Disk**: 100GB SSD
- **OS**: Ubuntu 22.04 LTS

## Quick Start

### Option 1: Automated Deployment (Recommended)
Run the deployment script from your Windows machine:

```powershell
cd C:\Users\dash\projects\jobmatch-ai
.\deploy-to-vm.ps1
```

This script will:
1. Create Secret Manager secrets (JWT, Gemini API key, DB password)
2. Upload your code to the VM
3. Install Docker, dependencies, and configure the system
4. Set up auto-start on reboot

### Option 2: Manual SSH Deployment

1. **SSH to VM:**
```powershell
gcloud compute ssh jobmatch-vm --zone us-central1-a
```

2. **Navigate to app directory:**
```bash
cd /opt/jobmatch
```

3. **Build and start services:**
```bash
docker compose build
docker compose up -d
```

4. **Pull llama3.2 model:**
```bash
docker compose exec ollama ollama pull llama3.2
```

5. **Run database migrations:**
```bash
docker compose exec backend alembic upgrade head
```

## Access URLs
- **Frontend**: http://136.115.106.188
- **Backend API**: http://136.115.106.188:8000
- **API Documentation**: http://136.115.106.188:8000/docs

## Managing Services

### View running containers:
```bash
cd /opt/jobmatch
docker compose ps
```

### View logs:
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Restart services:
```bash
docker compose restart
# Or specific service:
docker compose restart backend
```

### Stop services:
```bash
docker compose down
```

### Start services:
```bash
docker compose up -d
```

### Rebuild after code changes:
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

## Updating Secrets

If you need to update secrets (JWT, API keys, passwords):

1. **Update in Google Secret Manager (from local machine):**
```powershell
# Update JWT secret
echo "new-jwt-secret" | gcloud secrets versions add jobmatch-jwt-secret --data-file=- --project=futurelink-private-112912460

# Update Gemini API key
echo "new-gemini-key" | gcloud secrets versions add jobmatch-gemini-api-key --data-file=- --project=futurelink-private-112912460
```

2. **Regenerate .env on VM:**
```bash
cd /opt/jobmatch
./scripts/render_env_from_secrets.sh
docker compose restart
```

## Uploading Code Changes

From your local machine:

```powershell
# Create zip of updated code
$tempZip = "$env:TEMP\jobmatch-ai.zip"
Compress-Archive -Path backend,frontend,shared,infra,docker-compose.yml -DestinationPath $tempZip -Force

# Upload to VM
gcloud compute scp $tempZip jobmatch-vm:/tmp/jobmatch-ai.zip --zone=us-central1-a

# Extract on VM (SSH required)
gcloud compute ssh jobmatch-vm --zone=us-central1-a --command="cd /opt/jobmatch && rm -rf jobmatch-ai && unzip -q /tmp/jobmatch-ai.zip -d jobmatch-ai"

# Rebuild and restart
gcloud compute ssh jobmatch-vm --zone=us-central1-a --command="cd /opt/jobmatch && docker compose build && docker compose up -d"
```

## Troubleshooting

### Services won't start:
```bash
# Check logs
docker compose logs

# Check disk space
df -h

# Check memory
free -h
```

### Elasticsearch fails:
```bash
# Verify kernel parameter
sysctl vm.max_map_count
# Should be 262144

# If not set:
echo "vm.max_map_count=262144" | sudo tee /etc/sysctl.d/99-elasticsearch.conf
sudo sysctl --system
docker compose restart elasticsearch
```

### Ollama model issues:
```bash
# Re-pull llama3.2
docker compose exec ollama ollama pull llama3.2

# Check available models
docker compose exec ollama ollama list
```

### Frontend can't reach backend:
```bash
# Check NEXT_PUBLIC_API_URL in .env
cat /opt/jobmatch/.env | grep NEXT_PUBLIC_API_URL

# Should be: http://136.115.106.188:8000
# If not, regenerate:
./scripts/render_env_from_secrets.sh
docker compose restart frontend
```

### Database issues:
```bash
# Access postgres
docker compose exec postgres psql -U jobmatch -d jobmatch

# Check tables
\dt

# Exit
\q
```

## Monitoring

### Check service health:
```bash
docker compose ps
```

### Check resource usage:
```bash
docker stats
```

### View system resources:
```bash
top
htop  # if installed
```

## Backup

### Manual backup:
```bash
# Backup postgres
docker compose exec postgres pg_dump -U jobmatch jobmatch > /tmp/backup-$(date +%Y%m%d).sql

# Backup to local machine
gcloud compute scp jobmatch-vm:/tmp/backup-*.sql . --zone=us-central1-a
```

### Data locations on VM:
- PostgreSQL: `/opt/jobmatch/data/postgres`
- Redis: `/opt/jobmatch/data/redis`
- Elasticsearch: `/opt/jobmatch/data/elasticsearch`
- Ollama models: `/opt/jobmatch/data/ollama`
- Checkpoints: `/opt/jobmatch/data/checkpoints`

## Firewall & Security

Open ports:
- 22 (SSH)
- 80 (HTTP - Frontend)
- 443 (HTTPS - Optional, for future SSL)
- 3000 (Frontend dev)
- 8000 (Backend API)

Firewall rule: `jobmatch-allow`

### View firewall rules:
```powershell
gcloud compute firewall-rules list --filter="name=jobmatch-allow"
```

## Auto-Start on Reboot

Services are configured to auto-start via systemd:

```bash
# Check status
sudo systemctl status jobmatch

# Manually start
sudo systemctl start jobmatch

# Manually stop
sudo systemctl stop jobmatch

# Disable auto-start
sudo systemctl disable jobmatch
```

## VM Management

### Start VM:
```powershell
gcloud compute instances start jobmatch-vm --zone=us-central1-a
```

### Stop VM:
```powershell
gcloud compute instances stop jobmatch-vm --zone=us-central1-a
```

### Delete VM (careful!):
```powershell
gcloud compute instances delete jobmatch-vm --zone=us-central1-a
```

### SSH with port forwarding (for local testing):
```powershell
gcloud compute ssh jobmatch-vm --zone=us-central1-a -- -L 8000:localhost:8000 -L 3000:localhost:3000
```

## Cost Optimization

- **Stop VM when not in use**: `gcloud compute instances stop jobmatch-vm --zone=us-central1-a`
- **e2-standard-4 cost**: ~$97/month if running 24/7
- **Disk cost**: 100GB SSD ~$17/month
- Consider smaller machine type for dev/testing

## Next Steps

1. Point a domain to `136.115.106.188`
2. Set up HTTPS with Caddy or Let's Encrypt
3. Configure backups and monitoring
4. Set up CI/CD for automated deployments
5. Add monitoring with Google Cloud Monitoring

## Support Commands

```bash
# Quick restart everything
docker compose restart

# Clean rebuild
docker compose down && docker compose build --no-cache && docker compose up -d

# View all environment variables
docker compose config

# Execute command in container
docker compose exec backend bash
docker compose exec frontend sh

# Remove all unused Docker resources
docker system prune -a
```
