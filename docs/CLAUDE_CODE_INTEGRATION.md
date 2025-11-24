# Claude Code Integration Guide

## Overview

This project uses **Claude Code** with optimized hooks for prompt architecture. The hooks system ensures consistent, context-aware code generation.

## Setup

1. **Install Claude Code** (if not already installed)
2. **Configure hooks**: Hooks are in `.claude-code/hooks.json`
3. **Use context loader**: Run `python .claude-code/context-loader.py` for context

## Using Hooks

### Before Coding

Run the context loader to get optimized prompts:

```bash
python .claude-code/context-loader.py api_endpoint "Create user profile endpoint"
```

### During Development

Claude Code will automatically:
- Load project context
- Reference example files
- Apply coding patterns
- Maintain consistency

### Hook Types

1. **before_generate**: Provides context before any code generation
2. **api_endpoint**: Optimized for FastAPI endpoints
3. **database_model**: Optimized for SQLAlchemy models
4. **frontend_component**: Optimized for Next.js components
5. **ai_integration**: Optimized for AI feature development

## Prompt Optimization

### Key Strategies

1. **Context Injection**: Hooks automatically inject project context
2. **Pattern Matching**: Reference existing code patterns
3. **Consistency**: Maintain coding standards
4. **Business Focus**: Prioritize business requirements

### Example Usage

**Without Hooks:**
```
Create an API endpoint for user profiles
```

**With Hooks:**
```
[Context loaded from hooks.json]
Create a FastAPI endpoint for user profiles that:
- Follows existing patterns in backend/api/
- Uses Pydantic models for validation
- Maintains anonymous identity
- Includes error handling
- References backend/api/auth.py for patterns
```

## Development Workflow

1. **Open Cursor** for IDE features
2. **Use Warp** for terminal operations
3. **Leverage Claude Code** hooks for AI assistance
4. **Iterate interactively** using all three tools

## Best Practices

1. Always use hooks before generating code
2. Reference example files when available
3. Maintain consistency with existing patterns
4. Focus on business requirements
5. Consider scalability implications

## Troubleshooting

If hooks aren't working:
1. Check `.claude-code/hooks.json` exists
2. Verify Claude Code is configured
3. Run context loader manually
4. Check Cursor settings for Claude Code integration


