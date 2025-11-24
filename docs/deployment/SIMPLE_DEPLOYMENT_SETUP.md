# Simple Deployment Setup - 3 Steps

## Quick Setup (5 minutes)

### Step 1: Get VM Details

```bash
# Get your VM IP
gcloud compute instances describe jobmatch-vm --zone=us-central1-a --format="value(networkInterfaces[0].accessConfigs[0].natIP)"
```

### Step 2: Generate SSH Key (if you don't have one)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_deploy

# Copy public key to VM
gcloud compute instances add-metadata jobmatch-vm \
  --zone=us-central1-a \
  --metadata-from-file ssh-keys=<(gcloud compute project-info describe --format="value(commonInstanceMetadata.items[ssh-keys].value)"; echo "github-actions:$(cat ~/.ssh/github_actions_deploy.pub)")

# Or manually add to VM:
# ssh into VM and add ~/.ssh/github_actions_deploy.pub to ~/.ssh/authorized_keys
```

### Step 3: Add GitHub Secrets

Go to: https://github.com/XDM-ZSBW/jobfinder/settings/secrets/actions

Add these 3 secrets:

1. **`VM_HOST`** = Your VM IP address (from Step 1)
2. **`VM_USER`** = Your VM username (usually your GCP username or `your-email@gmail.com`)
3. **`VM_SSH_KEY`** = Contents of `~/.ssh/github_actions_deploy` (the private key file)

## That's It!

Now every push to `main` will automatically deploy.

## Test It

```bash
git commit --allow-empty -m "test: Trigger deployment"
git push origin main
```

Check deployment at: https://github.com/XDM-ZSBW/jobfinder/actions

## Troubleshooting

**Can't connect?**
- Verify VM is running: `gcloud compute instances list`
- Test SSH manually: `ssh -i ~/.ssh/github_actions_deploy VM_USER@VM_HOST`

**Deployment fails?**
- Check VM logs: `gcloud compute ssh jobmatch-vm --zone=us-central1-a`
- Verify Docker is running: `docker ps`

