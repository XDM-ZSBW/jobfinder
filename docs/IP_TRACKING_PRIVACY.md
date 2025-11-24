# IP Address Tracking & Privacy Compliance

## Overview

This document explains how IP address tracking for magic link security aligns with our zero-knowledge and anonymous-first principles.

## The Challenge

**Security Need**: Prevent magic link abuse and detect suspicious activity (e.g., shared links)

**Privacy Principle**: Zero-knowledge architecture - platform cannot reverse-engineer identity from anonymous IDs

**Conflict**: Raw IP addresses can potentially be used to correlate anonymous IDs to real identities

## Solution: Privacy-Preserving IP Hashing

### Implementation

Instead of storing raw IP addresses, we:

1. **Hash IP addresses** using SHA256 with a salt
2. **Store only the hash** (cannot be reverse-engineered)
3. **Compare hashes** for security validation
4. **Delete immediately** after magic link verification (max 24 hours)

### Code Implementation

```python
def _hash_ip(ip: Optional[str]) -> Optional[str]:
    """Hash IP address for privacy-preserving security validation."""
    if not ip:
        return None
    salt = b"jobmatch_ip_validation_salt_v1"
    ip_bytes = ip.encode('utf-8')
    hash_obj = hashlib.sha256(salt + ip_bytes)
    return hash_obj.hexdigest()
```

### Privacy Properties

✅ **Zero-Knowledge Compliant**: Hashed IPs cannot be reverse-engineered to identify users  
✅ **Security Maintained**: Can still detect IP mismatches for security validation  
✅ **No Identity Correlation**: Cannot correlate anonymous IDs to identities via IP  
✅ **Temporary Storage**: Hashed IPs deleted immediately after use (max 24 hours)  
✅ **No Raw IP Logging**: Raw IPs never stored or logged  

## Alignment with Founding Principles

### ✅ Zero-Knowledge Architecture
- **Principle**: Platform cannot reverse-engineer identity from anonymous IDs
- **Compliance**: Hashed IPs cannot be used to identify users or correlate to identities

### ✅ Data Minimization
- **Principle**: Only collect data necessary for platform functionality
- **Compliance**: IP hashing is necessary for security (preventing magic link abuse)
- **Minimization**: Only hash stored temporarily, deleted immediately after use

### ✅ Anonymous-First Architecture
- **Principle**: All platform features work without identity
- **Compliance**: Magic links work anonymously; IP hashing doesn't require identity

### ✅ User Control
- **Principle**: Users control their data and identity linking
- **Compliance**: IP hashing doesn't create identity links; users remain anonymous

## Security Benefits

1. **Magic Link Abuse Prevention**: Detects when magic links are shared/used from different IPs
2. **Fraud Detection**: Identifies suspicious patterns without exposing user identities
3. **Rate Limiting**: Supports rate limiting per IP without storing raw IPs

## Privacy Guarantees

1. **No Raw IP Storage**: Raw IP addresses are never stored in database or logs
2. **No Reverse Engineering**: Hashed IPs cannot be converted back to raw IPs
3. **No Identity Correlation**: Cannot correlate anonymous IDs to identities via IP hashes
4. **Temporary Storage**: Hashed IPs deleted immediately after verification (max 24 hours)
5. **No Cross-User Tracking**: IP hashes are only compared within the same magic link token

## Comparison: Raw IP vs Hashed IP

| Aspect | Raw IP Storage | Hashed IP Storage |
|--------|---------------|-------------------|
| **Security** | ✅ Can detect IP mismatches | ✅ Can detect IP mismatches |
| **Privacy** | ❌ Can correlate to identity | ✅ Cannot correlate to identity |
| **Zero-Knowledge** | ❌ Violates principle | ✅ Compliant |
| **GDPR/CCPA** | ⚠️ May require consent | ✅ Privacy-preserving |
| **Identity Correlation** | ❌ Possible via ISP records | ✅ Not possible |

## Policy Updates

### Privacy Policy
- Added section on IP address handling
- Documented privacy-preserving approach
- Clarified temporary storage and deletion

### Data Boundaries
- Updated to specify only hashed IPs stored (not raw IPs)
- Clarified temporary storage for security purposes

## Future Considerations

### Optional Enhancements
1. **Configurable IP Validation**: Allow disabling IP validation in development
2. **IP Hash Rotation**: Periodically rotate salt to prevent long-term correlation
3. **Geolocation Hashing**: Hash geolocation data separately if needed for security

### Alternative Approaches (if needed)
1. **Browser Fingerprinting**: Use browser fingerprint instead of IP (more privacy-preserving)
2. **Device Token**: Use device-specific tokens instead of IP
3. **Email Confirmation**: Require email confirmation after magic link click (no IP needed)

## Conclusion

**IP address hashing maintains security while preserving zero-knowledge principles.**

- ✅ Security: Can detect magic link abuse
- ✅ Privacy: Cannot identify users or correlate to identities
- ✅ Compliance: Aligns with zero-knowledge and data minimization principles
- ✅ User Trust: Transparent privacy-preserving approach

This approach demonstrates that **security and privacy are not mutually exclusive** - we can have both through privacy-preserving security measures.

