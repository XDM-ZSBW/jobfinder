# Google Cloud Platform Deployment

## Current Infrastructure

**GCP Project**: `futurelink-private-112912460`
**VM Instance**: `futurelink-vm`
**Zone**: `us-central1-a`
**Machine Type**: `e2-micro` (2 vCPUs, 1 GB memory)
**OS**: Ubuntu 22.04.5 LTS (Jammy Jellyfish)
**Architecture**: x86_64
**External IP**: `34.134.208.48`
**Status**: ✅ RUNNING

## Architecture Compatibility Assessment

### ✅ Compatible Components

1. **Operating System**: Ubuntu 22.04 LTS (fully compatible)
2. **Architecture**: x86_64 (compatible with Node.js, PostgreSQL, all dependencies)
3. **Network**: External IP available for public access
4. **gcloud CLI**: Installed and configured (version 537.0.0)

### ⚠️ Missing Requirements

The following software needs to be installed on `futurelink-vm`:

1. **Node.js 20+** ❌ Not installed
2. **npm** ❌ Not installed (comes with Node.js)
3. **PostgreSQL 15+** ❌ Not verified
4. **Git** ❓ Status unknown
5. **Process Manager** (PM2 or systemd) ❌ Not configured

### ⚠️ Resource Limitations

**e2-micro Specifications**:
- **vCPUs**: 2 (shared-core)
- **Memory**: 1 GB
- **Disk**: Not specified in verification

**Recommendations**:
- Current machine type is suitable for **development/testing only**
- For production, upgrade to at least `e2-small` (2 GB RAM) or `e2-medium` (4 GB RAM)
- Consider Cloud Run for production deployment (as per architecture design)

## VM Setup Procedure

### Step 1: SSH Access

```bash
# From local machine
gcloud compute ssh futurelink-vm --zone us-central1-a
```

### Step 2: Install Node.js 20.x

```bash
# Update package lists
sudo apt update

# Install Node.js 20.x from NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v  # Should output v20.x.x
npm -v   # Should output 10.x.x or higher
```

### Step 3: Install PostgreSQL 15

```bash
# Install PostgreSQL 15
sudo apt install -y postgresql-15 postgresql-contrib-15

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version  # Should output "psql (PostgreSQL) 15.x"

# Create database user for your Linux user
sudo -u postgres createuser -s $USER

# Set password for postgres user (optional but recommended)
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your_secure_password';"
```

### Step 4: Install Git

```bash
# Install Git
sudo apt install -y git

# Verify installation
git --version

# Configure Git (replace with your details)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 5: Clone and Setup Repository

```bash
# Clone repository (replace with actual repository URL)
cd ~
git clone https://github.com/your-org/jobmatch-ai.git
cd jobmatch-ai

# Install dependencies (use npm ci for clean install)
npm ci

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Step 6: Configure Environment Variables

**Edit `backend/.env`:**

```bash
nano backend/.env
```

Set the following (replace with actual values):

```env
# Server Configuration
PORT=4000
NODE_ENV=production
FRONTEND_URL=http://34.134.208.48:3000

# Database (local PostgreSQL)
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/jobmatch_ai

# JWT Authentication (generate a secure random string)
JWT_SECRET=<GENERATE_SECURE_SECRET_KEY>
JWT_EXPIRES_IN=7d

# OpenAI API
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>

# Logging
LOG_LEVEL=info
```

**Edit `frontend/.env`:**

```bash
nano frontend/.env
```

```env
NEXT_PUBLIC_API_URL=http://34.134.208.48:4000
```

### Step 7: Database Setup

```bash
# Create database
createdb jobmatch_ai

# Generate Prisma Client
npm run generate --workspace=backend

# Run database migrations
npm run migrate --workspace=backend

# Verify database
psql -d jobmatch_ai -c "\dt"  # List tables
```

### Step 8: Build Application

```bash
# Build all workspaces
npm run build
```

### Step 9: Configure Firewall Rules

**From your local machine:**

```bash
# Create firewall rule for ports 3000 and 4000
gcloud compute firewall-rules create jobmatch-dev-allow \
  --project=futurelink-private-112912460 \
  --allow=tcp:3000,tcp:4000 \
  --description="Allow jobmatch-ai dev ports" \
  --target-tags=jobmatch-dev \
  --source-ranges=0.0.0.0/0

# Apply firewall tag to VM
gcloud compute instances add-tags futurelink-vm \
  --tags=jobmatch-dev \
  --zone=us-central1-a \
  --project=futurelink-private-112912460
```

### Step 10: Start Application

#### Option A: Development Mode (for testing)

```bash
# Start backend
npm run dev:backend &

# Start frontend
npm run dev:frontend &

# Test endpoints
curl http://localhost:4000/health
curl -I http://localhost:3000
```

#### Option B: Production Mode with PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'jobmatch-backend',
      cwd: './backend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'jobmatch-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Enable PM2 startup on boot
