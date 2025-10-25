#!/bin/bash

# Setup AWS credentials in Google Secret Manager for JobMatch AI
# Run this script to add AWS SES credentials to Secret Manager

PROJECT_ID="futurelink-private-112912460"

echo "🔐 Setting up AWS credentials in Google Secret Manager..."

# AWS Access Key ID
echo "Creating jobmatch-aws-access-key-id secret..."
echo "YOUR_AWS_ACCESS_KEY_ID" | gcloud secrets create jobmatch-aws-access-key-id \
  --data-file=- \
  --project=$PROJECT_ID \
  --replication-policy="automatic"

# AWS Secret Access Key
echo "Creating jobmatch-aws-secret-access-key secret..."
echo "YOUR_AWS_SECRET_ACCESS_KEY" | gcloud secrets create jobmatch-aws-secret-access-key \
  --data-file=- \
  --project=$PROJECT_ID \
  --replication-policy="automatic"

echo "✅ AWS credentials added to Secret Manager!"
echo ""
echo "📧 SES Configuration:"
echo "AWS_REGION=us-west-2"
echo "SES_REGION=us-west-2"
echo "SES_FROM_EMAIL=admin@futurelink.zip"
echo "EMAIL_PROVIDER_MODE=sdk"
echo "USE_SES_TRANSPORT=true"
echo "AWS_S3_BUCKET=futurelink-storage"
echo ""
echo "🔧 Add these environment variables to your deployment configuration."
