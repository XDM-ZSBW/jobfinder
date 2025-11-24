# Linear Project Management - JobMatch.zip

**Project URL**: https://linear.app/xdmiq/project/jobmatchzip-mvp-launch-e8849b3a0a05

## Overview
Linear workspace setup complete for JobMatch AI (jobmatch.zip) project management.

## Team & Workspace
- **Team Name**: Xdmiq
- **Team ID**: `8964d84b-fac3-4b2f-b7c5-76051536d843`
- **Project**: JobMatch.zip - MVP Launch
- **Project ID**: `12ffcf34-1592-48f1-9f5a-10c298028d53`
- **Target Date**: 2025-12-31

## Labels Created
✅ Labels are now set up for better organization:

| Label | Color | Use Case |
|-------|-------|----------|
| Bug | 🔴 #EB5757 | Bug fixes and issues |
| Feature | 🟣 #BB87FC | New features and enhancements |
| Improvement | 🔵 #4EA7FC | Code improvements and refactoring |
| frontend | 🔵 #3B82F6 | Frontend/Next.js tasks |
| backend | 🟢 #10B981 | Backend/Node.js tasks |
| ai-matching | 🟠 #F59E0B | AI/matching engine work |
| devops | 🟣 #8B5CF6 | Infrastructure & deployment |
| security | 🔴 #EF4444 | Security-related tasks |

## Quick Actions via Warp MCP

### Create Issues
```bash
# Use Linear MCP tools in Warp
call_mcp_tool("create_issue", {
  "team": "Xdmiq",
  "title": "[Frontend] Your task title",
  "description": "Task description",
  "labels": ["frontend", "Feature"],
  "project": "JobMatch.zip - MVP Launch"
})
```

### List Issues
```bash
call_mcp_tool("list_issues", {
  "team": "Xdmiq",
  "limit": 20
})
```

### Update Issue
```bash
call_mcp_tool("update_issue", {
  "id": "<issue-id>",
  "state": "In Progress",
  "assignee": "me"
})
```

## Using Linear Web UI
1. **Access Project**: https://linear.app/xdmiq/project/jobmatchzip-mvp-launch-e8849b3a0a05
2. **Create Issues**: Click "New issue" or press `C`
3. **Quick Add**: Use keyboard shortcut `C` anywhere in Linear
4. **Filter**: Use labels to filter by area (frontend, backend, etc.)
5. **Board View**: Switch to board view for kanban-style management

## Workflow States
Your team has the standard Linear workflow:
1. **Backlog** - Ideas and future work
2. **Todo** - Ready to start
3. **In Progress** - Currently being worked on
4. **In Review** - Awaiting code review
5. **Done** - Completed

## Integration with GitHub
Linear can automatically:
- Close issues when PR is merged (use "Fixes JM-123" in PR description)
- Create branch names: `feature/JM-123-task-name`
- Link PRs to issues automatically

To enable:
1. Go to Settings → Integrations → GitHub
2. Connect your GitHub account
3. Select repositories to sync

## System Monitoring Alerts
✅ **SMS Alerts Configured**
- **Alert Phone**: +1-213-248-4250
- **Monitored Systems**:
  - Linear MCP API
  - PostgreSQL Database
  - Redis Cache
  - Elasticsearch
  - Ollama LLM
  - Frontend (jobmatch.zip)
  
- **Alert Conditions**:
  - 3 consecutive failures triggers alert
  - 5-minute cooldown between duplicate alerts
  - Recovery notifications sent automatically

### Monitoring Service Files
- **Monitor Code**: `backend/monitoring/system_monitor.py`
- **Workflows**: `warp-workflows/linear-project-management.yaml`

## Common Issue Templates

### Frontend Task
```
Title: [Frontend] Add user profile page
Description:
Create a new user profile page with:
- Profile picture upload
- Bio editing
- Skills display
- Settings panel

Technical Requirements:
- Use Next.js 14 App Router
- TailwindCSS for styling
- React Hook Form for forms
- Zod validation

Acceptance Criteria:
- [ ] Profile page accessible at /profile
- [ ] User can upload profile picture
- [ ] User can edit bio
- [ ] User can update skills
- [ ] Changes persist to database

Labels: frontend, Feature
Priority: High
```

### Backend Task
```
Title: [Backend] Implement job matching algorithm
Description:
Create AI-powered job matching algorithm

Technical Requirements:
- Use OpenAI API for embeddings
- Store vectors in PostgreSQL with pgvector
- Implement cosine similarity scoring
- Cache results in Redis

Acceptance Criteria:
- [ ] Generate embeddings for job descriptions
- [ ] Generate embeddings for candidate profiles
- [ ] Calculate match scores (0-100)
- [ ] Return top 10 matches
- [ ] < 500ms response time

Labels: backend, ai-matching, Feature
Priority: Urgent
```

### Bug Report
```
Title: [Bug] Login form validation not working
Description:
Email validation allows invalid formats

Steps to Reproduce:
1. Go to /auth
2. Enter "notanemail" in email field
3. Click "Sign In"
4. No validation error shown

Expected: Validation error "Invalid email format"
Actual: Form submits with invalid email

Environment:
- Browser: Chrome 120
- OS: Windows 11
- URL: https://jobmatch.zip/auth

Labels: frontend, Bug
Priority: High
```

## Best Practices
1. **Naming Convention**: Use `[Area] Title` format (e.g., `[Frontend] Fix login bug`)
2. **Link PRs**: Always link GitHub PRs to Linear issues
3. **Update Status**: Move issues through workflow as you progress
4. **Add Details**: Include technical requirements and acceptance criteria
5. **Use Labels**: Tag with area (frontend/backend) + type (Bug/Feature)
6. **Assign Yourself**: Claim issues you're working on
7. **Close When Done**: Mark issues as "Done" when deployed

## Keyboard Shortcuts
- `C` - Create new issue
- `K` - Command palette
- `P` - Quick jump to project
- `I` - Quick jump to issue
- `/` - Focus search
- `Esc` - Close dialogs

## Mobile Access
Download Linear mobile app:
- **iOS**: https://apps.apple.com/app/linear/id1541707790
- **Android**: https://play.google.com/store/apps/details?id=com.linear

## API Access
If you need programmatic access:
1. Get API key: https://linear.app/settings/api
2. Set environment variable: `LINEAR_API_KEY`
3. Use Warp workflows or GraphQL directly

## Next Steps
1. ✅ Project created
2. ✅ Labels configured
3. ✅ Monitoring alerts set up
4. 📝 Create initial issues for MVP features
5. 📝 Connect GitHub integration
6. 📝 Invite team members (if any)

## Support
- **Linear Docs**: https://linear.app/docs
- **API Docs**: https://developers.linear.app
- **Community**: https://linear.app/community

---

**Last Updated**: 2025-11-24
**Maintained by**: XDMIQ Development Team
