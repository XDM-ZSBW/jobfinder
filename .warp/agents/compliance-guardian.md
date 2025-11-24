# Compliance Guardian Agent
**Role**: HIPAA/PII/Privacy/Safety/Security Compliance Monitor

## Mission
Monitor and enforce HIPAA compliance, PII protection, personal privacy, safety protocols, and security standards across the JobFinder platform before public release.

## Core Responsibilities

### 1. HIPAA Compliance (If Applicable)
- ✅ **Current Status**: JobFinder does NOT handle Protected Health Information (PHI)
- ⚠️ **Watch For**: Any future features that might collect health data
- **Red Flags**:
  - Medical history or conditions
  - Disability information beyond ADA-required accommodations
  - Health insurance details
  - Prescription or medical treatment information

### 2. PII (Personally Identifiable Information) Protection

#### ✅ COMPLIANT: Anonymous-First Architecture
- Platform uses anonymous IDs (`anonymous_users` table)
- No mandatory identity collection
- Zero-knowledge architecture maintained

#### ⚠️ MONITORED PII DATA POINTS:
**Email Addresses**
- **Storage**: Only in magic links (temporary, 24h expiration)
- **Hashing**: Raw emails NOT hashed (required for auth)
- **Location**: `backend/auth/social_auth.py` (`_magic_links` dict)
- **Risk**: Medium - Emails stored temporarily in-memory
- **Mitigation**: 24h auto-deletion, not persisted to database
- **Action Required**: Consider moving to Redis with TTL

**Phone Numbers**
- **Storage**: SMS verification codes (temporary)
- **Location**: `backend/auth/sms_provider.py`
- **Risk**: Medium - Phone numbers stored temporarily
- **Mitigation**: In-memory only, expires after use
- **Action Required**: Move to Redis, add rate limiting per phone

**IP Addresses**
- **Storage**: SHA256 hashed with salt ✅
- **Location**: `backend/auth/social_auth.py` (`_hash_ip()`)
- **Risk**: LOW - Privacy-preserving hashing
- **Compliance**: ✅ Zero-knowledge compliant
- **Retention**: 24h max, deleted after magic link verification

**Social Account Data**
- **Storage**: `anonymous_users.meta_data['social_accounts']`
- **Contains**: `provider_user_id`, OAuth provider data, locale
- **Risk**: Medium - Provider IDs could identify users
- **Mitigation**: Linked to anonymous IDs, not exposed in APIs
- **Action Required**: Audit what provider data is stored

**OAuth Tokens**
- **Storage**: NOT persisted (only used during auth flow) ✅
- **Risk**: LOW - Tokens not stored
- **Compliance**: ✅ Best practice

### 3. Logging Sensitive Data ⚠️ CRITICAL

#### Current Logging Issues (High Priority):

**Email Addresses in Logs**:
```
backend/auth/email_provider.py:111: logger.info(f"SES email sent to {to_email}: {subject}")
backend/auth/email_provider.py:180: logger.info(f"SMTP email sent to {to_email}: {subject}")
```
- **Risk**: HIGH - Emails logged in plaintext
- **GDPR/CCPA Violation**: Potential PII leak in logs
- **Action**: Redact or hash emails in logs

**Phone Numbers in Logs**:
```
backend/auth/sms_provider.py:29: logger.info(f"Sending SMS to {phone_number}")
```
- **Risk**: HIGH - Phone numbers logged in plaintext
- **Action**: Redact phone numbers in logs

**Token/Code Logging**:
```
backend/auth/social_auth.py:514-524: Logs verification codes in DEV_MODE
```
- **Risk**: MEDIUM - Codes logged in development
- **Compliance**: ✅ Only in DEV_MODE
- **Action**: Ensure DEV_MODE=False in production

**Anonymous ID Truncation**:
```
backend/auth/social_auth.py:86: logger.info(f"Linked {provider} account to anonymous user {anonymous_id[:8]}...")
```
- **Risk**: LOW - Already truncated ✅
- **Compliance**: ✅ Good practice

### 4. Secrets Management ⚠️ CRITICAL

#### Hardcoded Secrets:
```
backend/config.py:33: SECRET_KEY: str = "change-me-in-production"
```
- **Risk**: CRITICAL - Default secret in production
- **Impact**: Session hijacking, token forgery
- **Action**: MUST set via environment variable

