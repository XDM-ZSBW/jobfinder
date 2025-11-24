# IT Infrastructure Agent

Automated environment management for pre-production verification.

## Purpose

The Infrastructure Agent manages localhost environments to ensure stability before production releases. It handles:
- Starting/stopping all services (Docker-based)
- Health monitoring and verification
- State tracking across sessions
- Pre-deployment validation

## Usage

### Basic Commands

```powershell
# Start environment in development mode
.\scripts\infra-agent.ps1 up

# Start in production simulation mode
.\scripts\infra-agent.ps1 up -Mode prod-sim

# Check status of all services
.\scripts\infra-agent.ps1 status

# Run verification tests (required before production release)
.\scripts\infra-agent.ps1 verify

# Stop environment
.\scripts\infra-agent.ps1 down

# Restart environment
.\scripts\infra-agent.ps1 restart

# View logs
.\scripts\infra-agent.ps1 logs

# Clean all data (containers, volumes, cache)
.\scripts\infra-agent.ps1 clean
```

### Options

- `-Mode`: Environment mode (`dev` or `prod-sim`). Default: `dev`
- `-Timeout`: Service startup timeout in seconds. Default: `300`

## Pre-Production Workflow

**CRITICAL**: You cannot trigger a release to production until localhost is stable.

1. **Start Environment**
   ```powershell
   .\scripts\infra-agent.ps1 up
   ```

2. **Verify Changes**
   ```powershell
   .\scripts\infra-agent.ps1 verify
   ```
   
   This runs comprehensive tests:
   - Backend API health check
   - Frontend accessibility
   - Universal Canvas functionality
   - Database connectivity
   - All service ports

3. **Monitor Status**
   ```powershell
   .\scripts\infra-agent.ps1 status
   ```

4. **If Tests Pass**: Proceed with production release
5. **If Tests Fail**: Review logs and fix issues
   ```powershell
   .\scripts\infra-agent.ps1 logs
   ```

## What Gets Verified

The `verify` command tests:
- ✓ Backend API (`http://localhost:8000/health`)
- ✓ Frontend (`http://localhost:3000`)
- ✓ Universal Canvas (`http://localhost:3000/canvas`)
- ✓ API Documentation (`http://localhost:8000/docs`)
- ✓ Database connectivity (implicit)

## State Tracking

The agent maintains state in `.warp/infra-state.json`:
- Current status (running/stopped)
- Mode (dev/prod-sim)
- Start time
- Health status of each service
- Docker Compose file in use

This allows the agent to manage environments across terminal sessions.

## Service Architecture

### Development Mode (`dev`)
Uses `docker-compose.dev.yml`:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Elasticsearch (port 9200)
- Backend API (port 8000)
- Frontend (port 3000)

All services run in a single container with hot reload enabled.

### Production Simulation Mode (`prod-sim`)
Uses `docker-compose.yml`:
- Same services
- Production-like configuration
- No hot reload
- Optimized builds

## Troubleshooting

### Services won't start
```powershell
# Check Docker is running
docker ps

# View detailed logs
.\scripts\infra-agent.ps1 logs

# Clean and restart
.\scripts\infra-agent.ps1 clean
.\scripts\infra-agent.ps1 up
```

### Ports already in use
```powershell
# Check what's using the port
Get-NetTCPConnection -LocalPort 8000

# Stop the agent properly
.\scripts\infra-agent.ps1 down
```

### Verification fails
```powershell
# Check individual service status
.\scripts\infra-agent.ps1 status

# View logs for failing service
.\scripts\infra-agent.ps1 logs
```

## Integration with CI/CD

The agent's exit codes can be used in automated pipelines:
- Exit code `0`: All tests passed, ready for production
- Exit code `1`: Tests failed, DO NOT release

Example workflow:
```powershell
# Pre-release check
.\scripts\infra-agent.ps1 up
$result = .\scripts\infra-agent.ps1 verify
if ($result -eq 0) {
    Write-Host "✓ Ready for production release"
    # Trigger deployment
} else {
    Write-Host "✗ Verification failed - blocking release"
    exit 1
}
```

## Environment Variables

The agent automatically loads from `.env`:
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `OPENAI_API_KEY`
- `SECRET_KEY`
- `CORS_ORIGINS`

See `.env.example` for required variables.

## Safety Features

1. **State Persistence**: Tracks environment state across sessions
2. **Health Checks**: Waits for services to be fully healthy before declaring success
3. **Timeout Protection**: Fails fast if services don't start within timeout
4. **Clean Shutdown**: Properly stops all containers and saves state
5. **Verification Required**: Must pass `verify` before production release

## Performance

- **Cold start**: ~2-3 minutes (building + starting all services)
- **Warm start**: ~30-60 seconds (services already built)
- **Verification**: ~5-10 seconds (all health checks)
- **Shutdown**: ~10-15 seconds (graceful stop)

## Best Practices

1. Always run `verify` before production releases
2. Use `status` to check health periodically during development
3. Run `clean` weekly to clear stale data
4. Use `prod-sim` mode for final pre-release verification
5. Review `logs` when verification fails

## Integration with Warp Workflows

The agent is designed to integrate with Warp's workflow system:
```yaml
# .warp/workflows/verify-environment.yaml
name: Verify Environment
command: .\scripts\infra-agent.ps1 verify
```

## Future Enhancements

- [ ] Automated rollback on verification failure
- [ ] Performance benchmarking during verification
- [ ] Integration with monitoring tools (Prometheus, Grafana)
- [ ] Snapshot and restore functionality
- [ ] Multi-environment support (staging, QA)
- [ ] Slack/email notifications on verification status
