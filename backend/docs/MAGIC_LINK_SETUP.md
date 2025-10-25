# Magic Link Authentication Setup Guide

This guide covers the complete setup for magic link authentication using Amazon SES.

## 🚀 Quick Setup

### 1. Database Migration

Run the migration to create the MagicLink table:

```bash
# For production (Google Cloud)
npx prisma migrate deploy

# For development (if you have local PostgreSQL)
npx prisma migrate dev --name add-magic-link-model
```

### 2. Google Secret Manager Setup

Add AWS credentials to Google Secret Manager:

```bash
# Run the setup script
chmod +x scripts/setup-aws-secrets.sh
./scripts/setup-aws-secrets.sh
```

Or manually:

```bash
# AWS Access Key ID
echo "YOUR_AWS_ACCESS_KEY_ID" | gcloud secrets create jobmatch-aws-access-key-id \
  --data-file=- \
  --project=futurelink-private-112912460 \
  --replication-policy="automatic"

# AWS Secret Access Key  
echo "YOUR_AWS_SECRET_ACCESS_KEY" | gcloud secrets create jobmatch-aws-secret-access-key \
  --data-file=- \
  --project=futurelink-private-112912460 \
  --replication-policy="automatic"
```

### 3. Environment Variables

Add these to your deployment configuration:

```bash
# AWS SES Configuration
AWS_REGION=us-west-2
SES_REGION=us-west-2
SES_FROM_EMAIL=admin@futurelink.zip
EMAIL_PROVIDER_MODE=sdk
USE_SES_TRANSPORT=true
AWS_S3_BUCKET=futurelink-storage
```

### 4. Test Email Service

Test the SES configuration:

```bash
# Set test email (optional)
export TEST_EMAIL=your-email@example.com

# Run test
node scripts/test-ses.js
```

## 🔧 Configuration Details

### Secret Manager Names

The following secrets are automatically loaded from Google Secret Manager:

- `jobmatch-jwt-secret` - JWT signing secret
- `jobmatch-database-url` - PostgreSQL connection string
- `jobmatch-gemini-key` - Google Gemini API key
- `jobmatch-aws-access-key-id` - AWS access key
- `jobmatch-aws-secret-access-key` - AWS secret key

### Email Template

The magic link email includes:

- Professional HTML design with JobMatch AI branding
- Security warnings about expiration and one-time use
- Plain text fallback for all email clients
- Mobile-responsive design
- Clear call-to-action button

### Security Features

- **15-minute expiration** - Links expire quickly for security
- **One-time use** - Tokens are marked as used after verification
- **Automatic cleanup** - Expired tokens are cleaned up
- **Rate limiting** - Prevents abuse of magic link requests

## 📱 Chrome Extension Integration

The Chrome extension now supports:

1. **Email-only login** - No password required
2. **Real-time polling** - Automatically detects when user clicks magic link
3. **Seamless experience** - No manual refresh needed
4. **Error handling** - Clear feedback for all error states

### Extension Flow

1. User enters email address
2. Extension sends magic link request
3. Backend generates token and sends email via SES
4. User clicks link in email
5. Extension polls for authentication status
6. User is automatically logged in

## 🐛 Troubleshooting

### Common Issues

1. **Email not received**
   - Check spam folder
   - Verify sender email is verified in SES
   - Check AWS SES sending limits

2. **Authentication fails**
   - Verify JWT_SECRET is set
   - Check database connection
   - Ensure MagicLink table exists

3. **SES errors**
   - Verify AWS credentials
   - Check AWS region configuration
   - Ensure SES is enabled in your AWS account

### Debug Mode

In development, the magic link is also logged to console for testing:

```bash
NODE_ENV=development npm run dev:backend
```

## 📊 Monitoring

Monitor magic link usage:

```sql
-- Check recent magic link usage
SELECT email, used, createdAt, expiresAt 
FROM "MagicLink" 
ORDER BY createdAt DESC 
LIMIT 10;

-- Check expired tokens
SELECT COUNT(*) as expired_count 
FROM "MagicLink" 
WHERE expiresAt < NOW() AND used = false;
```

## 🔄 Cleanup

Set up automatic cleanup of expired tokens:

```sql
-- Delete expired tokens (run periodically)
DELETE FROM "MagicLink" 
WHERE expiresAt < NOW() - INTERVAL '1 day';
```

## ✅ Verification

To verify everything is working:

1. Load the Chrome extension
2. Enter an email address
3. Check your email for the magic link
4. Click the link
5. Extension should automatically log you in

The magic link authentication is now fully integrated and ready for production use!
