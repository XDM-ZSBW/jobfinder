# Deploy Governance Agent to Google Cloud Platform
# Usage: .\deploy-governance-agent.ps1 -ProjectId "your-project-id"

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-central1",
    
    [Parameter(Mandatory=$false)]
    [string]$ServiceAccount = "governance-agent"
)

# Set active project
gcloud config set project $ProjectId

Write-Host "🔐 Creating service account..." -ForegroundColor Cyan
gcloud iam service-accounts create $ServiceAccount `
    --display-name="Governance Agent" `
    --description="Always-running governance and compliance agent"

$ServiceAccountEmail = "$ServiceAccount@$ProjectId.iam.gserviceaccount.com"

Write-Host "🔑 Granting permissions..." -ForegroundColor Cyan
# Security Reviewer role
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:$ServiceAccountEmail" `
    --role="roles/iam.securityReviewer"

# Log Viewer role
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:$ServiceAccountEmail" `
    --role="roles/logging.viewer"

# Cloud Run Invoker (for self-invocation)
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:$ServiceAccountEmail" `
    --role="roles/run.invoker"

Write-Host "🐳 Building container..." -ForegroundColor Cyan
# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Create artifact registry repository
gcloud artifacts repositories create agents `
    --repository-format=docker `
    --location=$Region `
    --description="Governance agent containers"

# Build and push
$ImageUrl = "$Region-docker.pkg.dev/$ProjectId/agents/governance-agent:latest"
gcloud builds submit --tag $ImageUrl .

Write-Host "🚀 Deploying to Cloud Run..." -ForegroundColor Cyan
gcloud run deploy governance-agent `
    --image $ImageUrl `
    --platform managed `
    --region $Region `
    --no-allow-unauthenticated `
    --min-instances 1 `
    --max-instances 5 `
    --memory 512Mi `
    --cpu 1 `
    --service-account $ServiceAccountEmail `
    --set-env-vars "GOOGLE_CLOUD_PROJECT=$ProjectId,MODE=continuous"

# Get service URL
$ServiceUrl = gcloud run services describe governance-agent `
    --platform managed `
    --region $Region `
    --format "value(status.url)"

Write-Host "⏰ Setting up scheduler..." -ForegroundColor Cyan
gcloud services enable cloudscheduler.googleapis.com

# Hourly audit
gcloud scheduler jobs create http governance-audit-hourly `
    --location=$Region `
    --schedule="0 * * * *" `
    --uri="$ServiceUrl/audit" `
    --http-method=POST `
    --oidc-service-account-email=$ServiceAccountEmail `
    --oidc-token-audience="$ServiceUrl"

# Daily full scan
gcloud scheduler jobs create http governance-scan-daily `
    --location=$Region `
    --schedule="0 2 * * *" `
    --uri="$ServiceUrl/scan" `
    --http-method=POST `
    --oidc-service-account-email=$ServiceAccountEmail `
    --oidc-token-audience="$ServiceUrl"

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "Service URL: $ServiceUrl" -ForegroundColor Yellow
Write-Host "Service Account: $ServiceAccountEmail" -ForegroundColor Yellow
Write-Host "`nThe agent is now running with:"
Write-Host "  - Hourly compliance audits"
Write-Host "  - Daily full project scans"
Write-Host "  - Minimum 1 instance always running"
