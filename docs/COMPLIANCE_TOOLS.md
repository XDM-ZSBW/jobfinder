# Compliance Tools Guide

## Overview
The JobFinder platform includes comprehensive compliance monitoring tools to ensure HIPAA, PII, privacy, safety, and security standards are maintained before public release.

## Components

### 1. Compliance Guardian Agent
**Location**: `.warp/agents/compliance-guardian.md`

A comprehensive documentation agent that monitors and enforces compliance across the platform.

**Key Areas Monitored**:
- HIPAA compliance (if applicable)
- PII (Personally Identifiable Information) protection
- Logging sensitive data
- Secrets management
- Database security
- API endpoint security
- Data retention & deletion (GDPR)
- Third-party data sharing
- Security headers
- CORS configuration

### 2. PII Redaction Utilities
**Location**: `backend/security/pii_redaction.py`

Safe logging utilities that redact or hash PII before it enters logs.

**Usage Example**:
```python
from backend.security.pii_redaction import redact_email, redact_phone, hash_pii

# In your logging statements
logger.info(f"Email sent to {redact_email(user_email)}")
logger.info(f"SMS sent to {redact_phone(phone_number)}")
logger.info(f"User authenticated: {hash_pii(email, 'email')}")
```

**Available Functions**:
- `redact_email(email)` - Redacts email addresses (user@example.com → u***@e***.com)
- `redact_phone(phone)` - Redacts phone numbers (555-123-4567 → ***-***-4567)
- `hash_pii(pii, prefix)` - One-way hash for correlation without exposure
- `redact_anonymous_id(id)` - Partially redacts anonymous IDs
- `redact_token(token)` - Redacts authentication tokens
- `redact_ip_address(ip)` - Redacts IP addresses
- `safe_log_dict(data)` - Redacts sensitive keys in dictionaries

### 3. PII Scanner
**Location**: `backend/ai/pii_scanner.py`

Scans user-generated content for accidental PII disclosure.

**Usage Example**:
```python
from backend.ai.pii_scanner import PIIScanner, scan_for_pii, has_sensitive_pii

# Quick scan
pii_found = scan_for_pii(user_content)
if pii_found:
    print(f"PII detected: {pii_found}")

# Detailed scan
scanner = PIIScanner()
result = scanner.scan(user_content, include_details=True)

if result.risk_level in ["high", "critical"]:
    # Reject or redact content
    redacted = scanner.redact_pii(user_content)
    
# Check if safe for public display
if scanner.is_safe_for_public(user_content):
    # Publish content
    pass
```

**Detection Patterns**:
- Email addresses
- US phone numbers
- International phone numbers
- Social Security Numbers (SSN)
- Credit card numbers
- IP addresses
- URLs
- Street addresses
- ZIP codes

### 4. Compliance Scanner Script
**Location**: `scripts/compliance-scan.ps1`

Automated scanning tool that checks the entire codebase for compliance issues.

**Run the Scanner**:
```powershell
# Basic scan
.\scripts\compliance-scan.ps1

# Save report to custom location
.\scripts\compliance-scan.ps1 -ReportPath "C:\Reports\compliance.md"

# Verbose output
.\scripts\compliance-scan.ps1 -Verbose
```

**What It Checks**:
1. ✅ PII in logging statements
2. ✅ Secrets management (hardcoded secrets)
3. ✅ CORS configuration
4. ✅ Security headers
5. ✅ Database schema (sensitive fields)
6. ✅ Rate limiting implementation
7. ✅ Dependency issues
8. ✅ User content moderation
9. ✅ GDPR compliance (data deletion)
10. ✅ Privacy policy existence

**Exit Codes**:
- `0` - No critical/high issues found
- `1` - Critical or high priority issues detected

## Quick Start

### Before Committing Code
```powershell
# Run compliance scan
.\scripts\compliance-scan.ps1

# Review report
code E:\JobFinder\docs\COMPLIANCE_REPORT.md
```

### Before Deploying to Production
1. Run compliance scan and verify no CRITICAL issues
2. Review `.warp/agents/compliance-guardian.md` checklist
3. Ensure all HIGH priority issues are resolved
4. Verify Privacy Policy is published
5. Test data deletion endpoints
6. Confirm security headers are active
7. Run penetration testing

### Integrating PII Redaction

**Step 1**: Import redaction functions in your modules:
```python
from backend.security.pii_redaction import redact_email, redact_phone
```

**Step 2**: Replace existing logging statements:
```python
# Before
logger.info(f"Email sent to {to_email}")

# After
logger.info(f"Email sent to {redact_email(to_email)}")
```

**Step 3**: Run compliance scan to verify:
```powershell
.\scripts\compliance-scan.ps1
```

### Integrating PII Scanner

**For User Profiles**:
```python
from backend.ai.pii_scanner import PIIScanner

scanner = PIIScanner()

@router.post("/api/profile")
async def update_profile(profile: ProfileData):
    # Scan experience summary for PII
    result = scanner.scan(profile.experience_summary)
    
    if result.risk_level in ["high", "critical"]:
        raise HTTPException(
            status_code=400,
            detail="Profile contains sensitive personal information. Please remove contact details."
        )
    
    # Save profile
    # ...
```

