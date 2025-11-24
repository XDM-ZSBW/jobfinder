# Local SSL Setup for localhost.jobmatch.zip

## Problem with CNAME to localhost

A **CNAME record pointing to `localhost` won't work** for SSL certificates because:

1. **DNS Resolution**: When your browser resolves `localhost.jobmatch.zip`:
   - It follows the CNAME to `localhost`
   - Tries to resolve `localhost` via DNS (which may fail or resolve incorrectly)
   - The SSL certificate check will fail because the certificate doesn't match

2. **Certificate Validation**: SSL certificates validate the **exact domain name** in the request. If your certificate is for `jobmatch.zip` and `www.jobmatch.zip`, it won't work for `localhost.jobmatch.zip` unless that domain is explicitly included in the certificate's Subject Alternative Names (SANs).

## Solution: Use hosts file + Certificate with SAN

### Option 1: Add to hosts file (Recommended for local dev)

1. **Add to Windows hosts file** (`C:\Windows\System32\drivers\etc\hosts`):
   ```
   127.0.0.1    localhost.jobmatch.zip
   ```

2. **Ensure SSL certificate includes `localhost.jobmatch.zip`**:
   - When requesting/renewing your SSL certificate, include `localhost.jobmatch.zip` in the Subject Alternative Names (SANs)
   - Or use a wildcard certificate `*.jobmatch.zip` (if your CA supports it)

3. **Configure your local dev server** to accept `localhost.jobmatch.zip`:
   - Update Next.js config to accept this hostname
   - Update Nginx/local proxy if using one

### Option 2: Use A record (Not recommended)

You could create an A record pointing to `127.0.0.1`, but:
- This won't work for external access
- Still requires certificate to include the domain
- DNS propagation issues

### Option 3: Self-signed certificate for local dev

For local development only, you can use a self-signed certificate:

```powershell
# Generate self-signed certificate for localhost.jobmatch.zip
openssl req -x509 -newkey rsa:4096 -keyout localhost.jobmatch.zip.key -out localhost.jobmatch.zip.crt -days 365 -nodes -subj "/CN=localhost.jobmatch.zip" -addext "subjectAltName=DNS:localhost.jobmatch.zip"
```

Then configure your local dev server to use this certificate.

## Checking your current certificate

To see what domains your current certificate supports:

```bash
# Extract and check certificate
openssl x509 -in fullchain.pem -text -noout | grep -A 1 "Subject Alternative Name"
```

## Recommended Setup

1. **For Production** (`jobmatch.zip`):
   - Use your existing SSL certificate
   - DNS A record pointing to VM IP

2. **For Local Development** (`localhost.jobmatch.zip`):
   - Add to hosts file: `127.0.0.1 localhost.jobmatch.zip`
   - Use self-signed certificate OR
   - Request certificate with `localhost.jobmatch.zip` in SANs
   - Configure local dev server to use HTTPS

3. **Update Next.js config** (`frontend/next.config.js`):
   ```javascript
   module.exports = {
     // ... existing config
     async headers() {
       return [
         {
           source: '/:path*',
           headers: [
             {
               key: 'Host',
               value: 'localhost.jobmatch.zip',
             },
           ],
         },
       ];
     },
   };
   ```

## Quick Setup Script

Create `scripts/setup-local-ssl.ps1`:

```powershell
# Add to hosts file
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$entry = "127.0.0.1`tlocalhost.jobmatch.zip"
if (-not (Select-String -Path $hostsPath -Pattern "localhost.jobmatch.zip")) {
    Add-Content -Path $hostsPath -Value $entry
    Write-Host "✅ Added localhost.jobmatch.zip to hosts file" -ForegroundColor Green
} else {
    Write-Host "⚠️  Entry already exists in hosts file" -ForegroundColor Yellow
}
```

