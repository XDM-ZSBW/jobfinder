# Infrastructure Agent Quick Reference

## Pre-Release Checklist

Before triggering any production release, you **MUST** verify localhost is stable:

```powershell
# 1. Start environment
.\scripts\infra-agent.ps1 up

# 2. Verify everything works
.\scripts\infra-agent.ps1 verify

# 3. If verification passes, you can proceed with release
# 4. If verification fails, review logs and fix issues
.\scripts\infra-agent.ps1 logs
```

## Daily Commands

```powershell
# Check if environment is running
.\scripts\infra-agent.ps1 status

# Start for development
.\scripts\infra-agent.ps1 up

# Stop when done
.\scripts\infra-agent.ps1 down

# Quick restart
.\scripts\infra-agent.ps1 restart
```

## Access Points (when running)

- Frontend: http://localhost:3000
- Universal Canvas: http://localhost:3000/canvas
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Troubleshooting

```powershell
# View live logs
.\scripts\infra-agent.ps1 logs

# Clean everything and start fresh
.\scripts\infra-agent.ps1 clean
.\scripts\infra-agent.ps1 up

# Check specific port
Get-NetTCPConnection -LocalPort 8000
```

## Environment Modes

```powershell
# Development (hot reload enabled)
.\scripts\infra-agent.ps1 up -Mode dev

# Production simulation (final verification)
.\scripts\infra-agent.ps1 up -Mode prod-sim
```

---

**Remember**: `verify` must pass before any production release! 🚀
