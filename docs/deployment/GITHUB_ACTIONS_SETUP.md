# GitHub Actions Automatic Deployment Setup

This guide explains how to set up automatic deployment to jobmatch.zip when code is pushed to the main branch.

## Overview

When you push to the `main` branch, GitHub Actions will:
1. Build the frontend (Next.js)
2. Create a deployment package
3. Upload to GCP VM
4. Deploy and restart services
5. Verify deployment

## Prerequisites

1. **GCP Service Account** with permissions to:
   - Access Compute Engine VMs
   - SSH into the VM
   - Upload files via SCP

2. **GitHub Repository Secrets** configured

## Setup Steps

### 1. Create GCP Service Account

```bash
# Create service account
gcloud iam service-accounts create github-actions-deploy \
  --display-name="GitHub Actions Deployer"

# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/compute.instanceAdmin.v1"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/compute.osLogin"

# Create and download key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 2. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

- **`GCP_SA_KEY`**: Contents of `github-actions-key.json` (the entire JSON file)
- **`GCP_PROJECT_ID`**: Your GCP project ID (e.g., `your-project-id`)

### 3. Verify VM Access

The service account needs SSH access to the VM:

```bash
# Add service account to VM
gcloud compute instances add-iam-policy-binding jobmatch-vm \
  --zone=us-central1-a \
  --member="serviceAccount:github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/compute.osLogin"
```

### 4. Test the Workflow

1. Make a small change to any file
2. Commit and push to `main`:
   ```bash
   git add .
   git commit -m "test: Trigger deployment"
   git push origin main
   ```
3. Go to GitHub → Actions tab
4. Watch the deployment workflow run

## Workflow Details

The workflow (`.github/workflows/deploy.yml`) does:

1. **Build Frontend**: Compiles Next.js app
2. **Build Backend**: Installs Python dependencies
3. **Package**: Creates `jobmatch.zip` excluding unnecessary files
4. **Upload**: SCPs package to VM at `/opt/jobmatch/`
5. **Deploy**: 
   - Extracts package
   - Updates environment variables
   - Restarts Docker services
   - Verifies health endpoints

## Manual Deployment

You can also trigger deployment manually:

1. Go to GitHub → Actions
2. Select "Deploy to Production"
3. Click "Run workflow"
4. Select branch (usually `main`)
5. Click "Run workflow"

## Troubleshooting

### Workflow fails at authentication

- Verify `GCP_SA_KEY` secret is valid JSON
- Check service account has correct permissions
- Ensure project ID matches your GCP project

### Deployment fails on VM

- Check VM is running: `gcloud compute instances list`
- Verify SSH access: `gcloud compute ssh jobmatch-vm --zone=us-central1-a`
- Check Docker is running on VM: `docker ps`

### Services not starting

- Check Docker logs: `docker-compose logs`
- Verify `.env` file exists on VM
- Check port conflicts: `netstat -tulpn | grep -E '3000|8000'`

## Monitoring

After deployment, verify:

- Frontend: https://jobmatch.zip
- Backend API: https://jobmatch.zip/api/health
- API Docs: https://jobmatch.zip/api/docs

## Security Notes

- Service account key is stored as GitHub secret (encrypted)
- Key has minimal required permissions
- Consider using Workload Identity Federation for better security (future enhancement)

