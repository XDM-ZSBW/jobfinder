# Security Checklist - Secrets Management

## ✅ Completed Security Measures

### 1. Git Ignore Configuration
- ✓ Project `.gitignore` updated with secret patterns
- ✓ Global `~/.gitignore_global` configured
- ✓ Patterns include: `*.key`, `*.pem`, credentials files, etc.

### 2. Pre-commit Hook
- ✓ Git pre-commit hook installed at `.git/hooks/pre-commit`
- ✓ Automatically scans for secret file names
- ✓ Warns about potential secrets in file content
- ✓ Blocks commits containing obvious secrets

### 3. Cleanup Tools
- ✓ `cleanup-secrets.ps1` script created
- ✓ Removes temporary secret files (jwt.txt, gemini.txt, etc.)
- ✓ Run after deployment or periodically

### 4. Secure Storage Locations
- ✓ **Porkbun credentials**: `~/.porkbun/credentials.json`
- ✓ **Google Cloud secrets**: Google Secret Manager
  - `jobmatch-jwt-secret`
  - `jobmatch-gemini-api-key`
  - `jobmatch-db-password`

## 🔒 Secret Patterns Ignored

The following patterns are automatically ignored:

```
*.key
*.pem
*.p12
*.pfx
**/secrets/
**/credentials/
*.credentials
*.secrets
jwt.txt
gemini.txt
dbpass.txt
api-keys.txt
.porkbun/credentials.json
.env*
```

## 📋 Regular Maintenance

### Weekly
- [ ] Run `./cleanup-secrets.ps1` to remove stray files
- [ ] Review git status for any untracked secrets

### Monthly  
- [ ] Audit `.gitignore` patterns
- [ ] Check if pre-commit hook is still active
- [ ] Rotate Google Secret Manager secrets if needed

### Before Sharing Code
- [ ] Run `./cleanup-secrets.ps1`
- [ ] Review `git status` carefully
- [ ] Check for hardcoded secrets: `git grep -iE "(api[_-]?key|secret|password)" | grep -v "\.md:"`

## 🚨 If Secrets Are Accidentally Committed

### Immediate Actions
1. **Do NOT just delete the file** - it's still in git history!
2. Stop and assess the damage
3. Follow these steps:

```powershell
# Remove from current commit (if not pushed)
git reset HEAD <file>
git checkout -- <file>

# If already pushed, remove from history (CAREFUL!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch <file>" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (only if you're sure)
git push origin --force --all
```

4. **Rotate the compromised credentials immediately**:
   - Regenerate Porkbun API keys
   - Regenerate Google Cloud secrets
   - Update all services using the old credentials

### Tools to Help
- [git-secrets](https://github.com/awslabs/git-secrets) - prevents committing secrets
- [truffleHog](https://github.com/trufflesecurity/truffleHog) - finds secrets in git history
- [gitleaks](https://github.com/gitleaks/gitleaks) - detect and prevent hardcoded secrets

## 📖 Best Practices

1. **Never commit secrets** - use environment variables or secret managers
2. **Use `.env` files locally** - never commit them
3. **Rotate secrets regularly** - at least every 90 days
4. **Limit secret access** - principle of least privilege
5. **Use different secrets** for dev/staging/production
6. **Enable MFA** on accounts with API access
7. **Monitor for leaked secrets** - GitHub has secret scanning

## 🔗 Secure Storage Reference

### Local Development
```powershell
# Porkbun
$env:USERPROFILE\.porkbun\credentials.json

# Google Cloud (via gcloud CLI)
gcloud secrets list --project=futurelink-private-112912460
```

### Production (VM)
- Secrets loaded from Google Secret Manager via VM service account
- Script: `/opt/jobmatch/scripts/render_env_from_secrets.sh`
- Uses VM metadata service for authentication
- No secrets stored on disk in plaintext

## ⚙️ Automated Checks

Run this command to check for potential issues:

```powershell
# Check for tracked secrets
git ls-files | Select-String -Pattern "\.key$|\.pem$|credentials|secrets|jwt\.txt"

# Check for secrets in current directory
Get-ChildItem -Recurse -Include "*.key","*.pem","*credentials*","*secrets*" | Where-Object {$_.FullName -notmatch "node_modules|\.git"}

# Run cleanup
.\cleanup-secrets.ps1
```

## 🎯 Quick Commands

```powershell
# Clean up secrets
.\cleanup-secrets.ps1

# Check git status
git status --ignored

# Test pre-commit hook
git add -A
git commit -m "test" --dry-run

# List Google Cloud secrets
gcloud secrets list --project=futurelink-private-112912460

# Access VM (secrets are server-side)
gcloud compute ssh jobmatch-vm --zone=us-central1-a
```

---

**Last Updated**: 2025-11-22  
**Review**: Quarterly or after any security incident
