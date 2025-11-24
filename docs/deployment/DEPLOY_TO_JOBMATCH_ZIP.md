# Deploy to https://jobmatch.zip

## Quick Deployment

```bash
# Set your GCP project
export GCP_PROJECT_ID="your-project-id"
export GCP_ZONE="us-central1-a"

# Run complete deployment (creates VM, deploys app, configures DNS & HTTPS)
./scripts/deploy-with-dns.sh
```

## Manual Steps

### 1. Create Release Package
```bash
# Windows
powershell -ExecutionPolicy Bypass -File scripts/create-release.ps1

# Linux/Mac
./scripts/create-release.sh
```

This creates `jobmatch.zip` with version REV001.

### 2. Create GCP VM
```bash
export GCP_PROJECT_ID="your-project-id"
./scripts/gcp-vm-setup.sh
```

### 3. Get VM IP
```bash
VM_IP=$(gcloud compute instances describe jobmatch-vm --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)')
echo $VM_IP
```

### 4. Deploy Application
```bash
export VM_IP="<vm-ip-from-step-3>"
./scripts/deploy-to-vm.sh
```

### 5. Configure DNS

**Option A: Using GCP Cloud DNS (Recommended)**
```bash
# Create DNS zone
gcloud dns managed-zones create jobmatch-zone \
    --dns-name="jobmatch.zip" \
    --description="DNS zone for JobMatch Platform"

# Get zone name
ZONE_NAME=$(gcloud dns managed-zones list --filter="dnsName:jobmatch.zip" --format="value(name)")

# Add A records
gcloud dns record-sets create jobmatch.zip. \
    --zone=$ZONE_NAME \
    --type=A \
    --ttl=300 \
    --rrdatas=$VM_IP

gcloud dns record-sets create www.jobmatch.zip. \
    --zone=$ZONE_NAME \
    --type=A \
    --ttl=300 \
    --rrdatas=$VM_IP

# Get name servers (update your domain registrar with these)
gcloud dns managed-zones describe $ZONE_NAME --format="value(nameServers)"
```

**Option B: Manual DNS Configuration**
At your domain registrar (where you registered jobmatch.zip):
- Add A record: `@` → `<VM_IP>`
- Add A record: `www` → `<VM_IP>`

### 6. Setup Porkbun Credentials (First Time Only)
```bash
# This will prompt you once for Porkbun API credentials
./scripts/setup-porkbun-credentials.sh
```

Or use Warp command:
```bash
warp setup-porkbun
```

### 7. Setup HTTPS with Porkbun SSL
```bash
export DOMAIN="jobmatch.zip"
./scripts/setup-https-jobmatch-zip.sh
```

Or use Warp command:
```bash
warp porkbun-ssl
```

### 8. Test Deployment
```bash
./scripts/test-deployment.sh $VM_IP

# Test HTTPS (after DNS propagates)
curl https://jobmatch.zip/health
curl https://jobmatch.zip/api/health
```

## Verify REV001 is Showing

After deployment, verify version is displayed:

1. **Homepage**: Visit https://jobmatch.zip - should show "REV001" badge
2. **API Root**: `curl https://jobmatch.zip/` - should return version REV001
3. **Health Endpoint**: `curl https://jobmatch.zip/health` - should return version REV001

## Troubleshooting

### DNS Not Propagating
- Wait up to 48 hours for DNS propagation
- Check DNS: `dig jobmatch.zip` or `nslookup jobmatch.zip`
- Verify A records point to VM IP

### HTTPS Certificate Issues
- Ensure DNS is pointing to VM IP before running Porkbun SSL setup
- Check Nginx config: `sudo nginx -t` on VM
- Verify Porkbun credentials: Check `.porkbun-credentials` file exists
- Test Porkbun API: Run `./scripts/setup-porkbun-credentials.sh` to validate credentials
- Check certificate files: `ls -la /etc/nginx/ssl/jobmatch.zip/` on VM

### Version Not Showing
- Verify VERSION file exists on VM: `cat /opt/jobmatch/VERSION`
- Check backend logs: `docker-compose logs backend` on VM
- Restart services: `docker-compose restart` on VM

## Current Status

- **Version**: REV001
- **Release Date**: 2025-01-27
- **Package**: jobmatch.zip (0.27 MB)
- **Status**: Ready for deployment

