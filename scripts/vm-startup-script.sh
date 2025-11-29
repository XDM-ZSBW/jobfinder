#!/bin/bash
# VM Startup Script - Installs Docker, Ollama, and dependencies

set -e

echo "🚀 Starting VM initialization..."

# Update system
apt-get update
apt-get install -y curl wget git unzip

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker $USER || usermod -aG docker ubuntu || true
rm get-docker.sh

# Install Docker Compose
echo "📦 Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Note: Ollama removed from production deployment
# Using OpenRouter API instead (configured via environment variables)

# Install Node.js 18+
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install Python 3.11
echo "🐍 Installing Python 3.11..."
apt-get install -y software-properties-common
add-apt-repository -y ppa:deadsnakes/ppa
apt-get update
apt-get install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Create app directory
echo "📁 Creating application directory..."
mkdir -p /opt/jobmatch
chmod 755 /opt/jobmatch

# Install Nginx for reverse proxy
echo "🌐 Installing Nginx..."
apt-get install -y nginx

# Configure Nginx
cat > /etc/nginx/sites-available/jobmatch <<EOF
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:8000/health;
    }
}
EOF

ln -sf /etc/nginx/sites-available/jobmatch /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
systemctl enable nginx

# Note: Ollama model pulling removed - using OpenRouter API instead

# Create systemd service for app
cat > /etc/systemd/system/jobmatch.service <<EOF
[Unit]
Description=JobMatch Platform
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/jobmatch
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload

echo "✅ VM initialization complete!"
echo "📋 VM is ready for deployment"
echo "💡 Run: scripts/deploy-to-vm.sh to deploy the application"

