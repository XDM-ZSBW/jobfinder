# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

JobMatch AI is an AI-powered SaaS platform connecting job seekers directly with hiring managers, bypassing traditional job board inefficiencies through intelligent matching and verification.

**Note for Development Team**: This project uses a synchronized development environment with Cursor and Warp. Update this file when changing scripts, ports, API paths, or deployment configuration.

## Common Development Commands

### Installation

```bash
# Install all workspace dependencies
npm install
```

### Environment Setup

**Windows (PowerShell):**
```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

**macOS/Linux:**
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**Required Environment Variables:**
- `backend/.env`: `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `FRONTEND_URL`, `PORT` (default: 4000)
- `frontend/.env`: `NEXT_PUBLIC_API_URL` (default: http://localhost:4000)

### Database Setup

```bash
# Create database (requires PostgreSQL 15+ installed)
createdb jobmatch_ai

# Generate Prisma Client
npm run generate --workspace=backend

# Run migrations
npm run migrate --workspace=backend

# Open Prisma Studio (database GUI)
npm run db:studio --workspace=backend
```

### Development Servers

```bash
# Start both frontend and backend
npm run dev

# Start backend only (port 4000)
npm run dev:backend

# Start frontend only (port 3000)
npm run dev:frontend
```

### Build

```bash
# Build all workspaces
npm run build
```

### Testing

```bash
# Run all tests
npm run test

# Run single test (Jest)
npm run test --workspace=backend -- -t "test name pattern"
npm run test --workspace=backend -- path/to/file.test.ts

# Run single test (if using Vitest)
npm run test --workspace=frontend -- -t "test name pattern"
```

### Code Quality

```bash
# Lint all workspaces
npm run lint

# Type check all workspaces
npm run typecheck
```

## High-Level Architecture

**Monorepo Structure:**
- **frontend/**: Next.js 14 (App Router) + React + TypeScript + Tailwind CSS
- **backend/**: Express + TypeScript + Prisma + PostgreSQL
- **shared/**: Shared types and utilities (currently empty, reserved for future use)

**Key Ports:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- Prisma Studio: `http://localhost:5555`

**Backend Architecture:**
- **Framework**: Express.js on Node.js 20+
- **Database**: PostgreSQL 15+ via Prisma ORM
- **Real-time**: Socket.io server with CORS for frontend origin
- **Logging**: Winston (JSON format, configurable log level)
- **AI Integration**: OpenAI GPT-4 + text-embedding models via `backend/src/services/aiService.ts`

**Frontend Architecture:**
- **Framework**: Next.js 14 with App Router
- **State**: Zustand for client state, React Query for server state
- **Forms**: React Hook Form + Zod validation
- **UI**: Tailwind CSS + shadcn/ui components
- **Real-time**: Socket.io client for live messaging

**Authentication:**
- JWT-based with roles: `JOB_SEEKER`, `HIRING_MANAGER`, `ADMIN`
- Middleware: `authenticateToken` (JWT validation), `requireRole` (RBAC)
- Token expiry: 7 days (configurable via `JWT_EXPIRES_IN`)

## Database Architecture

**ORM**: Prisma + PostgreSQL

**Core Models:**
- `User` - Authentication and base user data
- `JobSeekerProfile` - Resume, skills, experience, preferences
- `HiringManagerProfile` - Company affiliation, verification status
- `Job` - Job postings with requirements, salary, location
- `Application` - Job applications with status tracking
- `Match` - AI-generated candidate-job matches with scores
- `Message` - Direct messaging between users

**Application Status Lifecycle:**
```
SUBMITTED → UNDER_REVIEW → INTERVIEW_SCHEDULED → REJECTED/ACCEPTED
```

**Match Record Fields:**
- `score` (0-100): Overall match quality
- `strengths`: Array of matching qualifications
- `gaps`: Array of missing qualifications
- `reasoning`: AI-generated explanation

**Debugging Tip**: Use `npm run db:studio --workspace=backend` to visually inspect and edit database records.

## AI Service Patterns

**Service Location**: `backend/src/services/aiService.ts`

**Key Methods:**
- `parseResume(resumeText)` - Extract structured data from resume text
- `calculateMatchScore(candidateProfile, jobDescription)` - Generate match score with reasoning
- `generateInterviewQuestions(jobDescription, candidateProfile)` - Create relevant interview questions
- `analyzeJobPosting(jobDescription)` - Detect fraud/scam patterns
- `generateRecommendations(candidateProfile, availableJobs)` - Batch scoring for recommendations

**LLM Configuration:**
- **Production**: OpenAI GPT-4 with `response_format: { type: 'json_object' }`
- **Future**: Vector database (Qdrant) planned for semantic search
- **Local Development Option**: Team prefers `llama3.2` via Ollama for cost savings (not yet integrated)

**Embedding Strategy:**
- Uses OpenAI `text-embedding-3-large` model (1536 dimensions)
- Embeddings cached to avoid regeneration
- Future: Store in Qdrant vector database for similarity search

## API Architecture

**Base Path**: `/api/v1`

**Authentication**: Bearer token in `Authorization` header

**Endpoint Groups:**
- `/auth` - Register, login
- `/profile` - User profile management
- `/jobs` - Job posting CRUD
- `/applications` - Apply to jobs, track status
- `/matches` - AI-powered job-candidate matching
- `/messages` - Direct messaging between users

**Health Check**: `/health` (returns `{ status: 'ok', timestamp }`)

**Middleware Stack:**
1. CORS (configured for frontend origin)
2. JSON body parser
3. `authenticateToken` (JWT validation)
4. `requireRole(['HIRING_MANAGER'])` (role-based access control)

## Important Patterns

**Service Layer Pattern:**
- Business logic isolated in service classes (`authService`, `aiService`)
- Controllers handle HTTP concerns, delegate to services
- Services are exported as singletons (e.g., `export const aiService = new AIService()`)

**Middleware Composition:**
- Authentication middleware adds `req.user` to request object
- Role middleware checks `req.user.role` against allowed roles
- Apply at route level: `app.post('/api/v1/jobs', authenticateToken, requireRole(['HIRING_MANAGER']), createJob)`

**Socket.io Real-time:**
- Server initialized in `backend/src/index.ts` with CORS for frontend
- Frontend connects on app load
- Events: `message:new`, `application:status_changed`

**Shared Types (Future):**
- The `shared/` workspace is reserved for shared TypeScript types/interfaces
- Use path mapping in `tsconfig.json` to reference shared types
- Ensures type safety between frontend and backend

**Password Security:**
- bcrypt with 10 salt rounds
- Validation: min 8 chars, uppercase, lowercase, number
- JWT tokens expire in 7 days (or configured value)

## Google Cloud Platform Deployment

**Project**: `futurelink-private-112912460`
**VM Instance**: `futurelink-vm` (us-central1-a)
**Machine Type**: e2-micro
**OS**: Ubuntu 22.04.5 LTS (Jammy Jellyfish)
**External IP**: 34.134.208.48

### VM Setup Requirements

The VM currently requires the following installations:

1. **Node.js 20+** (not installed)
2. **npm** (comes with Node.js)
3. **PostgreSQL 15+** (not verified)
4. **Git** (to clone repository)

### GCP CLI Verification Commands

```bash
# Verify gcloud installation
gcloud --version

# Configure project
gcloud config set project futurelink-private-112912460

# List instances
gcloud compute instances list

# SSH into VM
gcloud compute ssh futurelink-vm --zone us-central1-a

# Check OS and architecture
uname -a
cat /etc/os-release
```

### VM Setup Script (Run on futurelink-vm)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v

# Install PostgreSQL 15
sudo apt install -y postgresql-15 postgresql-contrib-15

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify PostgreSQL
psql --version

# Install Git (if not present)
sudo apt install -y git

# Create database user
sudo -u postgres createuser -s $USER

# Clone repository (replace with actual repo URL)
git clone <repository-url> jobmatch-ai
cd jobmatch-ai

# Install dependencies
npm ci

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with production values
nano backend/.env  # Set DATABASE_URL, JWT_SECRET, OPENAI_API_KEY

# Create database
createdb jobmatch_ai

# Run migrations
npm run generate --workspace=backend
npm run migrate --workspace=backend

# Build applications
npm run build

# Test backend
npm run dev:backend &
curl http://localhost:4000/health

# Test frontend
npm run dev:frontend &
curl -I http://localhost:3000
```

### Firewall Configuration

```bash
# Allow ports 3000 and 4000 for external access
gcloud compute firewall-rules create jobmatch-dev-allow \
  --allow=tcp:3000,tcp:4000 \
  --description="Allow jobmatch-ai dev ports" \
  --target-tags=jobmatch-dev

# Tag the VM instance
gcloud compute instances add-tags futurelink-vm \
  --tags=jobmatch-dev \
  --zone=us-central1-a
```

### Production Deployment (Future)

For production, consider:
- **Google Cloud Run**: Containerized microservices (recommended architecture from design doc)
- **Cloud SQL**: Managed PostgreSQL
- **Load Balancing**: For high availability
- **Cloud Storage**: Resume/file storage
- **Secret Manager**: API keys and credentials

## Troubleshooting

**Port Already in Use:**
- Backend: Change `PORT` in `backend/.env`
- Frontend: Run with `PORT=3001 npm run dev:frontend`

**Database Connection Issues:**
1. Ensure PostgreSQL is running: `sudo systemctl status postgresql`
2. Verify `DATABASE_URL` in `backend/.env`
3. Test connection: `psql -d jobmatch_ai`

**Prisma Issues:**
```bash
cd backend
npx prisma generate
npx prisma migrate reset  # Warning: destroys all data
cd ..
```

**Missing Dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Additional Resources

- [API Documentation](./docs/API.md) - Detailed endpoint specifications
- [Setup Guide](./docs/SETUP.md) - In-depth installation instructions
- [README](./README.md) - Project overview and features

---

**Last Updated**: 2025-10-25
**Maintainers**: Update this file when modifying scripts, ports, or deployment configuration.
