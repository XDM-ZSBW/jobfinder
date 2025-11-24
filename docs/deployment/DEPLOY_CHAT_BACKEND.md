# Deploy JobMatch with Ollama Chat Backend

## Quick Deploy Command

Run this in WARP terminal:

```bash
warp deploy-chat
```

Or use the full command:

```bash
warp run warp-workflows/deploy-with-ollama-chat.yaml
```

## What This Does

1. **Builds Frontend** - Compiles Next.js frontend for production
2. **Creates Release Package** - Packages everything into `jobmatch.zip`
3. **Deploys to VM** - Uploads and extracts on `jobmatch-vm`
4. **Starts Ollama** - Ensures Ollama service is running
5. **Pulls llama3.2 Model** - Downloads model if not already available
6. **Starts Docker Services** - Builds and starts all containers
7. **Verifies Chat Backend** - Tests Ollama API and backend endpoints

## After Deployment

Your chat interface will be available at:
- **Chat Interface**: https://jobmatch.zip
- **Backend API**: https://jobmatch.zip/api
- **API Docs**: https://jobmatch.zip/api/docs
- **Health Check**: https://jobmatch.zip/health

## Ollama Configuration

- **Model**: llama3.2
- **Base URL**: http://localhost:11434 (on VM)
- **Environment Variable**: `OLLAMA_BASE_URL=http://localhost:11434`

## Troubleshooting

### Ollama Not Responding

SSH into VM and check Ollama status:
```bash
gcloud compute ssh jobmatch-vm --zone=us-central1-a
sudo systemctl status ollama
ollama list
```

### Chat Not Working

1. Check backend logs:
```bash
gcloud compute ssh jobmatch-vm --zone=us-central1-a --command="docker-compose logs app | tail -50"
```

2. Test Ollama directly:
```bash
gcloud compute ssh jobmatch-vm --zone=us-central1-a --command="curl -X POST http://localhost:11434/api/generate -d '{\"model\":\"llama3.2\",\"prompt\":\"Hello\",\"stream\":false}'"
```

3. Check frontend logs:
```bash
gcloud compute ssh jobmatch-vm --zone=us-central1-a --command="docker-compose logs app | grep -i frontend"
```

## Manual Deployment Steps

If the automated workflow fails, you can deploy manually:

```bash
# 1. Build frontend
cd frontend && npm install && npm run build && cd ..

# 2. Create release
powershell -ExecutionPolicy Bypass -File scripts/create-release.ps1

# 3. Deploy to VM
$env:VM_NAME = "jobmatch-vm"
$env:ZONE = "us-central1-a"
gcloud compute scp jobmatch.zip jobmatch-vm:/opt/jobmatch/ --zone=us-central1-a

# 4. SSH and deploy
gcloud compute ssh jobmatch-vm --zone=us-central1-a --command="
  cd /opt/jobmatch
  unzip -o jobmatch.zip
  docker-compose down
  docker-compose build --no-cache
  docker-compose up -d
"
```

## Expected Timeline

- Frontend build: ~2-5 minutes
- Release package: ~30 seconds
- VM deployment: ~5-10 minutes
- Docker build: ~5-10 minutes
- Service startup: ~1-2 minutes

**Total**: ~15-30 minutes depending on VM resources

