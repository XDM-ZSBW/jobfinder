# Manual SES DNS Setup for jobmatch.zip

Since the Porkbun API is returning 403 Forbidden (likely permission issues), here are the DNS records to add manually via the Porkbun web interface.

## Current Status

✅ **Already Configured:**
- SPF Record: `v=spf1 include:_spf.porkbun.com ~all` (needs update)
- DMARC Record: Already configured

❌ **Need to Add:**
- SES Domain Verification Record
- Update SPF to include Amazon SES
- DKIM Records (after domain verification)

## Step 1: Add SES Domain Verification Record

1. Go to Porkbun DNS management: https://porkbun.com/account/domains/Speedy
2. Click "Add Record" or edit DNS for `jobmatch.zip`
3. Add this TXT record:

   **Type:** TXT  
   **Host:** `_amazonses`  
   **Answer:** `BP2gT0QVHcIJVODH3NjWQrhlAGxRgo+VJW8SOExrJ5U=`  
   **TTL:** 600

   (Get current token: `aws ses get-identity-verification-attributes --identities jobmatch.zip --region us-west-2`)

## Step 2: Update SPF Record

1. Find the existing SPF TXT record for `jobmatch.zip`
2. Update the value from:
   ```
   v=spf1 include:_spf.porkbun.com ~all
   ```
   To:
   ```
   v=spf1 include:_spf.porkbun.com include:amazonses.com ~all
   ```

   This allows both Porkbun and Amazon SES to send emails.

## Step 3: Wait for Domain Verification

After adding the verification record:
1. Wait 5-10 minutes for DNS propagation
2. Check verification status:
   ```powershell
   aws ses get-identity-verification-attributes --identities jobmatch.zip --region us-west-2
   ```
3. Once status is "Success", proceed to Step 4

## Step 4: Enable DKIM and Add DKIM Records

After domain is verified:

1. **Enable DKIM:**
   ```powershell
   aws ses set-identity-dkim-enabled --identity jobmatch.zip --dkim-enabled --region us-west-2
   ```

2. **Get DKIM Tokens:**
   ```powershell
   aws ses get-identity-dkim-attributes --identities jobmatch.zip --region us-west-2
   ```

3. **Add 3 CNAME Records** (one for each DKIM token):
   
   For each token (e.g., `abc123def456`), add:
   
   **Type:** CNAME  
   **Host:** `abc123def456._domainkey`  
   **Answer:** `abc123def456.dkim.amazonses.com`  
   **TTL:** 600

   Repeat for all 3 tokens.

## Step 5: Verify Everything

```powershell
# Check domain verification
aws ses get-identity-verification-attributes --identities jobmatch.zip --region us-west-2

# Check DKIM status
aws ses get-identity-dkim-attributes --identities jobmatch.zip --region us-west-2

# Should show:
# - VerificationStatus: Success
# - DkimVerificationStatus: Success
```

## Step 6: Test Email

Send a test email and check:
- Email arrives in inbox (not spam)
- Email headers show SPF, DKIM, and DMARC pass

## Troubleshooting

### API 403 Error
The Porkbun API is returning 403 Forbidden. Possible reasons:
- API key doesn't have DNS management permissions
- Domain not associated with API key account
- API key needs to be regenerated with proper permissions

**Solution:** Use manual DNS management via web interface (this guide)

### DNS Propagation
- DNS changes can take 5-60 minutes to propagate
- Use `nslookup` or `dig` to check if records are live:
  ```powershell
  nslookup -type=TXT _amazonses.jobmatch.zip
  nslookup -type=TXT jobmatch.zip
  ```

### Verification Fails
- Double-check the verification token is correct
- Ensure TXT record is at `_amazonses.jobmatch.zip` (not `jobmatch.zip`)
- Wait longer for DNS propagation

## Quick Reference Commands

```powershell
# Get verification token
aws ses verify-domain-identity --domain jobmatch.zip --region us-west-2

# Check verification status
aws ses get-identity-verification-attributes --identities jobmatch.zip --region us-west-2

# Enable DKIM
aws ses set-identity-dkim-enabled --identity jobmatch.zip --dkim-enabled --region us-west-2

# Get DKIM tokens
aws ses get-identity-dkim-attributes --identities jobmatch.zip --region us-west-2

# Test email sending
.\scripts\test-ses-email.ps1 -ToEmail "your@email.com"
```

