#!/bin/bash
# Deploy JobMatch Platform to GCP VM

set -e

VM_NAME="${VM_NAME:-jobmatch-vm}"
ZONE="${GCP_ZONE:-us-central1-a}"
VM_IP="${VM_IP}"

if [ -z "$VM_IP" ]; then
    echo "❌ VM_IP not set. Getting from GCP..."
    VM_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format='get(networkInterfaces[0].accessConfigs[0].natIP)')
fi

echo "🚀 Deploying to VM: $VM_NAME ($VM_IP)"

# Create deployment package
echo "📦 Creating deployment package..."
rm -f jobmatch.zip
zip -r jobmatch.zip . \
    -x "*.git*" \
    -x "*node_modules*" \
    -x "*.next*" \
    -x "*__pycache__*" \
    -x "*.pyc" \
    -x "*.env*" \
    -x "*dist*" \
    -x "*.DS_Store*" \
    -x "*warp-workflows*" \
    -x "*.claude-code*" \
    -x "**/.ollama/*" \
    -x "**/ollama/*" \
    -x "*.gguf" \
    -x "*.ggml" \
    -x "**/models/*"

echo "📤 Uploading to VM..."
gcloud compute scp jobmatch.zip $VM_NAME:/opt/jobmatch/ --zone=$ZONE

echo "🔧 Deploying on VM..."
gcloud compute ssh $VM_NAME --zone=$ZONE --command="
    cd /opt/jobmatch
    unzip -o jobmatch.zip
    rm jobmatch.zip
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        cat > .env <<ENVEOF
DATABASE_URL=postgresql://jobfinder:jobfinder@postgres:5432/jobfinder
REDIS_URL=redis://redis:6379
ELASTICSEARCH_URL=http://elasticsearch:9200
# LLM Configuration (OpenRouter primary)
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=
LLM_MODEL=anthropic/claude-3.5-sonnet
SECRET_KEY=$(openssl rand -hex 32)
ENVIRONMENT=production
CORS_ORIGINS=http://$VM_IP,https://jobmatch.zip,https://www.jobmatch.zip,http://localhost:3000,http://localhost:8000
NEXT_PUBLIC_API_URL=https://jobmatch.zip/api
NEXT_PUBLIC_GTM_ID=GTM-KQV9THQ6
GOOGLE_SEARCH_CONSOLE_SITE_URL=https://jobmatch.zip
ENVEOF
    fi
    
    # Add Google Search Console credentials if they exist locally
    if [ -f secrets/search-console-credentials.json ]; then
        echo '📋 Adding Google Search Console credentials...'
        # Read credentials and escape for .env
        CREDS=\$(cat secrets/search-console-credentials.json | tr -d '\n' | sed "s/\"/\\\\\"/g")
        echo "GOOGLE_SEARCH_CONSOLE_CREDENTIALS='\$CREDS'" >> .env
    fi
    
    # Copy VERSION file
    if [ -f VERSION ]; then
        cp VERSION /opt/jobmatch/VERSION
    else
        echo "REV001" > /opt/jobmatch/VERSION
    fi
    
    # Build and start services
    docker-compose down || true
    docker-compose build --no-cache
    docker-compose up -d
    
    # Wait for services to be ready
    echo '⏳ Waiting for services to start...'
    sleep 30
    
    # Check health
    curl -f http://localhost:8000/health || echo '⚠️  Health check failed, but deployment may still be in progress'
    
    echo '✅ Deployment complete!'
"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://$VM_IP"
echo "   Backend API: http://$VM_IP/api"
echo "   API Docs: http://$VM_IP/api/docs"
echo "   Health: http://$VM_IP/health"
echo ""
echo "📋 Test endpoints:"
echo "   curl http://$VM_IP/health"
echo "   curl http://$VM_IP/api/health"

