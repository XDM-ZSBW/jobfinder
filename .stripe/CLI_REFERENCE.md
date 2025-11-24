# Stripe Connect CLI Quick Reference

## Account Management

### List All Connected Accounts
```powershell
stripe get /v1/accounts
```

### Get Specific Account Details
```powershell
# JobMatch
stripe get /v1/accounts/acct_1SWuVnBeYfqTS1Pz

# Yourl.Cloud
stripe get /v1/accounts/acct_1SWuWmPVF4RQapfW
```

### Create New Connected Account
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

### Update Connected Account
```powershell
stripe post /v1/accounts/acct_XXXXXX `
  -d "business_profile[url]=https://example.com" `
  -d "business_profile[mcc]=5734"
```

## Onboarding

### Generate Account Link (Onboarding)
```powershell
stripe post /v1/account_links `
  -d account=acct_XXXXXX `
  -d type=account_onboarding `
  -d "return_url=https://xdmiq.com/connect/return" `
  -d "refresh_url=https://xdmiq.com/connect/refresh"
```

### Generate Account Link (Update Info)
```powershell
stripe post /v1/account_links `
  -d account=acct_XXXXXX `
  -d type=account_update `
  -d "return_url=https://xdmiq.com/connect/return" `
  -d "refresh_url=https://xdmiq.com/connect/refresh"
```

### Create Login Link (Dashboard Access)
```powershell
stripe post /v1/accounts/acct_XXXXXX/login_links
```

## Payments

### Create Direct Charge (Test)
```powershell
# For JobMatch
stripe post /v1/payment_intents `
  -d amount=10000 `
  -d currency=usd `
  -d "payment_method_types[]=card" `
  -d application_fee_amount=1000 `
  --stripe-account=acct_1SWuVnBeYfqTS1Pz
```

### List Payments for Connected Account
```powershell
stripe get /v1/charges --stripe-account=acct_1SWuVnBeYfqTS1Pz
```

### List Platform Fees (Application Fees)
```powershell
stripe get /v1/application_fees
```

## Products & Prices

### Create Product
```powershell
stripe post /v1/products `
  -d name="JobMatch Premium" `
  -d type=service `
  --stripe-account=acct_1SWuVnBeYfqTS1Pz
```

### Create Price
```powershell
stripe post /v1/prices `
  -d product=prod_XXXXXX `
  -d unit_amount=2999 `
  -d currency=usd `
  -d "recurring[interval]=month" `
  --stripe-account=acct_1SWuVnBeYfqTS1Pz
```

### List Products
```powershell
stripe get /v1/products --stripe-account=acct_1SWuVnBeYfqTS1Pz
```

## Webhooks

### List Webhooks
```powershell
stripe get /v1/webhook_endpoints
```

### Create Webhook Endpoint
```powershell
stripe post /v1/webhook_endpoints `
  -d "url=https://xdmiq.com/webhooks/stripe" `
  -d "enabled_events[]=payment_intent.succeeded" `
  -d "enabled_events[]=charge.succeeded" `
  -d "enabled_events[]=account.updated" `
  -d connect=true
```

### Listen to Webhooks Locally
```powershell
stripe listen --forward-to localhost:4000/webhooks/stripe
```

## Testing

### Trigger Test Events
```powershell
# Successful payment
stripe trigger payment_intent.succeeded

# Failed payment
stripe trigger payment_intent.payment_failed

# Account updated
stripe trigger account.updated
```

### Test Cards
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Insufficient Funds**: 4000 0000 0000 9995
- **3D Secure Required**: 4000 0025 0000 3155

## Transfers & Payouts

### List Transfers to Platform
```powershell
stripe get /v1/transfers
```

### List Payouts for Connected Account
```powershell
stripe get /v1/payouts --stripe-account=acct_1SWuVnBeYfqTS1Pz
```

## Balances

### Get Platform Balance
```powershell
stripe get /v1/balance
```

### Get Connected Account Balance
```powershell
stripe get /v1/balance --stripe-account=acct_1SWuVnBeYfqTS1Pz
```

## Account IDs Reference

- **Platform**: `acct_1SWqhEBObYs4DzR4`
- **JobMatch AI**: `acct_1SWuVnBeYfqTS1Pz`
- **Yourl.Cloud**: `acct_1SWuWmPVF4RQapfW`

## Common MCC Codes

- **5734**: Computer Software Stores
- **7372**: Computer Programming Services
- **8111**: Legal Services
- **7299**: Miscellaneous Personal Services
- **8742**: Management Consulting Services

## Useful Links

- **Dashboard**: https://dashboard.stripe.com/
- **Connect Dashboard**: https://dashboard.stripe.com/connect/accounts/overview
- **API Docs**: https://docs.stripe.com/api
- **Connect Guide**: https://docs.stripe.com/connect
- **CLI Docs**: https://docs.stripe.com/stripe-cli
