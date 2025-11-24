# SES Verified Email Addresses

This document tracks email addresses that have been verified in AWS SES for sandbox mode.

## Verified Recipients (Sandbox Mode)

In AWS SES sandbox mode, you can only send emails to verified email addresses. This list tracks which emails have been verified.

### Current Verified Emails

| Email Address | Status | Verified Date | Notes |
|--------------|--------|---------------|-------|
| me@myl.zip | Verified | 2025-01-XX | ✅ ProtonMail account - tested and working |
| bcherrman@gmail.com | Verified | - | ✅ Gmail account - can receive emails |
| admin@futurelink.zip | Verified | - | ✅ Can receive emails in sandbox mode |
| info@jobmatch.zip | Verified | - | ✅ Sender email - can send emails |

## How to Verify an Email Address

### Using the Verification Script

```powershell
.\scripts\verify-ses-email.ps1 -EmailAddress "email@example.com"
```

This script will:
1. Check if the email is already verified
2. Send a verification request if not verified
3. Provide instructions for completing verification

### Manual Verification via AWS CLI

```powershell
# Request verification
aws ses verify-email-identity --email-address "email@example.com" --region us-west-2

# Check verification status
aws ses get-identity-verification-attributes --identities "email@example.com" --region us-west-2
```

### Via AWS Console

1. Go to [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Navigate to "Verified identities" → "Email addresses"
3. Click "Create identity" → "Email address"
4. Enter the email address and click "Create identity"
5. Check the email inbox and click the verification link

## Verification Process

1. **Request Verification**: Send verification request via script or AWS console
2. **Check Email**: Look for email from `noreply-aws@amazon.com`
3. **Click Link**: Click the verification link in the email
4. **Status Update**: Status changes from "Pending" to "Success" (usually within minutes)

## Checking Verification Status

### Using the Script

```powershell
.\scripts\verify-ses-email.ps1 -EmailAddress "email@example.com"
```

### Using AWS CLI

```powershell
aws ses get-identity-verification-attributes --identities "email@example.com" --region us-west-2
```

### List All Verified Emails

```powershell
.\scripts\list-ses-verified-emails.ps1
```

## Moving Out of Sandbox Mode

To send emails to any address without verification:

1. Go to AWS SES Console
2. Navigate to "Account dashboard"
3. Click "Request production access"
4. Fill out the form explaining your use case
5. Wait for AWS approval (usually 24-48 hours)

**Note**: Production access allows sending to any email address, but you still need to verify sender email/domain.

## Troubleshooting

### Email Not Received

- Check spam folder
- Verify email address is correct
- Wait 5-10 minutes for email delivery
- Check AWS SES console for any errors

### Verification Link Expired

- Request a new verification email
- Links typically expire after 24 hours

### Status Stuck on "Pending"

- Check if verification email was clicked
- Re-request verification if needed
- Check AWS SES console for status

## Related Scripts

- `scripts/verify-ses-email.ps1` - Verify an email address
- `scripts/list-ses-verified-emails.ps1` - List all verified emails
- `scripts/test-ses-email.ps1` - Test sending email to a verified address
- `scripts/test-protonmail-email.ps1` - Test sending to ProtonMail addresses

## ProtonMail Testing

For testing email delivery to ProtonMail addresses, see:
- [ProtonMail Email Testing Guide](PROTONMAIL_EMAIL_TESTING.md)