pm2 startup

# Check status
pm2 status
```

### Step 11: Verify Deployment

**From your local machine:**

```bash
# Test backend health endpoint
curl http://34.134.208.48:4000/health

# Test frontend
curl -I http://34.134.208.48:3000

# Test API endpoint
curl http://34.134.208.48:4000/api/v1
```

**Access from browser:**
- Frontend: http://34.134.208.48:3000
- Backend API: http://34.134.208.48:4000/api/v1

## Security Considerations

### ⚠️ Current Setup Issues

1. **HTTP Only**: No HTTPS/SSL configured (traffic is unencrypted)
2. **Open Firewall**: Ports 3000 and 4000 are publicly accessible
3. **Weak Machine**: e2-micro is not production-grade
4. **No Load Balancer**: Single point of failure
5. **Secrets in .env**: Environment variables stored in plain text

### 🔒 Production Security Checklist

- [ ] Set up HTTPS with SSL certificate (Let's Encrypt or Cloud Load Balancer)
- [ ] Use Google Secret Manager for sensitive credentials
- [ ] Configure Cloud Armor for DDoS protection
- [ ] Implement Cloud IAP (Identity-Aware Proxy) for admin access
- [ ] Restrict firewall rules to specific IP ranges
- [ ] Set up Cloud Monitoring and logging
- [ ] Configure automated backups for PostgreSQL
- [ ] Use Cloud SQL instead of self-hosted PostgreSQL
- [ ] Implement rate limiting and API throttling
- [ ] Set up VPC and private networking

## Alternative: Cloud Run Deployment (Recommended)

Based on the comprehensive architecture design document, the production deployment should use **Google Cloud Run** for the following benefits:

### Advantages of Cloud Run

1. **Auto-scaling**: Scales to zero when idle (cost-effective)
2. **Managed Infrastructure**: No server maintenance
3. **Built-in Load Balancing**: High availability by default
4. **HTTPS by Default**: Automatic SSL certificates
5. **Easy CI/CD**: Integrates with Cloud Build
6. **Container-based**: Aligns with microservices architecture

### Cloud Run Migration Path

1. **Containerize Backend**:
   ```dockerfile
   # backend/Dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npx prisma generate
   EXPOSE 4000
   CMD ["npm", "start"]
   ```

2. **Containerize Frontend**:
   ```dockerfile
   # frontend/Dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   FROM node:20-alpine
   WORKDIR /app
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/package*.json ./
   RUN npm ci --only=production
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

3. **Deploy to Cloud Run**:
   ```bash
   # Build and push backend
   gcloud builds submit --tag gcr.io/futurelink-private-112912460/jobmatch-backend ./backend
   gcloud run deploy jobmatch-backend \
     --image gcr.io/futurelink-private-112912460/jobmatch-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   
   # Build and push frontend
   gcloud builds submit --tag gcr.io/futurelink-private-112912460/jobmatch-frontend ./frontend
   gcloud run deploy jobmatch-frontend \
     --image gcr.io/futurelink-private-112912460/jobmatch-frontend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

4. **Use Cloud SQL**:
   - Managed PostgreSQL instance
   - Automatic backups and failover
   - Connect via Cloud SQL Proxy or private IP

## Cost Estimate

### Current Setup (e2-micro VM)

- **Compute**: ~$7/month (e2-micro, 24/7)
- **Network Egress**: ~$12/100GB
- **Disk**: ~$0.04/GB/month
- **Total**: ~$20-30/month (light usage)

### Recommended Production (Cloud Run + Cloud SQL)

- **Cloud Run Backend**: ~$10-50/month (depends on traffic)
- **Cloud Run Frontend**: ~$5-20/month
- **Cloud SQL (db-f1-micro)**: ~$15/month
- **Load Balancer**: ~$20/month
- **Network Egress**: ~$12/100GB
- **Total**: ~$60-120/month (moderate traffic)

## Monitoring and Maintenance

### Set Up Monitoring

```bash
# Install Cloud Monitoring agent (on VM)
curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
sudo bash add-google-cloud-ops-agent-repo.sh --also-install

# Agent will automatically collect metrics and logs
```

### Regular Maintenance Tasks

1. **Update Dependencies**: Weekly security patches
2. **Database Backups**: Daily automated backups
3. **Log Review**: Monitor error logs in Cloud Logging
4. **Performance Metrics**: Track CPU, memory, response times
5. **Cost Analysis**: Review billing dashboard monthly

## Next Steps

1. ✅ Complete VM setup using the procedures above
2. ⏳ Test deployment with sample data
3. ⏳ Implement production security measures
4. ⏳ Set up monitoring and alerting
5. ⏳ Plan migration to Cloud Run architecture
6. ⏳ Configure domain name and SSL certificate
7. ⏳ Set up CI/CD pipeline with Cloud Build

---

**Document Version**: 1.0
**Last Updated**: 2025-10-25
**Next Review**: 2025-11-25
