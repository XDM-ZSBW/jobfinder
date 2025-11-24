# Email Spam Fix - Troubleshooting Guide

## Current Status Check

Run these commands to check current status:

```powershell
# Check DKIM status
aws ses get-identity-dkim-attributes --identities jobmatch.zip --region us-west-2

# Check domain verification
aws ses get-identity-verification-attributes --identities jobmatch.zip --region us-west-2

# Check DNS records
nslookup -type=TXT jobmatch.zip
nslookup -type=TXT _dmarc.jobmatch.zip
nslookup -type=CNAME he54qttado6cgr65w46qajuiylox7t2t._domainkey.jobmatch.zip
```

## Common Issues & Solutions

### 1. DKIM Not Verified

**Symptom:** DKIM Verification Status shows "Pending" or "NotStarted"

**Solution:**
- Verify all 3 DKIM CNAME records are added correctly
- Wait 10-15 minutes for DNS propagation
- Check DNS records:
  ```powershell
  nslookup -type=CNAME he54qttado6cgr65w46qajuiylox7t2t._domainkey.jobmatch.zip
  nslookup -type=CNAME beazh43bihjlyswaxiazfzpcfp3wpjhr._domainkey.jobmatch.zip
  nslookup -type=CNAME cshh7edtqtspu27t6juxi55ge7vbf5ws._domainkey.jobmatch.zip
  ```

### 2. SPF Record Issues

**Symptom:** SPF check fails in email headers

**Solution:**
- Ensure SPF record includes: `include:amazonses.com`
- Check current SPF:
  ```powershell
  nslookup -type=TXT jobmatch.zip
  ```
- Should show: `v=spf1 include:_spf.porkbun.com include:amazonses.com ~all`

### 3. Domain Reputation

**Symptom:** All records correct but still going to spam

**Solutions:**
- **Warm up the domain:** Start with low volume, gradually increase
- **Use dedicated IP:** Consider SES dedicated IP (costs extra)
- **Check sender reputation:** Use tools like:
  - https://mxtoolbox.com/blacklists.aspx
  - https://www.mail-tester.com/
- **Avoid spam triggers:**
  - Don't use spammy words in subject/body
  - Include unsubscribe link
  - Use proper HTML formatting
  - Don't send too many emails too quickly

### 4. Gmail-Specific Issues

**Symptom:** Emails go to spam in Gmail specifically

**Solutions:**
- **Set up Gmail Postmaster Tools:**
  1. Go to https://postmaster.google.com/
  2. Add jobmatch.zip domain
  3. Verify domain ownership
  4. Monitor reputation metrics

- **Check Gmail feedback loop:**
  - Gmail may mark as spam if users mark previous emails as spam
  - Build reputation gradually

- **Use Gmail-friendly formatting:**
  - Plain text + HTML multipart
  - Proper MIME encoding
  - Valid HTML structure

### 5. SES Sandbox Mode

**Symptom:** Can only send to verified emails

**Solution:**
- Request production access:
  ```powershell
  # Go to AWS SES Console
  # Account Dashboard → Request Production Access
  # Fill out form explaining use case
  ```

## Email Header Analysis

To check what's failing, examine email headers:

1. **In Gmail:**
   - Open email
   - Click "Show original" (three dots menu)
   - Look for these headers:
     ```
     Authentication-Results: gmail.com;
       spf=pass
       dkim=pass
       dmarc=pass
     ```

2. **What to look for:**
   - `spf=pass` ✅ or `spf=fail` ❌
   - `dkim=pass` ✅ or `dkim=fail` ❌
   - `dmarc=pass` ✅ or `dmarc=fail` ❌

## Quick Fixes

### Immediate Actions:

1. **Verify DKIM records are added:**
   - Go to Porkbun DNS management
   - Verify all 3 CNAME records exist
   - Wait 15 minutes, then check status

2. **Check SPF record:**
   ```powershell
   nslookup -type=TXT jobmatch.zip
   ```
   - Must include `include:amazonses.com`

3. **Send test email and check headers:**
   - Use mail-tester.com to get detailed analysis
   - Check which authentication method is failing

4. **Monitor SES sending statistics:**
   ```powershell
   aws ses get-send-statistics --region us-west-2
   ```
   - Check bounce/complaint rates
   - High rates = reputation issues

## Long-term Solutions

1. **Build Domain Reputation:**
   - Start with low volume (10-50 emails/day)
   - Gradually increase over weeks
   - Maintain low bounce/complaint rates

2. **Use Dedicated IP:**
   - Request SES dedicated IP
   - Better control over reputation
   - Costs extra but improves deliverability

3. **Implement Feedback Loops:**
   - Set up bounce/complaint handling
   - Remove bad addresses immediately
   - Monitor reputation metrics

4. **Email Best Practices:**
   - Always include unsubscribe link
   - Use double opt-in for subscriptions
   - Send relevant, valuable content
   - Avoid spam trigger words
   - Use proper HTML/plain text formatting

## Testing Tools

- **Mail Tester:** https://www.mail-tester.com/
- **MXToolbox:** https://mxtoolbox.com/
- **Gmail Postmaster:** https://postmaster.google.com/
- **DMARC Analyzer:** https://dmarcian.com/dmarc-xml/

## Next Steps

1. Check DKIM verification status
2. Verify all DNS records are correct
3. Send test email and analyze headers
4. Check domain reputation
5. Consider warming up domain gradually

