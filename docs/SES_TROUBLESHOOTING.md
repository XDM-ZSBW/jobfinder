# Amazon SES Email Troubleshooting Guide

## Common Issues

### 1. "Failed to send email code: Failed to fetch"

This error typically indicates:
- SES credentials not configured
- Email provider mode not set to "ses"
- `SES_FROM_EMAIL` not set or incorrect
- Domain/email not verified in AWS SES
- SES sandbox restrictions

### 2. Configuration Checklist

**Required Environment Variables:**
```bash
EMAIL_PROVIDER_MODE=ses
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
SES_REGION=us-west-2  # or your SES region
SES_FROM_EMAIL=info@jobmatch.zip
```

### 3. AWS SES Setup Steps

1. **Verify Sender Email/Domain in AWS SES:**
   - Go to AWS SES Console
   - Navigate to "Verified identities"
   - Add and verify `info@jobmatch.zip` or verify the entire `jobmatch.zip` domain
   - For domain verification, add DNS records (TXT, CNAME) as instructed

2. **Verify Recipient Emails (Sandbox Mode):**
   - By default, SES is in sandbox mode
   - Sandbox only allows sending to verified email addresses
   - Verify recipient emails using the verification script:
     ```powershell
     .\scripts\verify-ses-email.ps1 -EmailAddress "recipient@example.com"
     ```
   - Check verification status:
     ```powershell
     .\scripts\list-ses-verified-emails.ps1
     ```
   - See [SES Verified Emails Guide](SES_VERIFIED_EMAILS.md) for more details

3. **Move Out of Sandbox (Production):**
   - Request production access in SES Console → Account dashboard → Request production access
   - Production mode allows sending to any email address (sender still needs verification)

4. **IAM Permissions:**
   Ensure your AWS IAM user/role has:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "ses:SendEmail",
           "ses:SendRawEmail",
           "ses:GetSendQuota",
           "ses:GetSendStatistics"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

### 4. Verifying Recipient Emails

**In Sandbox Mode**, you must verify recipient email addresses before sending:

```powershell
# Verify a recipient email
.\scripts\verify-ses-email.ps1 -EmailAddress "recipient@example.com"

# List all verified emails
.\scripts\list-ses-verified-emails.ps1

# Check specific email status
aws ses get-identity-verification-attributes --identities "recipient@example.com" --region us-west-2
```

**Verification Process:**
1. Run verification script to send verification request
2. Check email inbox for verification email from AWS
3. Click verification link in email
4. Status changes to "Success" (usually within minutes)

See [SES Verified Emails Guide](SES_VERIFIED_EMAILS.md) for complete documentation.

### 5. Testing SES Configuration

**On VM:**
```bash
cd /opt/jobmatch
docker compose exec app python3 << 'EOF'
from backend.auth.email_provider import create_email_manager
import asyncio

manager = create_email_manager()
print(f"Provider Mode: {manager.provider_mode}")
print(f"From Email: {manager.from_email}")
print(f"SES Client: {'INITIALIZED' if manager.ses_client else 'NOT INITIALIZED'}")

if manager.ses_client:
    try:
        quota = manager.ses_client.get_send_quota()
        print(f"Send Quota: {quota}")
    except Exception as e:
        print(f"Error: {e}")
EOF
```

### 6. Common Error Codes

- **MessageRejected**: Email address/domain not verified
- **AccountSendingPausedException**: Account sending paused (check SES console)
- **MailFromDomainNotVerifiedException**: MAIL FROM domain not verified
- **ConfigurationSetDoesNotExistException**: Configuration set doesn't exist

### 7. Quick Fix Script

```powershell
# Update .env on VM
gcloud compute ssh jobmatch-vm --zone=us-central1-a --command="cd /opt/jobmatch && \
  echo 'EMAIL_PROVIDER_MODE=ses' >> .env && \
  echo 'SES_FROM_EMAIL=info@jobmatch.zip' >> .env && \
  echo 'SES_REGION=us-west-2' >> .env && \
  # Add AWS credentials (replace with actual values)
  echo 'AWS_ACCESS_KEY_ID=your_key' >> .env && \
  echo 'AWS_SECRET_ACCESS_KEY=your_secret' >> .env && \
  docker compose restart app"
```

### 8. Verify Email is Sent

Check backend logs:
```bash
docker compose logs app | grep -i "email\|ses"
```

Look for:
- `SES email sent to...` (success)
- `SES email send failed` (error details)

### 9. Fallback to SMTP

If SES continues to fail, temporarily use SMTP:
```bash
EMAIL_PROVIDER_MODE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=info@jobmatch.zip
```