**For Forum Posts**:
```python
@router.post("/api/forum/posts")
async def create_post(post: ForumPost):
    scanner = PIIScanner()
    
    # Check if content is safe for public display
    if not scanner.is_safe_for_public(post.content):
        # Option 1: Reject
        raise HTTPException(400, "Post contains personal information")
        
        # Option 2: Auto-redact
        post.content = scanner.redact_pii(post.content)
    
    # Save post
    # ...
```

## Continuous Monitoring

### Add to CI/CD Pipeline

**GitHub Actions** (`.github/workflows/compliance.yml`):
```yaml
name: Compliance Check
on: [push, pull_request]

jobs:
  compliance:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Compliance Scan
        run: .\scripts\compliance-scan.ps1
      - name: Upload Report
        uses: actions/upload-artifact@v2
        with:
          name: compliance-report
          path: docs/COMPLIANCE_REPORT.md
```

### Weekly Automated Scans

**Windows Task Scheduler**:
```powershell
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-File E:\JobFinder\scripts\compliance-scan.ps1"

$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 9am

Register-ScheduledTask -Action $action -Trigger $trigger `
    -TaskName "JobFinder Compliance Scan" `
    -Description "Weekly compliance scan for JobFinder platform"
```

## Compliance Checklist

### Before Public Launch
- [ ] Run `compliance-scan.ps1` with zero CRITICAL issues
- [ ] All PII redacted from logs (verified)
- [ ] SECRET_KEY set via environment variable
- [ ] CORS restricted to production domains only
- [ ] Security headers active on all responses
- [ ] Rate limiting enabled on all public endpoints
- [ ] GDPR data deletion endpoint implemented and tested
- [ ] Privacy Policy published and linked
- [ ] Terms of Service published and linked
- [ ] Content moderation for PII in user-generated content
- [ ] Penetration testing completed
- [ ] Legal compliance review (GDPR, CCPA, COPPA)
- [ ] Incident response plan documented
- [ ] Data backup and recovery tested

### Monthly Reviews
- [ ] Run compliance scan
- [ ] Review new dependencies for vulnerabilities
- [ ] Audit access logs for suspicious activity
- [ ] Update Privacy Policy if features changed
- [ ] Review third-party processors
- [ ] Test data deletion endpoints
- [ ] Verify rate limiting is working

### After Each Code Change
- [ ] Run compliance scan before committing
- [ ] Review changes for PII exposure
- [ ] Check logging statements use redaction
- [ ] Verify user input is validated
- [ ] Confirm secrets not hardcoded

## Alert Escalation

### CRITICAL Issues
**Response Time**: Immediate (within 1 hour)
- Hardcoded SECRET_KEY in production
- PII logged in production logs
- SQL injection vulnerability
- Unauthorized access to user data
- Data breach or leak

**Action**: Stop deployment, fix immediately, notify security team

### HIGH Issues
**Response Time**: Within 24 hours
- Missing security headers in production
- Overly permissive CORS in production
- Rate limiting not working
- Critical dependency vulnerability

**Action**: Schedule urgent fix, deploy hotfix

### MEDIUM Issues
**Response Time**: Within 1 week
- PII in user content not moderated
- Third-party processor not in Privacy Policy
- Missing rate limiting on endpoint
- Deprecated dependency

**Action**: Add to sprint, deploy in next release

### LOW Issues
**Response Time**: Within 1 month
- Code quality issues
- Documentation gaps
- Non-critical dependency updates

**Action**: Add to backlog, address in routine maintenance

## Support & Resources

### Documentation
- [Compliance Guardian Agent](.warp/agents/compliance-guardian.md) - Full compliance guidelines
- [Security Risks](SECURITY_RISKS.md) - Known security risks and mitigation
- [Privacy Policy](PRIVACY_POLICY.md) - Platform privacy policy (create before launch)
- [Magic Link Security](MAGIC_LINK_SECURITY.md) - Authentication security details

### Tools
- `backend/security/pii_redaction.py` - PII redaction utilities
- `backend/ai/pii_scanner.py` - PII detection scanner
- `scripts/compliance-scan.ps1` - Automated compliance scanner
- `backend/security/risk_monitor.py` - Security risk monitoring

### External Resources
- [GDPR Compliance](https://gdpr.eu/) - EU data protection regulation
- [CCPA Compliance](https://oag.ca.gov/privacy/ccpa) - California privacy law
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Web security risks
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework) - Security best practices

## Questions?

For compliance questions or security concerns:
1. Review [Compliance Guardian Agent](.warp/agents/compliance-guardian.md)
2. Run `compliance-scan.ps1` for specific issues
3. Create GitHub issue with `security` or `compliance` label
4. Contact security team for urgent matters

---
**Last Updated**: 2025-11-22  
**Maintained By**: Compliance Guardian Agent
