# Google Search Console API Setup Guide

## Overview

This guide explains how to set up Google Search Console API integration for automated SEO management and optimization.

## Prerequisites

1. Google Cloud Project with Search Console API enabled
2. Service account with Search Console API access
3. Site verified in Google Search Console

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Note your Project ID

## Step 2: Enable Search Console API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Search Console API"
3. Click **Enable**

## Step 3: Create Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Fill in details:
   - **Name**: `jobmatch-seo-service`
   - **Description**: `Service account for Search Console API access`
4. Click **Create and Continue**
5. Skip role assignment (optional)
6. Click **Done**

## Step 4: Generate Service Account Key

1. Click on the created service account
2. Go to **Keys** tab
3. Click **Add Key** > **Create New Key**
4. Choose **JSON** format
5. Download the JSON key file
6. **Keep this file secure** - it contains credentials

## Step 5: Grant Search Console Access

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property (`https://jobmatch.zip`)
3. Go to **Settings** > **Users and permissions**
4. Click **Add User**
5. Enter the service account email (from JSON key file: `client_email`)
6. Select **Full** permission
7. Click **Add**

## Step 6: Configure Application

### Option A: Environment Variable (Recommended)

Add to your `.env` file:

```bash
GOOGLE_SEARCH_CONSOLE_CREDENTIALS='{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...@....iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'
```

**Important**: The JSON must be on a single line with escaped quotes.

### Option B: JSON File (Alternative)

Store the JSON file securely and update `backend/seo/search_console.py` to load from file:

```python
def _initialize_service(self):
    credentials_path = os.getenv('GOOGLE_SEARCH_CONSOLE_CREDENTIALS_PATH', 'secrets/search-console-credentials.json')
    credentials = service_account.Credentials.from_service_account_file(
        credentials_path,
        scopes=['https://www.googleapis.com/auth/webmasters']
    )
```

## Step 7: Verify Setup

### Test API Connection

```bash
# Check SEO status
curl http://localhost:8000/api/seo/status

# Submit sitemap
curl -X POST http://localhost:8000/api/seo/sitemap/submit \
  -H "Content-Type: application/json" \
  -d '{"sitemap_url": "https://jobmatch.zip/sitemap.xml"}'
```

### Run Optimization Script

```bash
# Linux/Mac
./scripts/seo-optimize.sh

# Windows PowerShell
.\scripts\seo-optimize.ps1
```

## API Endpoints

### SEO Status
```
GET /api/seo/status
```

### Submit Sitemap
```
POST /api/seo/sitemap/submit
{
  "sitemap_url": "https://jobmatch.zip/sitemap.xml"
}
```

### Request Indexing
```
POST /api/seo/index/request
{
  "url": "https://jobmatch.zip/matching"
}
```

### Get Search Analytics
```
GET /api/seo/analytics/search?start_date=2024-01-01&end_date=2024-01-31&dimensions=query,page
```

### Optimize Keywords
```
GET /api/seo/keywords/optimize?keywords=longest first,AI job matching
```

## Automation Scripts

### Daily Optimization
```bash
# Add to crontab (Linux/Mac)
0 2 * * * /path/to/scripts/seo-optimize.sh >> /var/log/seo-optimize.log 2>&1

# Or use Windows Task Scheduler for PowerShell script
```

### Weekly Monitoring
```bash
# Generate weekly report
./scripts/seo-monitor.sh

# Reports saved to ./seo-reports/
```

## Troubleshooting

### Error: "Search Console API not initialized"

**Cause**: Credentials not configured or invalid

**Solution**:
1. Check `GOOGLE_SEARCH_CONSOLE_CREDENTIALS` environment variable
2. Verify JSON format (must be single-line with escaped quotes)
3. Ensure service account has Search Console access

### Error: "Permission denied"

**Cause**: Service account doesn't have access to Search Console property

**Solution**:
1. Go to Search Console > Settings > Users and permissions
2. Add service account email with Full permission
3. Wait a few minutes for permissions to propagate

### Error: "API not enabled"

**Cause**: Search Console API not enabled in Google Cloud Project

**Solution**:
1. Go to Google Cloud Console > APIs & Services > Library
2. Enable "Google Search Console API"

## Security Best Practices

1. **Never commit credentials to git**
   - Add `secrets/` to `.gitignore`
   - Use environment variables in production

2. **Rotate credentials regularly**
   - Generate new service account keys periodically
   - Revoke old keys

3. **Limit permissions**
   - Use service account with minimal required permissions
   - Don't grant unnecessary access

4. **Monitor usage**
   - Check API usage in Google Cloud Console
   - Set up billing alerts

## Monitoring & Alerts

### Set Up Alerts

1. Google Cloud Console > Monitoring > Alerting
2. Create alert for API errors
3. Set up email notifications

### Track Performance

- Use `/api/seo/analytics/search` endpoint
- Generate weekly reports with `seo-monitor.sh`
- Monitor keyword rankings

## Next Steps

1. ✅ Set up credentials
2. ✅ Verify API connection
3. ⏳ Schedule daily optimization
4. ⏳ Set up weekly monitoring
5. ⏳ Create alerts for issues
6. ⏳ Track keyword performance

## Resources

- [Google Search Console API Documentation](https://developers.google.com/webmaster-tools/search-console-api-original)
- [Service Account Setup](https://cloud.google.com/iam/docs/service-accounts)
- [API Reference](https://developers.google.com/webmaster-tools/search-console-api-original/v1)

