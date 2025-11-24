# Magic Link Security

## Overview

Magic links provide passwordless authentication via email. This document explains the security measures implemented to protect against unauthorized access.

## Current Security Features

### ✅ One-Time Use
- Magic link tokens are **deleted immediately after first use**
- If someone shares a link, only the **first person** to click it can authenticate
- Subsequent attempts will fail with "Invalid or expired" error

### ✅ Time-Limited Expiration
- Magic links expire after **24 hours**
- Expired tokens are automatically cleaned up

### ✅ IP Address Validation (Privacy-Preserving)
- **Hashed IP address** is stored when magic link is created (SHA256 with salt)
- **Hashed IP address** is validated when magic link is verified
- **Raw IP addresses are NEVER stored** - maintains zero-knowledge principles
- **Logs security events** if IP hashes don't match (without exposing raw IPs)
- Currently **logs but doesn't block** (IPs can change with VPN/mobile networks)
- **Privacy-compliant**: Hashed IPs cannot be reverse-engineered to identify users
- In production, consider requiring additional verification for IP hash mismatches

### ✅ Secure Token Generation
- Uses `secrets.token_bytes(32)` for cryptographically secure random tokens
- Base64 URL-safe encoding (no padding)
- 256 bits of entropy (extremely difficult to guess)

### ✅ Rate Limiting
- Global rate limiting middleware (60 requests/minute per IP)
- Prevents brute force attacks

## Security Vulnerability: Shared Magic Links

### The Problem

If Alice shares her magic link with Bob:

1. **Bob clicks first** → Bob authenticates as Alice's email ✅ (Security breach!)
2. **Alice clicks later** → Token already used, Alice gets "Invalid or expired" ❌

### Why This Happens

Magic links authenticate based on **email ownership**, not **identity verification**. The system assumes:
- If you have the link, you own the email
- If you own the email, you are authorized

This is a **common security trade-off** in passwordless authentication systems.

## Mitigation Strategies

### 1. IP Address Validation (Implemented)
- **Status**: ✅ Implemented (logs mismatches)
- **Action**: Consider blocking IP mismatches in production with additional verification

### 2. Email Confirmation After Click (Recommended)
- After clicking magic link, send **confirmation email** to the email address
- Require user to click confirmation link before full authentication
- This ensures the person clicking has **access to the email account**

### 3. Browser Fingerprinting (Future Enhancement)
- Store browser fingerprint when creating magic link
- Validate fingerprint when verifying
- Detect device changes

### 4. Suspicious Activity Alerts (Future Enhancement)
- Send email notification when magic link is used
- Include IP address, location, device info
- Allow user to revoke access if suspicious

### 5. Rate Limiting Per Email (Future Enhancement)
- Limit magic link requests per email address
- Prevent abuse/spam

## Best Practices for Users

### ✅ DO:
- **Never share magic links** with anyone
- Click magic links **immediately** after receiving them
- Use magic links on **trusted devices** only
- **Report suspicious activity** if you receive magic links you didn't request

### ❌ DON'T:
- Share magic links via email, chat, or social media
- Forward magic link emails to others
- Leave magic links open in browser tabs
- Use magic links on public/shared computers

## Implementation Details

### IP Address Extraction

The system checks multiple sources for client IP:

1. **X-Forwarded-For** header (for proxies/load balancers)
2. **X-Real-IP** header (for reverse proxies)
3. **Direct client IP** (fallback)

### Development vs Production

- **Development**: IP validation is **disabled** (allows testing)
- **Production**: IP validation is **enabled** (logs mismatches)

### Logging

Security events are logged with:
- Token (truncated for security)
- Email address
- Stored IP vs Request IP
- Timestamp
- User ID (if applicable)

## Future Enhancements

1. **Require email confirmation** after magic link click
2. **Block IP mismatches** with additional verification step
3. **Browser fingerprinting** for device validation
4. **Suspicious activity alerts** via email
5. **Rate limiting per email** address
6. **Magic link revocation** capability
7. **Session management** (track active sessions)

## Related Files

- `backend/auth/social_auth.py` - Magic link creation and verification
- `backend/api/social_auth.py` - API endpoints with IP validation
- `backend/security/rate_limiter.py` - Rate limiting middleware

