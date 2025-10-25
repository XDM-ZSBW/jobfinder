#!/bin/bash
set -e

echo "=== JobMatch AI VM Setup Script ==="
echo "Starting VM setup at $(date)"
echo ""

# Update system
echo "Step 1: Updating system packages..."
sudo apt update

# Install Git if not present
echo "Step 2: Installing Git..."
sudo apt install -y git

# Add PostgreSQL repository
echo "Step 3: Adding PostgreSQL repository..."
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update

# Install PostgreSQL 15
echo "Step 4: Installing PostgreSQL 15..."
sudo apt install -y postgresql-15 postgresql-contrib-15

# Start and enable PostgreSQL
echo "Step 5: Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database user
echo "Step 6: Creating database user..."
sudo -u postgres createuser -s $USER || echo "User already exists"

# Verify installations
echo ""
echo "=== Installation Verification ==="
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"
echo "PostgreSQL version: $(psql --version)"
echo "Git version: $(git --version)"
echo ""

# Display next steps
echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "1. Clone the repository:"
echo "   git clone <repository-url> ~/jobmatch-ai"
echo ""
echo "2. Navigate to the directory:"
echo "   cd ~/jobmatch-ai"
echo ""
echo "3. Install dependencies:"
echo "   npm ci"
echo ""
echo "4. Set up environment files:"
echo "   cp backend/.env.example backend/.env"
echo "   cp frontend/.env.example frontend/.env"
echo ""
echo "5. Edit backend/.env with your configuration:"
echo "   nano backend/.env"
echo ""
echo "6. Create database:"
echo "   createdb jobmatch_ai"
echo ""
echo "7. Run Prisma migrations:"
echo "   npm run generate --workspace=backend"
echo "   npm run migrate --workspace=backend"
echo ""
echo "8. Build the application:"
echo "   npm run build"
echo ""
echo "9. Start the services:"
echo "   npm run dev"
echo ""
echo "Setup completed at $(date)"
