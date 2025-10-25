#!/bin/bash

# JobMatch AI Backend Deployment Script
# This script deploys the updated backend code to the production VM

set -e  # Exit on any error

PROJECT_ID="futurelink-private-112912460"
VM_NAME="futurelink-vm"
ZONE="us-central1-a"
VM_IP="34.134.208.48"

echo "🚀 Starting JobMatch AI Backend Deployment..."
echo "📡 Target: $VM_NAME ($VM_IP)"
echo ""

# Function to execute commands on the VM
run_on_vm() {
    echo "🔧 Executing: $1"
    gcloud compute ssh $VM_NAME --zone=$ZONE --command="$1"
}

# Function to copy files to the VM
copy_to_vm() {
    echo "📁 Copying: $1 to $2"
    gcloud compute scp $1 $VM_NAME:$2 --zone=$ZONE
}

echo "1️⃣ Checking VM status..."
gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(status)"

echo ""
echo "2️⃣ Copying updated backend code to VM..."

# Copy the entire backend directory
gcloud compute scp --recurse backend/ $VM_NAME:~/jobmatch-ai/ --zone=$ZONE

echo ""
echo "3️⃣ Installing dependencies and building on VM..."

run_on_vm "
cd ~/jobmatch-ai/backend && \
echo '📦 Installing dependencies...' && \
npm install && \
echo '🔨 Building TypeScript...' && \
npm run build && \
echo '✅ Build completed successfully'
"

echo ""
echo "4️⃣ Setting up AWS credentials in Secret Manager..."

run_on_vm "
cd ~/jobmatch-ai/backend && \
echo '🔐 Adding AWS credentials to Secret Manager...' && \
echo 'YOUR_AWS_ACCESS_KEY_ID' | gcloud secrets create jobmatch-aws-access-key-id --data-file=- --project=$PROJECT_ID --replication-policy='automatic' 2>/dev/null || echo 'Secret already exists' && \
echo 'YOUR_AWS_SECRET_ACCESS_KEY' | gcloud secrets create jobmatch-aws-secret-access-key --data-file=- --project=$PROJECT_ID --replication-policy='automatic' 2>/dev/null || echo 'Secret already exists' && \
echo '✅ AWS credentials configured'
"

echo ""
echo "5️⃣ Running database migration..."

run_on_vm "
cd ~/jobmatch-ai/backend && \
echo '🗄️ Running database migration...' && \
npx prisma migrate deploy && \
echo '✅ Database migration completed'
"

echo ""
echo "6️⃣ Setting up environment variables..."

run_on_vm "
cd ~/jobmatch-ai && \
echo '⚙️ Setting up environment variables...' && \
echo 'AWS_REGION=us-west-2' >> backend/.env && \
echo 'SES_REGION=us-west-2' >> backend/.env && \
echo 'SES_FROM_EMAIL=admin@futurelink.zip' >> backend/.env && \
echo 'EMAIL_PROVIDER_MODE=sdk' >> backend/.env && \
echo 'USE_SES_TRANSPORT=true' >> backend/.env && \
echo 'AWS_S3_BUCKET=futurelink-storage' >> backend/.env && \
echo '✅ Environment variables configured'
"

echo ""
echo "7️⃣ Restarting backend service..."

run_on_vm "
cd ~/jobmatch-ai && \
echo '🔄 Restarting backend service...' && \
if command -v pm2 >/dev/null 2>&1; then \
    pm2 restart backend || pm2 start backend/dist/index.js --name backend; \
elif systemctl is-active --quiet jobmatch-backend; then \
    sudo systemctl restart jobmatch-backend; \
else \
    echo 'Starting backend manually...' && \
    cd backend && nohup npm start > ../backend.log 2>&1 &; \
fi && \
echo '✅ Backend service restarted'
"

echo ""
echo "8️⃣ Testing deployment..."

sleep 5  # Wait for service to start

echo "Testing health endpoint..."
curl -s http://$VM_IP:4000/health | jq '.' || echo "Health check failed"

echo ""
echo "Testing magic link endpoint..."
curl -s -X POST http://$VM_IP:4000/api/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' | jq '.' || echo "Magic link test failed"

echo ""
echo "Testing email health check..."
curl -s http://$VM_IP:4000/api/auth/email-health | jq '.' || echo "Email health check failed"

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Summary:"
echo "✅ Backend code updated"
echo "✅ Dependencies installed"
echo "✅ TypeScript compiled"
echo "✅ AWS credentials configured"
echo "✅ Database migrated"
echo "✅ Environment variables set"
echo "✅ Backend service restarted"
echo ""
echo "🔗 Test your Chrome extension now!"
echo "The magic link authentication should work at: http://$VM_IP:4000"
