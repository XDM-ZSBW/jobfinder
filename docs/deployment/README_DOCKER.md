# Docker Setup - Single Container

## Quick Start

### Production Build (Single Container)

```bash
# Build and start everything
docker-compose up --build

# Or in detached mode
docker-compose up -d --build
```

This starts:
- **Single app container** with both frontend and backend
- PostgreSQL database
- Redis cache
- Elasticsearch

### Development Build (Hot Reload)

```bash
# Use development compose file
docker-compose -f docker-compose.dev.yml up --build
```

## Access the Application

Once containers are running:

- **Universal Canvas**: http://localhost:3000/canvas
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Architecture

### Single Container Design

The `app` container runs both services:
- **Backend** (FastAPI) on port 8000
- **Frontend** (Next.js) on port 3000

Managed by `supervisord` to run both processes.

### Container Structure

```
/app
├── backend/          # Python FastAPI application
├── frontend/         # Next.js application
└── supervisord.conf  # Process manager config
```

## Environment Variables

Create a `.env` file:

```env
POSTGRES_USER=jobfinder
POSTGRES_PASSWORD=jobfinder
POSTGRES_DB=jobfinder
OPENAI_API_KEY=your_key_here
SECRET_KEY=your_secret_key_here
ENVIRONMENT=production
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

## Commands

### Start Services
```bash
docker-compose up
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Just the app container
docker-compose logs -f app

# Backend logs only
docker-compose exec app tail -f /var/log/supervisor/backend.out.log

# Frontend logs only
docker-compose exec app tail -f /var/log/supervisor/frontend.out.log
```

### Rebuild After Changes
```bash
docker-compose up --build
```

### Access Container Shell
```bash
docker-compose exec app /bin/bash
```

### Check Service Status
```bash
docker-compose ps
```

## Development vs Production

### Development (`docker-compose.dev.yml`)
- Hot reload enabled for both frontend and backend
- Source code mounted as volumes
- Faster iteration

### Production (`docker-compose.yml`)
- Optimized builds
- No hot reload
- Production-ready configuration

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the ports
netstat -ano | findstr ":3000"
netstat -ano | findstr ":8000"

# Or change ports in docker-compose.yml
ports:
  - "8001:8000"  # Backend
  - "3001:3000"  # Frontend
```

### Container Won't Start
```bash
# Check logs
docker-compose logs app

# Rebuild from scratch
docker-compose down -v
docker-compose up --build
```

### Database Connection Issues
```bash
# Check if postgres is healthy
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres
```

### Frontend Not Loading
```bash
# Check frontend logs
docker-compose exec app tail -f /var/log/supervisor/frontend.out.log

# Verify Next.js build
docker-compose exec app ls -la /app/frontend/.next
```

## Health Checks

The app container includes health checks:
- Backend: `http://localhost:8000/health`
- Frontend: `http://localhost:3000`

Check health status:
```bash
docker-compose ps
```

## Volumes

Data persists in Docker volumes:
- `postgres_data` - Database data
- `redis_data` - Redis cache
- `elasticsearch_data` - Elasticsearch indices

To remove all data:
```bash
docker-compose down -v
```

