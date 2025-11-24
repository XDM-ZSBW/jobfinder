# Finding Amazon SES Credentials in Warp

## Quick Commands

### Find Credentials (Safe - No Exposure)
```powershell
# Find all credential locations (doesn't show actual values)
.\scripts\find-ses-credentials.ps1

# Find and verify credentials exist
.\scripts\find-ses-credentials.ps1 -VerifyExists
```

### Check Configuration Status
```powershell
# Show configuration status (safe - only shows status, not secrets)
.\scripts\get-ses-config.ps1

# Show file location
.\scripts\get-ses-config.ps1 -ShowFileLocation

# Test SES connection
.\scripts\get-ses-config.ps1 -TestConnection
```

## Credential Locations

### Primary Location
- **File**: `.env` (project root)
- **Status**: ✅ Protected by `.gitignore`
- **Contains**: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, SES_REGION, SES_FROM_EMAIL

### Secondary Locations
- **Directory**: `secrets/` (also in `.gitignore`)
- **Environment Variables**: Current PowerShell session only

## Security Guarantees

✅ **Never Committed to GitHub**
- `.env` is in `.gitignore`
- `secrets/` directory is in `.gitignore`
- All credential files are excluded

✅ **Safe for Warp Terminal**
- Scripts never output actual credential values
- Only shows configuration status and file locations
- Safe to run in any terminal environment

✅ **Production/UAT Safe**
- Credentials are local-only (not in repo)
- Environment-specific `.env` files can be used
- No hardcoded credentials in code

## Manual Access (If Needed)

### View .env File (Careful!)
```powershell
# View file location only
.\scripts\get-ses-config.ps1 -ShowFileLocation

# Edit manually (be careful!)
notepad .env
```

### Environment Variables (Current Session)
```powershell
# Check if set (doesn't show values)
$env:AWS_ACCESS_KEY_ID
$env:AWS_SECRET_ACCESS_KEY
```

## Setting Up Credentials

### First Time Setup
```powershell
# Interactive setup (secure - prompts for input)
.\scripts\setup-ses-credentials.ps1
```

### Verify Setup
```powershell
# Check configuration
.\scripts\get-ses-config.ps1 -TestConnection
```

## Troubleshooting

### Credentials Not Found
1. Run `.\scripts\find-ses-credentials.ps1` to locate
2. Run `.\scripts\setup-ses-credentials.ps1` to set up
3. Check AWS credentials file: `~/.aws/credentials`

### Connection Issues
1. Verify credentials: `.\scripts\get-ses-config.ps1 -TestConnection`
2. Check SES region matches AWS console
3. Verify sender email is verified in SES

## Security Best Practices

1. ✅ **Never commit `.env` to git** (already in `.gitignore`)
2. ✅ **Never share credentials** in chat/logs/screenshots
3. ✅ **Use scripts** to check status (they hide values)
4. ✅ **Rotate credentials** if exposed
5. ✅ **Use different credentials** for dev/prod/UAT

## Files Created

- `scripts/find-ses-credentials.ps1` - Find credential locations safely
- `scripts/get-ses-config.ps1` - Check configuration status safely
- `scripts/setup-ses-credentials.ps1` - Set up credentials securely

All scripts are safe to use in Warp terminal and never expose actual credential values.

