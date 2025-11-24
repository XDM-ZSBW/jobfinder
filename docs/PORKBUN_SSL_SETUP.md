# Porkbun SSL Certificate Setup Guide

## Overview

This guide explains how to use Porkbun API to retrieve and configure SSL certificates for the JobMatch Platform deployment.

## Prerequisites

1. **Porkbun Account**: You need a Porkbun account with API access enabled
2. **API Credentials**: Obtain your Porkbun API key and secret key from the Porkbun dashboard
3. **Domain**: The domain (jobmatch.zip) must be registered with Porkbun or DNS must point to Porkbun nameservers

## Initial Setup

### 1. Get Porkbun API Credentials

1. Log into your Porkbun account
2. Navigate to Account Settings → API Access
3. Generate or retrieve your API key and secret key
4. Keep these credentials secure - they provide full access to your domain

### 2. Configure Credentials Locally

Run the credential setup script (one-time setup):

```bash
./scripts/setup-porkbun-credentials.sh
```

Or using Warp:

```bash
warp setup-porkbun
```

This will:
- Prompt you for your Porkbun API key and secret key
- Validate credentials by making a test API call
- Save credentials to `.porkbun-credentials` file (gitignored)
- Set file permissions to 600 (owner read/write only)

**Security Note**: The `.porkbun-credentials` file is automatically added to `.gitignore` and will never be committed to version control.

## SSL Certificate Retrieval

### Automatic Retrieval (Recommended)

The deployment script automatically retrieves SSL certificates:

```bash
./scripts/deploy-with-dns.sh
```

This will:
1. Check for Porkbun credentials
2. Prompt to set up credentials if missing
3. Retrieve SSL certificate bundle from Porkbun API
4. Configure Nginx with the certificates
5. Set up HTTPS redirect

### Manual Retrieval

To retrieve SSL certificates manually:

```bash
./scripts/porkbun-ssl-setup.sh
```

Or using Warp:

```bash
warp porkbun-ssl
```

## How It Works

1. **API Call**: Script makes authenticated API call to Porkbun
2. **Certificate Download**: Retrieves certificate, private key, and certificate chain
3. **VM Upload**: Uploads certificates to GCP VM at `/etc/nginx/ssl/jobmatch.zip/`
4. **Nginx Configuration**: Updates Nginx config to use Porkbun certificates
5. **Service Reload**: Reloads Nginx to apply SSL configuration

## Certificate Storage

Certificates are stored on the VM at:
- **Certificate**: `/etc/nginx/ssl/jobmatch.zip/fullchain.pem`
- **Private Key**: `/etc/nginx/ssl/jobmatch.zip/privkey.pem`
- **Permissions**: Private key has 600 permissions (owner read/write only)

## Certificate Renewal

### Automatic Renewal Check

The Warp workflow (`warp-workflows/porkbun-ssl.yaml`) automatically checks certificate expiration every 30 days and renews if needed.

### Manual Renewal

To manually renew certificates:

```bash
./scripts/porkbun-ssl-setup.sh
```

Certificates should be renewed before expiration (typically 90 days validity).

## Porkbun API Endpoints

The script uses the following Porkbun API endpoints:

- **Ping/Validation**: `https://porkbun.com/api/json/v3/ping`
- **SSL Retrieve**: `https://porkbun.com/api/json/v3/ssl/retrieve/{domain}`

**Note**: Actual API endpoints may vary. Check [Porkbun API Documentation](https://porkbun.com/api/json/v3/documentation) for the latest endpoints.

## Troubleshooting

### Credentials Not Found

**Error**: `Credentials file not found: .porkbun-credentials`

**Solution**: Run `./scripts/setup-porkbun-credentials.sh` to set up credentials

### Invalid Credentials

**Error**: `Credential validation failed`

**Solution**: 
1. Verify API key and secret key are correct
2. Check that API access is enabled in Porkbun dashboard
3. Ensure your account has access to the domain

### Certificate Retrieval Failed

**Error**: `Failed to retrieve certificate bundle`

**Possible Causes**:
1. Domain not registered with Porkbun
2. DNS not pointing to Porkbun nameservers
3. SSL certificate not issued for domain in Porkbun
4. API endpoint changed (check Porkbun API documentation)

**Solution**:
1. Verify domain is registered/managed in Porkbun
2. Check DNS configuration
3. Issue SSL certificate via Porkbun dashboard first
4. Update API endpoint in script if Porkbun API changed

### Nginx Configuration Error

**Error**: `nginx: configuration file test failed`

**Solution**:
1. SSH into VM: `gcloud compute ssh jobmatch-vm --zone=us-central1-a`
2. Check Nginx config: `sudo nginx -t`
3. Verify certificate files exist: `ls -la /etc/nginx/ssl/jobmatch.zip/`
4. Check file permissions: `sudo chmod 600 /etc/nginx/ssl/jobmatch.zip/privkey.pem`

## Security Best Practices

1. **Never Commit Credentials**: The `.porkbun-credentials` file is gitignored
2. **Restrictive Permissions**: Credentials file has 600 permissions (owner only)
3. **Rotate Credentials**: Regularly rotate API keys in Porkbun dashboard
4. **Monitor Usage**: Check Porkbun API usage logs for unauthorized access
5. **Secure Storage**: Consider using a secrets manager for production environments

## Warp Integration

Warp workflows automatically handle SSL certificate management:

- **Pre-deployment**: Checks for credentials
- **During deployment**: Retrieves and configures SSL certificates
- **Post-deployment**: Monitors certificate expiration
- **Auto-renewal**: Renews certificates before expiration

View workflow: `warp-workflows/porkbun-ssl.yaml`

## Alternative: Manual Certificate Upload

If Porkbun API is unavailable, you can manually upload certificates:

1. Download certificate bundle from Porkbun dashboard
2. Extract certificate, private key, and chain files
3. Upload to VM:
   ```bash
   gcloud compute scp cert.pem jobmatch-vm:/tmp/ --zone=us-central1-a
   gcloud compute scp privkey.pem jobmatch-vm:/tmp/ --zone=us-central1-a
   gcloud compute scp fullchain.pem jobmatch-vm:/tmp/ --zone=us-central1-a
   ```
4. Move to SSL directory on VM:
   ```bash
   gcloud compute ssh jobmatch-vm --zone=us-central1-a
   sudo mkdir -p /etc/nginx/ssl/jobmatch.zip
   sudo mv /tmp/*.pem /etc/nginx/ssl/jobmatch.zip/
   sudo chmod 600 /etc/nginx/ssl/jobmatch.zip/privkey.pem
   sudo nginx -t && sudo systemctl reload nginx
   ```

## References

- [Porkbun API Documentation](https://porkbun.com/api/json/v3/documentation)
- [Porkbun SSL Certificate Guide](https://porkbun.com/support/article/how-do-i-use-ssl-certificates)
- Deployment Guide: `DEPLOY_TO_JOBMATCH_ZIP.md`

