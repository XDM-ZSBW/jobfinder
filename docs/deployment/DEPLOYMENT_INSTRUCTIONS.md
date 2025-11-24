# GCP VM Deployment Instructions

## Quick Start

### 1. Create GCP VM (Free Tier Compatible)

```bash
# Set your GCP project ID
export GCP_PROJECT_ID="your-project-id"
export GCP_ZONE="us-central1-a"

# Run setup script
./scripts/gcp-vm-setup.sh
```

**Note:** The script uses `e2-small` (2 vCPU, 2GB RAM) which fits within free tier credits. Ollama will use swap space for memory optimization.

### 2. Get VM IP Address

After VM creation, note the external IP address:
```bash
gcloud compute instances describe jobmatch-vm --zone=us-central1-a --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

### 3. Create Release Package

**On Windows:**
```powershell
.\scripts\create-release.ps1
```

**On Linux/Mac:**
```bash
./scripts/create-release.sh
```

This creates `jobmatch.zip` in the project root.

### 4. Deploy to VM

```bash
export VM_IP="<your-vm-ip-address>"
./scripts/deploy-to-vm.sh
```

Or manually:
```bash
# Upload zip
gcloud compute scp jobmatch.zip jobmatch-vm:/opt/jobmatch/ --zone=us-central1-a

# SSH and deploy
gcloud compute ssh jobmatch-vm --zone=us-central1-a
cd /opt/jobmatch
unzip -o jobmatch.zip
docker-compose up -d --build
```

### 5. Test Deployment

```bash
export VM_IP="<your-vm-ip-address>"
./scripts/test-deployment.sh $VM_IP
```

Or manually test:
```bash
curl http://<VM_IP>/health
curl http://<VM_IP>/api/health
curl http://<VM_IP>/api/canvas/info
```

## Configuration

### Update DNS (if you have a domain)

Point your domain to the VM IP:
```
A Record: @ -> <VM_IP>
A Record: www -> <VM_IP>
```

### Environment Variables

The deployment script creates a basic `.env` file. Update it on the VM:
```bash
gcloud compute ssh jobmatch-vm --zone=us-central1-a
cd /opt/jobmatch
nano .env
```

Key variables to set:
- `SECRET_KEY` - Generate with: `openssl rand -hex 32`
- `OPENAI_API_KEY` - If using OpenAI (optional, Ollama is default)
- `CORS_ORIGINS` - Add your domain/IP
- `NEXT_PUBLIC_API_URL` - Set to your domain/IP

## UAT Testing

See `UAT_GUIDE.md` for complete testing instructions.

Quick test checklist:
- [ ] Health endpoint: `curl http://<VM_IP>/health`
- [ ] Frontend loads: Open `http://<VM_IP>` in browser
- [ ] Universal Canvas: `http://<VM_IP>/canvas`
- [ ] API docs: `http://<VM_IP>/api/docs`
- [ ] Assessment form with canvas field works
- [ ] XDMIQ assessment works
- [ ] Marketplace form works

## Troubleshooting

### Check VM Status
```bash
gcloud compute instances describe jobmatch-vm --zone=us-central1-a
```

### View Logs
```bash
gcloud compute ssh jobmatch-vm --zone=us-central1-a
cd /opt/jobmatch
docker-compose logs -f
```

### Restart Services
```bash
gcloud compute ssh jobmatch-vm --zone=us-central1-a
cd /opt/jobmatch
docker-compose restart
```

### Check Startup Script Logs
```bash
gcloud compute ssh jobmatch-vm --zone=us-central1-a
sudo journalctl -u google-startup-scripts.service -n 100
```

## Cost Optimization (Free Tier)

- **Machine Type:** `e2-small` (2 vCPU, 2GB RAM)
- **Disk:** 30GB standard persistent disk
- **Swap:** 2GB swap file for Ollama memory
- **Ollama:** Runs locally, no external API costs
- **Estimated Cost:** ~$15-20/month (within free tier credits)

## Security Notes

- Firewall rules configured for HTTP/HTTPS
- Change default passwords in `.env`
- Set up SSL/TLS certificates for production
- Use GCP IAM for access control
- Enable Cloud Armor for DDoS protection (optional)

