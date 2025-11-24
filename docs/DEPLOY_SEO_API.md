# Deploy SEO API to Production

## Quick Deploy

To make the SEO API available at `https://jobmatch.zip/api/seo/status`:

### Step 1: Deploy Latest Code

```powershell
# Create release package
.\scripts\create-release.ps1

# Deploy to VM
$env:VM_IP = "your-vm-ip"
.\scripts\deploy-to-vm.sh
```

Or use the PowerShell deployment:
```powershell
.\scripts\deploy-chat.ps1
```

### Step 2: Add Search Console Credentials

```powershell
.\scripts\add-seo-credentials-to-vm.ps1
```

This script:
- Reads credentials from `secrets/search-console-credentials.json`
- Adds them to the VM's `.env` file
- Sets `GOOGLE_SEARCH_CONSOLE_SITE_URL`

### Step 3: Restart Backend

```powershell
gcloud compute ssh jobmatch-vm --zone=us-central1-a --command="cd /opt/jobmatch && docker-compose restart app"
```

### Step 4: Test

```powershell
curl https://jobmatch.zip/api/seo/status
```

Expected response:
```json
{
  "api_initialized": true,
  "site_url": "https://jobmatch.zip",
  "sitemaps": []
}
```

## Verify Deployment

### Check Backend Logs
```powershell
gcloud compute ssh jobmatch-vm --zone=us-central1-a --command="cd /opt/jobmatch && docker-compose logs app | tail -50"
```

### Check if SEO Router is Loaded
```powershell
gcloud compute ssh jobmatch-vm --zone=us-central1-a --command="curl http://localhost:8000/api/docs"
```

Look for `/api/seo/` endpoints in the docs.

### Test All SEO Endpoints

```powershell
# Status
curl https://jobmatch.zip/api/seo/status

# Sitemaps
curl https://jobmatch.zip/api/seo/sitemaps

# Submit sitemap
curl -X POST https://jobmatch.zip/api/seo/sitemap/submit -H "Content-Type: application/json" -d '{"sitemap_url": "https://jobmatch.zip/sitemap.xml"}'
```

## Troubleshooting

### If endpoint returns 404:
1. Check backend is running: `curl https://jobmatch.zip/health`
2. Check SEO router is included in `backend/main.py` (line 52)
3. Restart backend: `docker-compose restart app`

### If `api_initialized: false`:
1. Check credentials exist: `grep GOOGLE_SEARCH_CONSOLE_CREDENTIALS /opt/jobmatch/.env`
2. Verify credentials format (should be single-line JSON)
3. Check backend logs for credential parsing errors

### If credentials missing:
Run: `.\scripts\add-seo-credentials-to-vm.ps1`

## Manual Credential Setup

If the script doesn't work, manually add to VM:

```powershell
# SSH to VM
gcloud compute ssh jobmatch-vm --zone=us-central1-a

# Edit .env
cd /opt/jobmatch
nano .env

# Add these lines:
GOOGLE_SEARCH_CONSOLE_CREDENTIALS='{"type":"service_account",...}'
GOOGLE_SEARCH_CONSOLE_SITE_URL='https://jobmatch.zip'

# Restart
docker-compose restart app
```

## Next Steps

Once deployed:
1. ✅ Grant Search Console access to service account
2. ✅ Submit sitemap: `POST /api/seo/sitemap/submit`
3. ✅ Set up automation: `.\scripts\seo-optimize.ps1`
4. ✅ Monitor performance: `.\scripts\seo-monitor.sh`