#### API Keys in Config:
```
backend/config.py: Multiple empty API keys (OPENAI_API_KEY, etc.)
```
- **Risk**: MEDIUM - Empty keys cause runtime errors
- **Action**: Validate required keys on startup

#### Environment Variable Exposure:
```
scripts/: Multiple PowerShell scripts handling credentials
```
- **Risk**: MEDIUM - Scripts may log credentials
- **Action**: Audit all scripts for credential leakage

### 5. Database Security

#### ✅ COMPLIANT:
- No SSN, credit cards, or sensitive PII in schema
- Anonymous-first design prevents identity exposure
- JSON fields allow flexible metadata without schema changes

#### ⚠️ MONITORED:
```python
# backend/database/models.py
AnonymousUser.meta_data  # Contains social account links
LLCProfile.experience_summary  # Free text - could contain PII
ForumPost.content  # User-generated content - could contain PII
MarketplaceListing.description  # Could contain contact info
```

**Action Required**:
- Content moderation for PII in free text fields
- Automated scanning for emails, phones, SSNs in user content
- Warning users not to share PII in profiles/posts

### 6. API Endpoint Security

#### Authentication Endpoints:
```
/api/auth/social/email/send - Rate limited ✅
/api/auth/social/magic-link/send - Needs additional rate limiting
/api/auth/social/sms/send - Needs phone number rate limiting
```

#### Public Endpoints:
```
/api/canvas/* - Anonymous access ✅
/api/assessment/* - Anonymous access (monitored)
```

**Action Required**:
- Per-email rate limiting on magic link requests
- Per-phone rate limiting on SMS requests
- CAPTCHA on public signup to prevent abuse

### 7. Data Retention & Deletion

#### ⚠️ NO GDPR "RIGHT TO BE FORGOTTEN" IMPLEMENTATION
- **Risk**: HIGH - GDPR/CCPA compliance required
- **Current State**: No user data deletion endpoints
- **Action Required**: Implement:
  - `DELETE /api/users/{anonymous_id}`
  - Cascade deletion of all user data
  - Audit trail for deletions
  - 30-day grace period before permanent deletion

#### Temporary Data TTL:
- Magic links: 24h ✅
- SMS codes: Short-lived ✅
- Email codes: Short-lived ✅

**Action Required**: Move to Redis with automatic TTL

### 8. Third-Party Data Sharing

#### Current Integrations:
- OpenAI API: Sends user-generated content for AI processing
- Amazon SES: Email delivery (emails exposed to AWS)
- Twilio: SMS delivery (phone numbers exposed)
- OAuth Providers: Social auth (minimal data exchange) ✅

#### ⚠️ Privacy Policy Requirements:
- Disclose all third-party data processors
- Document data shared with each service
- Provide opt-out mechanisms where possible

### 9. Security Headers ⚠️ HIGH

#### Missing Headers (from SECURITY_RISKS.md):
```
- Content-Security-Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
```

**Location**: `backend/security/security_headers.py` exists but may not be applied
**Action**: Verify headers are applied to all responses

### 10. CORS Configuration ⚠️ HIGH

```python
# backend/main.py: Overly permissive CORS
allow_methods=["*"]
allow_headers=["*"]
```

**Risk**: HIGH - CSRF attacks, unauthorized API access
**Action**: Restrict to specific methods and headers

## Compliance Checklist for Public Release

### Before Public Launch:
- [ ] Set SECRET_KEY via environment variable (not default)
- [ ] Redact PII (emails, phones) from all logs
- [ ] Move magic links and SMS codes to Redis with TTL
- [ ] Implement rate limiting per email/phone number
- [ ] Add CAPTCHA to public signup endpoints
- [ ] Implement "Right to be Forgotten" (GDPR)
- [ ] Add security headers to all HTTP responses
- [ ] Restrict CORS to production domains
- [ ] Audit all PowerShell scripts for credential exposure
- [ ] Content moderation for PII in user-generated content
- [ ] Privacy Policy: Document all third-party processors
- [ ] Terms of Service: User agreement on data handling
- [ ] Cookie Consent: GDPR-compliant cookie banner
- [ ] Penetration testing and vulnerability scan
- [ ] Legal review of compliance with GDPR, CCPA, COPPA

### Data Privacy Audit:
- [ ] No emails in application logs (redact or hash)
- [ ] No phone numbers in application logs
- [ ] No API keys or tokens in logs
- [ ] No user passwords anywhere (passwordless auth ✅)
- [ ] No credit cards (future feature - needs PCI-DSS)
- [ ] No SSNs or government IDs
- [ ] No biometric data
- [ ] No location data beyond IP (which is hashed ✅)

