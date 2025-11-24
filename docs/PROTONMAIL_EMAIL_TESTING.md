# ProtonMail Email Testing Guide

This guide covers testing email delivery to ProtonMail addresses via Amazon SES.

## Overview

ProtonMail is a privacy-focused email service that uses end-to-end encryption. Testing email delivery to ProtonMail addresses helps ensure your SES integration works with various email providers.

## Current Status

✅ **Verified ProtonMail Addresses:**
- `me@myl.zip` (ProtonMail account) - Verified and tested

## Testing ProtonMail Email Delivery

### Quick Test

```powershell
.\scripts\test-protonmail-email.ps1 -ToEmail "your@protonmail.com"
```

### With Verification Check

```powershell
.\scripts\test-protonmail-email.ps1 -ToEmail "your@protonmail.com" -VerifyFirst
```

## SES Sandbox Mode vs Production Mode

### Sandbox Mode (Current)

**Limitations:**
- Can only send to verified email addresses
- Max 200 emails per 24 hours
- Must verify each recipient email before sending

**To Send to ProtonMail in Sandbox:**
1. Verify the ProtonMail email address:
   ```powershell
   .\scripts\verify-ses-email.ps1 -EmailAddress "your@protonmail.com"
   ```
2. Check email inbox for verification link
3. Click verification link
4. Once verified, you can send emails

### Production Mode (Future)

**Benefits:**
- Can send to any email address (no verification needed)
- Higher sending limits (requested during approval)
- Better for production use

**To Request Production Access:**
1. Go to [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Navigate to "Account dashboard"
3. Click "Request production access"
4. Fill out the form:
   - **Use case:** Email verification codes for user authentication
   - **Website URL:** https://jobmatch.zip
   - **Describe your use case:** 
     ```
     We send email verification codes to users during the authentication process. 
     Users can sign up with any email address (including ProtonMail, Gmail, etc.) 
     and receive verification codes to complete their registration/login.
     ```
   - **Do you have a process to handle bounces/complaints?** Yes
   - **Expected sending volume:** Start with low volume (< 1000/day), scale up as needed
5. Submit request
6. Wait for AWS approval (usually 24-48 hours)

## Testing Checklist

### Before Production Access

- [ ] Test with verified ProtonMail addresses
- [ ] Verify email delivery to ProtonMail inbox
- [ ] Check spam folder (ProtonMail may filter initially)
- [ ] Verify email headers show proper authentication (SPF, DKIM, DMARC)
- [ ] Test with different ProtonMail domains:
  - `@protonmail.com`
  - `@proton.me`
  - `@pm.me`

### After Production Access

- [ ] Test sending to unverified ProtonMail addresses
- [ ] Monitor bounce rates
- [ ] Check complaint rates
- [ ] Verify delivery to inbox (not spam)
- [ ] Test with various ProtonMail addresses

## Common Issues

### Emails Going to Spam

**Causes:**
- Missing or incorrect SPF records
- Missing DKIM signatures
- Missing DMARC policy
- Low sender reputation

**Solutions:**
1. Verify DNS records are correct:
   ```powershell
   .\scripts\setup-ses-dns-records.ps1
   ```
2. Check SPF record includes Amazon SES:
   ```
   v=spf1 include:_spf.porkbun.com include:amazonses.com ~all
   ```
3. Verify DKIM is enabled and records are added
4. Set up DMARC policy
5. Build sender reputation gradually

### Verification Required Error

**Error:** "Email address is not verified"

**Solution:**
- In sandbox mode, verify the ProtonMail email first:
  ```powershell
  .\scripts\verify-ses-email.ps1 -EmailAddress "your@protonmail.com"
  ```
- Or request production access to send to any email

### Email Not Received

**Check:**
1. Spam folder
2. Email address is correct
3. SES sending statistics:
   ```powershell
   aws ses get-send-statistics --region us-west-2
   ```
4. Backend logs for errors
5. AWS SES console for bounces/complaints

## Scripts

- `scripts/test-protonmail-email.ps1` - Test sending to ProtonMail addresses
- `scripts/verify-ses-email.ps1` - Verify email addresses in SES
- `scripts/test-ses-email.ps1` - General SES email testing
- `scripts/list-ses-verified-emails.ps1` - List all verified emails

## Best Practices

1. **Start Small:** Test with a few ProtonMail addresses first
2. **Monitor Metrics:** Watch bounce and complaint rates
3. **Build Reputation:** Send consistently to build sender reputation
4. **Handle Bounces:** Implement bounce handling in your application
5. **Respect Privacy:** ProtonMail users value privacy - ensure your emails are legitimate

## Next Steps

1. **Immediate:** Continue testing with verified ProtonMail addresses
2. **Short-term:** Request production access from AWS
3. **Long-term:** Monitor delivery rates and optimize email content

## Related Documentation

- [SES Verified Emails Guide](SES_VERIFIED_EMAILS.md)
- [SES Troubleshooting Guide](SES_TROUBLESHOOTING.md)
- [Email Spam Fix Guide](EMAIL_SPAM_FIX.md)

