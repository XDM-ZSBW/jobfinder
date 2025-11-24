# Infrastructure Agent - Quick Start

## 🚀 Get Started in 30 Seconds

```powershell
# Start environment
.\scripts\infra-agent.ps1 up

# Wait for services to start (~1-2 minutes)...

# Verify everything works
.\scripts\infra-agent.ps1 verify
```

If verification passes ✓, your environment is ready!

## 📋 Pre-Production Release Checklist

**CRITICAL**: You cannot release to production until localhost is verified stable.

1. ✅ Start environment: `.\scripts\infra-agent.ps1 up`
2. ✅ Run verification: `.\scripts\infra-agent.ps1 verify`
3. ✅ Verify passes with exit code 0
4. ✅ Now you can proceed with production release

## 🎯 Most Common Commands

```powershell
# Check status anytime
.\scripts\infra-agent.ps1 status

# Stop when done
.\scripts\infra-agent.ps1 down

# View logs if something fails
.\scripts\infra-agent.ps1 logs

# Fresh restart
.\scripts\infra-agent.ps1 restart
```

## 🌐 Access Points

Once running:
- Frontend: http://localhost:3000
- Universal Canvas: http://localhost:3000/canvas
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 💡 Pro Tips

### Use Aliases for Shorter Commands

```powershell
# Load aliases once
. .\scripts\infra-aliases.ps1

# Now use shorter commands
infra-up
infra-status
infra-verify
infra-down
```

### Use Warp Workflows

Access the agent through Warp's workflow menu (Ctrl+Shift+R):
- Search for "Infrastructure Agent"
- Select command
- Run!

### Production Simulation Mode

For final pre-release verification:
```powershell
.\scripts\infra-agent.ps1 up -Mode prod-sim
.\scripts\infra-agent.ps1 verify
```

## 🔧 Troubleshooting

### Docker not running?
```powershell
# Start Docker Desktop first, then:
.\scripts\infra-agent.ps1 up
```

### Services won't start?
```powershell
# Clean and restart fresh
.\scripts\infra-agent.ps1 clean
.\scripts\infra-agent.ps1 up
```

### Verification fails?
```powershell
# Check logs for details
.\scripts\infra-agent.ps1 logs
```

### Port already in use?
```powershell
# Stop properly first
.\scripts\infra-agent.ps1 down

# Check what's using the port
Get-NetTCPConnection -LocalPort 8000
```

## 📚 Full Documentation

See [Infrastructure Agent Guide](docs/INFRA_AGENT.md) for complete documentation.

## 🎓 What It Does

The Infrastructure Agent:
- ✓ Starts all services (PostgreSQL, Redis, Elasticsearch, Backend, Frontend)
- ✓ Waits for health checks before declaring success
- ✓ Tracks state across terminal sessions
- ✓ Verifies everything works before production releases
- ✓ Provides comprehensive logs for debugging
- ✓ Handles graceful shutdown and cleanup

## 🚦 Exit Codes

- `0` = Success (ready for production)
- `1` = Failure (DO NOT release)

Use in CI/CD:
```powershell
.\scripts\infra-agent.ps1 verify
if ($LASTEXITCODE -eq 0) {
    # ✓ Green light for production
} else {
    # ✗ Block release
}
```

---

**Remember**: Always run `verify` before production releases! 🔒