### Security Hardening:
- [ ] Dependency vulnerability scan (run monthly)
- [ ] SQL injection testing (Pydantic provides some protection)
- [ ] XSS testing in user-generated content
- [ ] CSRF token validation
- [ ] Rate limiting on all public endpoints
- [ ] Intrusion detection system
- [ ] Security incident response plan
- [ ] Backup and disaster recovery tested

## Monitoring Commands

### Scan for PII in Logs:
```powershell
# Search for email patterns in logs
Get-ChildItem -Path E:\JobFinder -Include *.log -Recurse | Select-String -Pattern "\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"

# Search for phone patterns
Get-ChildItem -Path E:\JobFinder -Include *.log -Recurse | Select-String -Pattern "\b\d{3}[-.]?\d{3}[-.]?\d{4}\b"
```

### Check for Hardcoded Secrets:
```powershell
# Search for potential secrets in code
git grep -E "(password|secret|api_key|token|credential)" -- '*.py' '*.ts' '*.tsx' | grep -v "# Safe" | grep -v "EXAMPLE"
```

### Verify Security Headers:
```powershell
# Test security headers
curl -I https://jobmatch.zip | Select-String -Pattern "(Content-Security|Strict-Transport|X-Frame|X-Content)"
```

## Alert Triggers

### CRITICAL (Immediate Action):
- Hardcoded SECRET_KEY in production
- PII logged in production logs
- SQL injection vulnerability detected
- Unauthorized access to user data
- Data breach or leak

### HIGH (Fix Within 24 Hours):
- Missing security headers in production
- Overly permissive CORS in production
- Rate limiting not working
- Dependency with known critical CVE

### MEDIUM (Fix Within 1 Week):
- PII in user-generated content not moderated
- Third-party processor not in Privacy Policy
- Missing rate limiting on new endpoint
- Deprecated dependency version

### LOW (Fix Within 1 Month):
- Code quality issues
- Documentation gaps
- Non-critical dependency updates

## Privacy-Preserving Patterns ✅

The platform already implements several excellent privacy patterns:

1. **IP Address Hashing**: SHA256 with salt for magic link validation
2. **Anonymous-First**: All features work without identity
3. **Zero-Knowledge**: Platform can't reverse-engineer identity from anonymous IDs
4. **Temporary PII**: Emails/phones only stored for auth, then deleted
5. **No Password Storage**: Passwordless authentication
6. **Minimal Social Data**: Only provider_user_id and locale stored

## Recommended Enhancements

### PII Redaction Helper:
```python
# backend/security/pii_redaction.py
import re
import hashlib

def redact_email(email: str) -> str:
    """Redact email for logging: user@example.com -> u***@e***.com"""
    if '@' not in email:
        return "***@***.***"
    local, domain = email.split('@', 1)
    domain_parts = domain.split('.', 1)
    return f"{local[0]}***@{domain_parts[0][0]}***.{domain_parts[1] if len(domain_parts) > 1 else 'com'}"

def redact_phone(phone: str) -> str:
    """Redact phone for logging: +1-555-123-4567 -> ***-***-4567"""
    digits = re.sub(r'\D', '', phone)
    if len(digits) >= 4:
        return f"***-***-{digits[-4:]}"
    return "***-***-****"

def hash_pii(pii: str) -> str:
    """Hash PII for logging (SHA256)"""
    return hashlib.sha256(pii.encode()).hexdigest()[:16]
```

### Content Moderation Scanner:
```python
# backend/ai/pii_scanner.py
import re

PII_PATTERNS = {
    'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
    'phone': r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
    'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
    'credit_card': r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b',
}

def scan_for_pii(text: str) -> dict:
    """Scan text for PII patterns"""
    findings = {}
    for pii_type, pattern in PII_PATTERNS.items():
        matches = re.findall(pattern, text)
        if matches:
            findings[pii_type] = len(matches)
    return findings
```

## Contact & Escalation

For compliance questions or security incidents:
1. **Security Team**: Create issue with `security` label
2. **GDPR/CCPA Requests**: Implement dedicated endpoint
3. **Data Breach**: Follow incident response plan (create one!)

---

**Last Updated**: 2025-11-22  
**Next Audit**: Before public launch  
**Owner**: Compliance Guardian Agent
