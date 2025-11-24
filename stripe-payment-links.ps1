# Stripe Payment Links Generator for JobMatch.zip
# Create checkout links without touching the dashboard

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("create", "list", "deactivate")]
    [string]$Action = "create"
)

$ErrorActionPreference = "Stop"

function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# Load configuration
function Get-StripeConfig {
    if (!(Test-Path "stripe-config.json")) {
        Write-Error "Configuration not found. Run: .\stripe-cli-setup.ps1 -Action setup"
        exit 1
    }
    
    return Get-Content "stripe-config.json" | ConvertFrom-Json
}

# Create payment links
function New-PaymentLinks {
    Write-Info "Creating payment links for JobMatch.zip...`n"
    
    $config = Get-StripeConfig
    
    # Job Seeker Monthly Link
    Write-Info "Creating Job Seeker Monthly payment link..."
    $monthlyLink = stripe payment_links create `
        --line-items[0][price]=$($config.monthly_price_id) `
        --line-items[0][quantity]=1 `
        --after_completion[type]=redirect `
        --after_completion[redirect][url]="https://jobmatch.zip/welcome" `
        --allow_promotion_codes=true `
        --billing_address_collection=required `
        --customer_creation=always `
        --json
    
    $monthlyUrl = ($monthlyLink | ConvertFrom-Json).url
    Write-Success "✓ Monthly ($29/mo): $monthlyUrl"
    
    # Job Seeker Annual Link
    Write-Info "Creating Job Seeker Annual payment link..."
    $annualLink = stripe payment_links create `
        --line-items[0][price]=$($config.annual_price_id) `
        --line-items[0][quantity]=1 `
        --after_completion[type]=redirect `
        --after_completion[redirect][url]="https://jobmatch.zip/welcome?plan=annual" `
        --allow_promotion_codes=true `
        --billing_address_collection=required `
        --customer_creation=always `
        --json
    
    $annualUrl = ($annualLink | ConvertFrom-Json).url
    Write-Success "✓ Annual ($290/yr): $annualUrl"
    
    # Employer Monthly Link
    Write-Info "Creating Employer Monthly payment link..."
    $employerLink = stripe payment_links create `
        --line-items[0][price]=$($config.employer_price_id) `
        --line-items[0][quantity]=1 `
        --after_completion[type]=redirect `
        --after_completion[redirect][url]="https://jobmatch.zip/employer/dashboard" `
        --allow_promotion_codes=true `
        --billing_address_collection=required `
        --customer_creation=always `
        --metadata[account_type]=employer `
        --json
    
    $employerUrl = ($employerLink | ConvertFrom-Json).url
    Write-Success "✓ Employer ($99/mo): $employerUrl"
    
    # Save links
    $links = @{
        job_seeker_monthly = $monthlyUrl
        job_seeker_annual = $annualUrl
        employer_monthly = $employerUrl
        created_at = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    $links | ConvertTo-Json | Out-File "stripe-payment-links.json"
    Write-Success "`n✓ Payment links saved to stripe-payment-links.json"
    
    # Create HTML snippet for easy copy-paste
    $html = @"
<!-- JobMatch.zip Payment Buttons -->

<!-- Job Seeker Monthly -->
<a href="$monthlyUrl" class="btn-primary">
    Get Premium - `$29/month
</a>

<!-- Job Seeker Annual (Save 2 months) -->
<a href="$annualUrl" class="btn-primary">
    Get Premium - `$290/year (Save `$58!)
</a>

<!-- Employer -->
<a href="$employerUrl" class="btn-employer">
    Post Jobs - `$99/month
</a>
"@
    
    $html | Out-File "payment-buttons.html"
    Write-Info "`n✓ HTML snippet saved to payment-buttons.html"
    
    Write-Info "`nNext steps:"
    Write-Info "1. Copy payment URLs from stripe-payment-links.json"
    Write-Info "2. Add to your website using payment-buttons.html"
    Write-Info "3. Run: .\stripe-listen.ps1 to handle webhook events"
}

# List existing payment links
function Get-PaymentLinks {
    Write-Info "Fetching payment links...`n"
    
    $links = stripe payment_links list --limit 10 --json | ConvertFrom-Json
    
    if ($links.data.Count -eq 0) {
        Write-Warning "No payment links found."
        return
    }
    
    Write-Info "Active Payment Links:"
    foreach ($link in $links.data) {
        Write-Info "`nURL: $($link.url)"
        Write-Info "Active: $($link.active)"
        Write-Info "Created: $($link.created)"
        
        if ($link.line_items -and $link.line_items.data.Count -gt 0) {
            $price = $link.line_items.data[0].price
            Write-Info "Price: `$$([math]::Round($price.unit_amount / 100, 2)) $($price.currency.ToUpper())"
        }
    }
}

# Deactivate a payment link
function Disable-PaymentLink {
    param([string]$LinkId)
    
    if (!$LinkId) {
        Write-Error "Link ID required. Usage: .\stripe-payment-links.ps1 -Action deactivate -LinkId plink_xxxxx"
        exit 1
    }
    
    Write-Info "Deactivating payment link: $LinkId"
    
    stripe payment_links update $LinkId --active=false
    
    Write-Success "✓ Payment link deactivated"
}

# Main execution
Write-Info "=== Stripe Payment Links Manager ===`n"

switch ($Action) {
    "create" {
        New-PaymentLinks
    }
    
    "list" {
        Get-PaymentLinks
    }
    
    "deactivate" {
        if ($args.Count -gt 0) {
            Disable-PaymentLink -LinkId $args[0]
        } else {
            Write-Error "Link ID required. Run: .\stripe-payment-links.ps1 -Action deactivate plink_xxxxx"
        }
    }
}
