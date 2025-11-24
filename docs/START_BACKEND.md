# How to Start Backend for Email Verification

## Quick Start

**Option 1: PowerShell Script (Recommended)**
```powershell
.\scripts\start-backend-dev.ps1
```

**Option 2: Manual Start**
```powershell
cd backend
$env:PYTHONPATH='E:\JobFinder'
python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

**Option 3: Test Email Directly (Without Backend)**
```powershell
.\scripts\test-ses-email.ps1 -ToEmail "bcherrman@gmail.com"
```

## Current Status

✅ **SES Configuration:**
- Email Provider Mode: `ses`
- From Email: `info@jobmatch.zip` (verified)
- Recipient: `bcherrman@gmail.com` (verified)
- AWS Region: `us-west-2`
- Sending Enabled: Yes

## Troubleshooting

### Backend Not Starting?
1. Check if port 8001 is available: `netstat -ano | Select-String ":8001"`
2. Make sure Python dependencies are installed: `pip install -r backend/requirements.txt`
3. Check backend logs for errors

### Email Not Received?
1. **Check backend console** - In dev mode, verification codes are logged
2. **Check spam folder** - SES emails sometimes go to spam initially
3. **Verify recipient email** - Run: `.\scripts\test-ses-email.ps1 -ToEmail "your@email.com"`
4. **Check SES sending statistics**: `aws ses get-send-statistics --region us-west-2`

### Backend Running But Email Fails?
- Check backend logs for SES error messages
- Verify sender email is verified: `aws ses get-identity-verification-attributes --identities info@jobmatch.zip --region us-west-2`
- Check if account is in sandbox mode (requires verified recipients)

## Dev Mode Features

When `ENVIRONMENT=development` or `DEV_MODE=true`:
- Verification codes are logged to console
- Email errors show detailed messages
- Fallback to console output if email fails

## Next Steps

1. Start backend: `.\scripts\start-backend-dev.ps1`
2. Open frontend: `https://localhost:8443/auth?provider=email`
3. Enter email and click "Send Verification Code"
4. Check backend console for verification code (dev mode)
5. Or check email inbox

