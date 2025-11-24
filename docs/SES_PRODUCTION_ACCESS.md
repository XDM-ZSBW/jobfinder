# Requesting SES Production Access

This guide helps you request production access for Amazon SES, which allows sending emails to any email address (including ProtonMail) without verification.

## Current Status

**Account Status:** SANDBOX MODE
- Max send rate: 200 emails per 24 hours
- Can only send to verified email addresses
- Verified emails: 4 addresses + 1 domain

## Why Request Production Access?

**Benefits:**
- ✅ Send to any email address (no verification needed)
- ✅ Higher sending limits (requested during approval)
- ✅ Better for production use
- ✅ Can send to ProtonMail, Gmail, and other providers without pre-verification

**When to Request:**
- You're ready to launch publicly
- You need to send to unverified email addresses
- You want higher sending limits
- You've tested thoroughly in sandbox mode

## How to Request Production Access

### Step 1: Prepare Your Request

**Use Case Details:**
- **Website URL:** https://jobmatch.zip
- **Use Case:** Email verification codes for user authentication
- **Description:**
  ```
  We operate an AI-enabled job matching platform (jobmatch.zip) that requires 
  email verification for user authentication. Users can sign up with any email 
  address (including ProtonMail, Gmail, etc.) and receive verification codes 
  to complete their registration/login process.
  
  Our platform:
  - Sends one-time verification codes to users
  - Uses email for password reset functionality
  - Sends transactional emails only (no marketing)
  - Implements proper bounce and complaint handling
  ```

### Step 2: Access AWS SES Console

1. Go to [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Make sure you're in the correct region (us-west-2)
3. Navigate to **"Account dashboard"** (left sidebar)
4. Look for **"Request production access"** section

### Step 3: Fill Out the Request Form

**Required Information:**

1. **Mail Type:**
   - Select: "Transactional"

2. **Website URL:**
   - Enter: `https://jobmatch.zip`

3. **Use Case:**
   - Select: "Email verification codes" or "User authentication"

4. **Describe your use case:**
   ```
   We send email verification codes to users during the authentication process 
   on our job matching platform. Users can sign up with any email address 
   (including ProtonMail, Gmail, etc.) and receive verification codes to 
   complete their registration/login.
   
   Our platform:
   - Sends one-time verification codes (6-digit codes)
   - Uses email for password reset functionality
   - Sends transactional emails only (no marketing or promotional content)
   - Implements proper bounce and complaint handling
   - Has a clear unsubscribe mechanism for non-transactional emails
   ```

5. **Do you have a process to handle bounces and complaints?**
   - Select: **Yes**
   - Explain:
     ```
     Yes, we have implemented bounce and complaint handling:
     - We monitor bounce rates via SES sending statistics
     - We remove invalid email addresses from our database
     - We have a process to handle user complaints
     - We respect unsubscribe requests immediately
     ```

6. **Expected sending volume:**
   - **Initial:** Start with low volume (< 1000 emails per day)
   - **Growth:** Scale up gradually as user base grows
   - **Peak:** Up to 10,000 emails per day (can request increase later)

7. **How do you plan to build your sending reputation?**
   ```
   We plan to:
   - Start with low volume and gradually increase
   - Send only transactional emails (verification codes)
   - Monitor bounce and complaint rates closely
   - Remove invalid email addresses immediately
   - Maintain proper SPF, DKIM, and DMARC records
   - Build reputation through consistent, legitimate email sending
   ```

8. **Do you have a process to handle unsubscribe requests?**
   - Select: **Yes** (for any non-transactional emails)
   - Note: Verification codes are transactional and don't require unsubscribe

### Step 4: Submit and Wait

1. Review all information
2. Click **"Submit"**
3. Wait for AWS review (usually 24-48 hours)
4. Check email for approval notification

## After Approval

### Immediate Actions

1. **Test with Unverified Emails:**
   ```powershell
   .\scripts\test-protonmail-email.ps1 -ToEmail "test@protonmail.com"
   ```

2. **Monitor Metrics:**
   ```powershell
   aws ses get-send-statistics --region us-west-2
   ```

3. **Check Sending Limits:**
   ```powershell
   aws ses get-send-quota --region us-west-2
   ```

### Best Practices

1. **Start Small:** Begin with low volume
2. **Monitor Closely:** Watch bounce and complaint rates
3. **Handle Bounces:** Remove invalid addresses immediately
4. **Maintain Reputation:** Send consistently and legitimately
5. **Respect Privacy:** Especially important for ProtonMail users

## Checking Request Status

1. Go to AWS SES Console
2. Navigate to "Account dashboard"
3. Check "Account status" section
4. Status will show:
   - **Sandbox** (current)
   - **Pending** (request submitted)
   - **Production** (approved)

## Troubleshooting

### Request Denied

**Common Reasons:**
- Use case not clearly explained
- Missing bounce/complaint handling process
- Unclear sending volume expectations

**Solution:**
- Resubmit with more detailed information
- Provide more context about your application
- Explain your bounce/complaint handling process

### Still in Sandbox After Approval

**Check:**
- Correct AWS region
- Account status in SES console
- Email notifications from AWS

## Related Documentation

- [ProtonMail Email Testing Guide](PROTONMAIL_EMAIL_TESTING.md)
- [SES Verified Emails Guide](SES_VERIFIED_EMAILS.md)
- [SES Troubleshooting Guide](SES_TROUBLESHOOTING.md)

## Quick Reference

**Current Limits (Sandbox):**
- Max send: 200 emails per 24 hours
- Only verified recipients

**After Production Access:**
- Higher limits (as requested)
- Any email address
- Better for production use

**Request URL:**
https://console.aws.amazon.com/ses/home?region=us-west-2#/account

