# Stripe Connect Platform Setup - XDMIQ

**Platform Account**: `acct_1SWqhEBObYs4DzR4` (XDMIQ Marketplace)
**Model**: Marketplace/Platform with Express Connected Accounts
**Created**: November 24, 2025

## Architecture Overview

XDMIQ operates as a marketplace platform where:
- **Platform (XDMIQ)** collects platform fees and manages transactions
- **Connected Accounts** (JobMatch, Yourl.Cloud, etc.) receive payments for their services
- Transactions use **direct charges** with application fees going to the platform

## Connected Accounts

### 1. JobMatch AI
- **Account ID**: `acct_1SWuVnBeYfqTS1Pz`
- **Type**: Express
- **Email**: jobmatch@xdmiq.com
- **Business Name**: JobMatch AI
- **Statement Descriptor**: JOBMATCH AI
- **Status**: Pending onboarding
- **Onboarding Link**: https://connect.stripe.com/setup/e/acct_1SWuVnBeYfqTS1Pz/3iFrwuHBJHCA (expires in 5 minutes)
- **Revenue Model**:
  - Freemium job seekers
  - Employer subscriptions (monthly/annual)
  - Per-hire success fees
  - Enterprise plans

### 2. Yourl.Cloud
- **Account ID**: `acct_1SWuWmPVF4RQapfW`
- **Type**: Express
- **Email**: support@yourl.cloud
- **Business Name**: Yourl.Cloud
- **Statement Descriptor**: YOURL.CLOUD
- **Status**: Pending onboarding
- **Services**: Tech support, consulting
- **Revenue Model**: 
  - Free initial consultation
  - Ongoing support subscriptions
  - Premium consultation packages

### 3. XDMIQ Consulting (Direct to platform)
- **Services**: Executive technology consulting
- **Revenue Model**:
  - Free 10-minute assessments
  - Strategic consulting engagements
  - Project-based billing

## CLI Commands Used

### Create Express Connected Account
```powershell
stripe post /v1/accounts `
  -d type=express `
  -d country=US `
  -d email=<account-email> `
  -d "capabilities[card_payments][requested]=true" `
  -d "capabilities[transfers][requested]=true" `
  -d business_type=company `
  -d "company[name]=<Business Name>"
```

### Generate Onboarding Link
```powershell
stripe post /v1/account_links `
  -d account=<account_id> `
  -d type=account_onboarding `
  -d "return_url=https://xdmiq.com/connect/return" `
  -d "refresh_url=https://xdmiq.com/connect/refresh"
```

### Check Account Status
```powershell
stripe get /v1/accounts/<account_id>
```

### List All Connected Accounts
```powershell
stripe get /v1/accounts
```

## Payment Flow

### Direct Charges (Recommended for your platform)
1. Customer pays on JobMatch/Yourl.Cloud
2. Payment goes to connected account (JobMatch/Yourl.Cloud)
3. Platform fee automatically transferred to XDMIQ
4. Connected account controls refunds

```javascript
// Example payment
const paymentIntent = await stripe.paymentIntents.create({
  amount: 10000, // $100.00
  currency: 'usd',
  application_fee_amount: 1000, // $10 platform fee (10%)
}, {
  stripeAccount: 'acct_1SWuVnBeYfqTS1Pz', // JobMatch account
});
```

## Integration Points

### JobMatch AI (E:\JobFinder)
- Premium upgrade checkout
- Employer subscription management
- Per-hire payment processing
- **Tech Stack**: Node.js + Express backend, Next.js frontend

### xdmiq.com (E:\xdmiq-website)
- Consulting service bookings
- Assessment purchases
- **Tech Stack**: Static HTML/CSS/JS (needs backend for payments)

### Yourl.Cloud (E:\cloud-yourl-www)
- Support subscription checkout
- Premium consultation payments
- **Tech Stack**: Python Flask (has server.py for backend)

## Next Steps

1. ✅ Create connected accounts for all properties
   - ✅ JobMatch AI: `acct_1SWuVnBeYfqTS1Pz`
   - ✅ Yourl.Cloud: `acct_1SWuWmPVF4RQapfW`
2. ⏳ Complete onboarding for each account (KYC, bank details, etc.)
   - Use account links generated via CLI or Dashboard
   - Required: Business info, bank account, identity verification
3. ⏳ Implement Stripe Connect SDK in each property
   - JobMatch: Backend API + checkout flow
   - xdmiq.com: Backend for payment processing
   - Yourl.Cloud: Flask integration
4. ⏳ Set up webhook handlers for payment events
   - `payment_intent.succeeded`
   - `charge.succeeded`
   - `account.updated`
   - `application_fee.created`
5. ⏳ Configure pricing and products in Stripe Dashboard
   - JobMatch: Premium tiers, employer subscriptions
   - XDMIQ: Consulting packages
   - Yourl.Cloud: Support subscriptions
6. ⏳ Test payment flows in test mode
7. ⏳ Switch to live mode and launch

## Testing

All accounts are in **test mode**. Use test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

## Security Notes

- API keys stored in `.env` files (not committed to git)
- Webhook signatures verified on all endpoints
- HTTPS required for production
- Connected account IDs never exposed client-side

## Support

- **Stripe Dashboard**: https://dashboard.stripe.com/
- **Connect Docs**: https://docs.stripe.com/connect
- **Platform Email**: smog7108@myl.zip
