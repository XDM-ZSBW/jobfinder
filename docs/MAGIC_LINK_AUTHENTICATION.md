# Magic Link Email Authentication

This document describes the magic link email authentication system for JobMatch.

## Overview

Magic link authentication allows users to authenticate by clicking a link sent to their email address. The link is valid for 24 hours and can only be used once.

## Flow

1. **User clicks Email button** in HomeChat component
2. **Backend generates magic link** with secure token
3. **Email sent** to `me@myl.zip` with magic link
4. **User clicks link** in email
5. **Link verified** and user authenticated
6. **Anonymous ID created/retrieved** and returned

## Implementation

### Backend

**Magic Link Generation:**
- Endpoint: `POST /api/auth/social/email/magic-link`
- Generates secure token (32 bytes, base64url encoded)
- Stores token with email and expiration (24 hours)
- Sends email with magic link URL

**Magic Link Verification:**
- Endpoint: `GET /api/auth/social/magic-link/verify?token={token}`
- Validates token and expiration
- Creates/retrieves anonymous user
- Links email to anonymous identity
- Returns anonymous ID

### Frontend

**HomeChat Component:**
- When Email button clicked, automatically sends magic link to `me@myl.zip`
- Shows confirmation message
- Link valid for 24 hours

**Magic Link Page:**
- Route: `/auth/magic-link?token={token}`
- Verifies token automatically on page load
- Shows success/error messages
- Redirects to platform on success

## Configuration

**Default Email:** `me@myl.zip`
**Base URL:** `https://jobmatch.zip` (or current domain)
**Expiration:** 24 hours
**One-time use:** Yes (token removed after verification)

## Email Template

The magic link email includes:
- Professional HTML template
- Clickable "Authenticate Now" button
- Plain text fallback
- Link expiration notice
- Security notice

## Security Features

1. **Secure Token Generation:** Uses `secrets.token_bytes(32)` for cryptographically secure tokens
2. **One-time Use:** Token is removed after successful verification
3. **Expiration:** Links expire after 24 hours
4. **Email Verification:** Email must be verified in SES (sandbox mode)

## Usage

### From HomeChat

1. User clicks Email button (📧)
2. Magic link automatically sent to `me@myl.zip`
3. User checks email and clicks link
4. Automatically authenticated

### Manual API Call

```bash
# Send magic link
curl -X POST https://jobmatch.zip/api/auth/social/email/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "me@myl.zip", "base_url": "https://jobmatch.zip"}'

# Verify magic link (user clicks link in email)
# GET https://jobmatch.zip/auth/magic-link?token={token}
```

## Testing

**Development Mode:**
- Magic link URL is logged to console
- Can test without actual email delivery

**Production:**
- Requires SES email configuration
- Email sent via Amazon SES
- Link works with production domain

## Troubleshooting

### Link Not Received
- Check spam folder
- Verify email address is correct
- Check SES sending statistics
- Verify email is verified in SES (sandbox mode)

### Link Expired
- Request new magic link
- Links expire after 24 hours
- Old links cannot be reused

### Verification Failed
- Link may have already been used (one-time use)
- Link may have expired
- Token may be invalid

## Related Files

- `backend/auth/social_auth.py` - Magic link generation/verification logic
- `backend/api/social_auth.py` - API endpoints
- `frontend/components/HomeChat.tsx` - Email button handler
- `frontend/app/auth/magic-link/page.tsx` - Verification page

## Future Improvements

- [ ] Use Redis for token storage (production)
- [ ] Add rate limiting for magic link requests
- [ ] Add email template customization
- [ ] Support multiple email addresses
- [ ] Add magic link analytics

