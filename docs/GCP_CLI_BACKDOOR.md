# Google Cloud CLI Technical Backdoor

## Overview

**This is a documented platform feature, not a hidden backdoor.**

The Google Cloud CLI Technical Backdoor provides authorized administrators and technical staff with programmatic access to platform operations through Google Cloud CLI authentication.

## Purpose

- **Administrative Operations**: Perform system administration tasks
- **Monitoring & Debugging**: Access platform metrics and logs
- **Emergency Access**: Provide technical access when needed
- **Automation**: Enable automated operations via GCP CLI

## Authentication

### Prerequisites

1. **Google Cloud CLI installed**: `gcloud` command available
2. **GCP Account**: Google Cloud account with appropriate permissions
3. **Authorization**: Account must be in authorized list

### Setup

```bash
# Install Google Cloud CLI (if not installed)
# https://cloud.google.com/sdk/docs/install

# Authenticate with Google Cloud
gcloud auth login

# Set project (optional)
gcloud config set project YOUR_PROJECT_ID

# Verify authentication
gcloud auth list
```

### Verify Access

```bash
# Check if authenticated
curl http://localhost:8000/api/gcp-cli/verify

# Or use the API endpoint
GET /api/gcp-cli/verify
```

## Authorization

### Authorized Accounts

GCP accounts must be added to the authorized list in platform configuration:

```python
# In backend/auth/gcp_cli_auth.py
self.allowed_gcp_users = [
    "admin@yourdomain.com",
    "tech@yourdomain.com"
]

self.allowed_gcp_projects = [
    "your-gcp-project-id"
]
```

### Access Token

Get an access token for API operations:

```bash
# Get access token
curl http://localhost:8000/api/gcp-cli/access-token

# Use token in API requests
curl -H "X-GCP-CLI-Token: YOUR_TOKEN" http://localhost:8000/api/gcp-cli/execute
```

## Available Commands

### Status & Health

```bash
# Platform status
POST /api/gcp-cli/execute
{
  "command": "status"
}

# Health check
POST /api/gcp-cli/execute
{
  "command": "health"
}

# Platform metrics
POST /api/gcp-cli/execute
{
  "command": "metrics"
}
```

### Data Operations

```bash
# Get user count
POST /api/gcp-cli/execute
{
  "command": "users"
}

# Get assessment count
POST /api/gcp-cli/execute
{
  "command": "assessments"
}

# Get match count
POST /api/gcp-cli/execute
{
  "command": "matches"
}
```

### Logs

```bash
# Get recent logs
POST /api/gcp-cli/execute
{
  "command": "logs",
  "parameters": {
    "limit": 100
  }
}
```

## Security Features

### Whitelist Approach

Only pre-approved commands are allowed:
- `status` - Platform status
- `health` - Health checks
- `metrics` - Platform metrics
- `logs` - Log retrieval
- `users` - User statistics
- `assessments` - Assessment statistics
- `matches` - Match statistics

### Audit Logging

All CLI operations are logged:
- GCP account used
- Command executed
- Timestamp
- Session ID
- Parameters

### Session Management

- Sessions expire after 1 hour
- Each operation creates a session
- Sessions are tracked for audit

### Identity Verification

- Requires active GCP CLI authentication
- Verifies GCP account identity
- Checks project authorization (if configured)

## Usage Examples

### Python Script

```python
import subprocess
import requests

# Verify GCP CLI is authenticated
result = subprocess.run(
    ["gcloud", "config", "get-value", "account"],
    capture_output=True, text=True
)
gcp_account = result.stdout.strip()

# Get access token
response = requests.get("http://localhost:8000/api/gcp-cli/access-token")
token = response.json()["access_token"]

# Execute command
response = requests.post(
    "http://localhost:8000/api/gcp-cli/execute",
    headers={"X-GCP-CLI-Token": token},
    json={"command": "status"}
)
print(response.json())
```

### Bash Script

```bash
#!/bin/bash

# Verify GCP CLI
gcloud auth list --filter=status:ACTIVE

# Get access token
TOKEN=$(curl -s http://localhost:8000/api/gcp-cli/access-token | jq -r '.access_token')

# Execute command
curl -X POST http://localhost:8000/api/gcp-cli/execute \
  -H "X-GCP-CLI-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"command": "health"}'
```

## API Endpoints

### GET /api/gcp-cli/verify
Verify GCP CLI authentication status.

### POST /api/gcp-cli/execute
Execute CLI command (requires authentication and authorization).

### GET /api/gcp-cli/access-token
Get API access token for programmatic access.

### GET /api/gcp-cli/info
Get information about the CLI backdoor feature.

## Configuration

### Environment Variables

```bash
# GCP CLI settings (optional)
GCP_CLI_ENABLED=true
GCP_ALLOWED_USERS=admin@domain.com,tech@domain.com
GCP_ALLOWED_PROJECTS=project-id-1,project-id-2
```

### Code Configuration

Edit `backend/auth/gcp_cli_auth.py` to configure:
- Allowed GCP users
- Allowed GCP projects
- Command whitelist
- Session expiration

## Best Practices

1. **Use Least Privilege**: Only authorize necessary accounts
2. **Monitor Usage**: Review audit logs regularly
3. **Rotate Access**: Periodically review authorized accounts
4. **Document Operations**: Document all CLI operations
5. **Secure Tokens**: Store tokens securely, don't commit to git

## Troubleshooting

### "GCP CLI not authenticated"
- Run `gcloud auth login`
- Verify with `gcloud auth list`

### "Not authorized"
- Check if account is in allowed list
- Verify GCP project (if required)

### "Command not allowed"
- Check command whitelist
- Use only approved commands

## Security Considerations

- **This is a backdoor**: Use with caution
- **Audit all access**: All operations are logged
- **Limit access**: Only authorize trusted accounts
- **Monitor usage**: Review logs regularly
- **Document changes**: Document all configuration changes

## Support

For issues with GCP CLI access:
1. Check GCP CLI authentication: `gcloud auth list`
2. Verify authorization in configuration
3. Review audit logs
4. Contact platform administrators

---

**Note**: This is a documented feature, not a security vulnerability. It is designed for legitimate administrative access and is fully audited.

