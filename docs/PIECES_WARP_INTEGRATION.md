# Pieces MCP Integration with Warp Terminal

## Overview

Pieces MCP automatically stays in sync with Warp terminal activities, providing context-aware AI assistance through Claude Code and Cursor.

## How It Works

### Automatic Sync

1. **Warp Terminal Activity** → Pieces MCP captures:
   - Commands executed
   - File access patterns
   - Project context
   - Workflow state

2. **Pieces MCP** → Stores context:
   - Long-term memory of development activities
   - Pattern recognition from Warp usage
   - Context for AI assistance

3. **Claude Code** → Uses Pieces context:
   - Enhanced prompts with Warp activity context
   - Better code suggestions based on workflow
   - Consistent with development patterns

## Configuration

### Warp Configuration

The `warp.config.yaml` includes Pieces sync settings:

```yaml
pieces_sync:
  enabled: true
  sync_commands: true
  sync_file_access: true
  sync_interval: 300  # 5 minutes

mcp_servers:
  - name: Pieces
    enabled: true
    sync_warp_activities: true
```

### Claude Code Hooks

Hooks automatically include Pieces MCP context:

```json
{
  "pieces_mcp_context": {
    "enabled": true,
    "sync_warp": true,
    "include_terminal_history": true,
    "include_file_access": true
  }
}
```

## Benefits

1. **Context Continuity**: Pieces maintains context across Warp sessions
2. **Better AI Assistance**: Claude Code has full context from Warp activities
3. **Workflow Awareness**: AI understands your development workflow
4. **Pattern Learning**: Pieces learns from Warp usage patterns

## Usage

### Automatic

Pieces MCP automatically syncs when:
- Commands are executed in Warp
- Files are accessed
- Project context changes
- Workflows are triggered

### Manual Sync

```bash
# Capture current context
python .claude-code/pieces-warp-sync.py context

# Sync specific command
python .claude-code/pieces-warp-sync.py command "npm run dev"

# Sync file access
python .claude-code/pieces-warp-sync.py file "backend/main.py" "edited"
```

## Integration Points

### Warp → Pieces

- Command execution → Stored in Pieces memory
- File operations → Tracked for context
- Project state → Maintained across sessions

### Pieces → Claude Code

- Context injection → Enhanced prompts
- Pattern matching → Better suggestions
- Workflow awareness → Accurate recommendations

### Cursor → Pieces

- File edits → Synced to Pieces
- Code changes → Context maintained
- Project state → Full visibility

## Querying Pieces Memory

Ask Pieces about Warp activities:

```
"What commands did I run in Warp today?"
"What files did I access in the last hour?"
"What was I working on yesterday?"
```

Pieces MCP provides context from Warp terminal activities for better AI assistance.

