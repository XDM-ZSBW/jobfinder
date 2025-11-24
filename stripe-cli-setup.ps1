# Stripe CLI Setup for JobMatch.zip
# Fully CLI-based payment processing

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("install", "login", "setup", "test")]
    [string]$Action = "setup"
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# Check if Stripe CLI is installed
function Test-StripeCLI {
    try {
        $version = stripe --version 2>$null
        return $true
    } catch {
        return $false
    }
}

# Install Stripe CLI using Scoop
function Install-StripeCLI {
    Write-Info "Installing Stripe CLI..."
    
    # Check if Scoop is installed
    if (!(Get-Command scoop -ErrorAction SilentlyContinue)) {
        Write-Warning "Scoop package manager not found. Installing Scoop..."
        
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
        
        Write-Success "✓ Scoop installed"
    }
    
    # Install Stripe CLI via Scoop
    scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
    scoop install stripe
    
    if (Test-StripeCLI) {
        Write-Success "✓ Stripe CLI installed successfully"
        stripe --version
    } else {
        Write-Error "✗ Failed to install Stripe CLI"
        exit 1
    }
}

# Login to Stripe account
function Connect-Stripe {
    Write-Info "Logging into Stripe account..."
    Write-Warning "This will open your browser for authentication."
    
    stripe login
    
    Write-Success "✓ Logged into Stripe"
}

# Create Stripe product and price for JobMatch.zip
function New-StripeProduct {
    Write-Info "Creating JobMatch.zip payment products..."
    
    # Create product for Premium Job Seeker subscription
    $product = stripe products create `
        --name "JobMatch.zip Premium - Job Seeker" `
        --description "AI-powered job matching with direct employer access" `
        --json
    
    $productId = ($product | ConvertFrom-Json).id
    Write-Success "✓ Created product: $productId"
    
    # Create monthly price
    $monthlyPrice = stripe prices create `
        --product $productId `
        --unit-amount 2900 `
        --currency usd `
        --recurring[interval]=month `
        --nickname "Monthly Subscription" `
        --json
    
    $monthlyPriceId = ($monthlyPrice | ConvertFrom-Json).id
    Write-Success "✓ Created monthly price ($29/month): $monthlyPriceId"
    
    # Create annual price with discount
    $annualPrice = stripe prices create `
        --product $productId `
        --unit-amount 29000 `
        --currency usd `
        --recurring[interval]=year `
        --nickname "Annual Subscription (2 months free)" `
        --json
    
    $annualPriceId = ($annualPrice | ConvertFrom-Json).id
    Write-Success "✓ Created annual price ($290/year): $annualPriceId"
    
    # Create employer product
    $employerProduct = stripe products create `
        --name "JobMatch.zip Premium - Employer" `
        --description "Post verified jobs and access AI-ranked candidates" `
        --json
    
    $employerProductId = ($employerProduct | ConvertFrom-Json).id
    Write-Success "✓ Created employer product: $employerProductId"
    
    # Create employer monthly price
    $employerPrice = stripe prices create `
        --product $employerProductId `
        --unit-amount 9900 `
        --currency usd `
        --recurring[interval]=month `
        --nickname "Employer Monthly" `
        --json
    
    $employerPriceId = ($employerPrice | ConvertFrom-Json).id
    Write-Success "✓ Created employer price ($99/month): $employerPriceId"
    
    # Save IDs to config file
    $config = @{
        product_id = $productId
        monthly_price_id = $monthlyPriceId
        annual_price_id = $annualPriceId
        employer_product_id = $employerProductId
        employer_price_id = $employerPriceId
        created_at = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    $config | ConvertTo-Json | Out-File "stripe-config.json"
    Write-Success "✓ Configuration saved to stripe-config.json"
    
    Write-Info "`nNext steps:"
    Write-Info "1. Run: .\stripe-payment-links.ps1 to create payment links"
    Write-Info "2. Run: .\stripe-listen.ps1 to set up webhook listener"
}

# Test Stripe configuration
function Test-StripeSetup {
    Write-Info "Testing Stripe configuration..."
    
    # List products
    $products = stripe products list --limit 3 --json | ConvertFrom-Json
    
    if ($products.data.Count -gt 0) {
        Write-Success "✓ Connected to Stripe account"
        Write-Info "Found $($products.data.Count) products:"
        
        foreach ($product in $products.data) {
            Write-Info "  - $($product.name) (ID: $($product.id))"
        }
    } else {
        Write-Warning "! No products found. Run setup to create products."
    }
}

# Main execution
Write-Info "=== Stripe CLI Setup for JobMatch.zip ===`n"

switch ($Action) {
    "install" {
        if (Test-StripeCLI) {
            Write-Success "✓ Stripe CLI already installed"
            stripe --version
        } else {
            Install-StripeCLI
        }
    }
    
    "login" {
        Connect-Stripe
    }
    
    "setup" {
        # Full setup flow
        if (!(Test-StripeCLI)) {
            Install-StripeCLI
        }
        
        Connect-Stripe
        New-StripeProduct
        Test-StripeSetup
        
        Write-Success "`n✓ Setup complete!"
    }
    
    "test" {
        if (!(Test-StripeCLI)) {
            Write-Error "Stripe CLI not installed. Run: .\stripe-cli-setup.ps1 -Action install"
            exit 1
        }
        
        Test-StripeSetup
    }
}
