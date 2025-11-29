# Agent Sync Guide

## Overview

Agents from `E:\agents\groups\` have been converted to YAML format and integrated with Cursor. Each agent now exists in three formats that must be kept in sync:

1. **Python file** (`*.py`) - The actual implementation
2. **YAML config** (`*.yaml`) - Agent configuration and metadata
3. **Cursor JSON** (`*.json`) - Cursor-specific agent configuration

## Agent Files Structure

For each Python-based agent, there are now three files:

```
E:\agents\groups\{category}\{agent-name}.py      # Python implementation
E:\agents\groups\{category}\{agent-name}.yaml     # YAML configuration
E:\zip-jobmatch\.cursor\agents\{agent-name}.json  # Cursor configuration
```

## Sync Rules

### When Modifying Python Files

If you change the Python implementation:

1. **Update YAML** - Reflect changes in:
   - New methods → Add to `commands` section
   - Changed parameters → Update command parameters
   - New config → Add to `config` section
   - New dependencies → Add to `dependencies`

2. **Update Cursor JSON** - Reflect changes in:
   - New capabilities → Add to `capabilities` array
   - New commands → Add to `commands` object
   - Changed script paths → Update `script` paths
   - New integrations → Add to `integrations` array

### When Modifying YAML Files

If you change the YAML configuration:

1. **Update Python** - Ensure Python code matches:
   - Commands listed in YAML exist in Python
   - Parameters match method signatures
   - Config values match Python constants

2. **Update Cursor JSON** - Sync:
   - Commands and their descriptions
   - Config values
   - Integration points

### When Modifying Cursor JSON

If you change the Cursor JSON:

1. **Update YAML** - Keep YAML in sync:
   - Command descriptions
   - Config values
   - Integration definitions

2. **Verify Python** - Ensure Python implementation supports:
   - Commands listed in JSON
   - Config values used

## Sync Checklist

When making changes to any agent, verify:

- [ ] Python file has all methods referenced in YAML/JSON
- [ ] YAML file has all commands from Python
- [ ] Cursor JSON has all commands from YAML
- [ ] Config values match across all three files
- [ ] Integration points are consistent
- [ ] Script paths are correct
- [ ] Dependencies are listed in all relevant files

## Agent Locations

### C-Suite Agents (groups/c-suite/)
- `branding-agent` - Python, YAML, Cursor JSON
- `copy-review-agent` - Python, YAML, Cursor JSON
- `i18n-agent` - Python, YAML, Cursor JSON

### Engineers Agents (groups/engineers/)
- `precheck-agent` - Python, YAML, Cursor JSON
- `uat-agent` - Python, YAML, Cursor JSON

### Security Agents (groups/security/)
- `crypto-agent` - Python, YAML, Cursor JSON
- `threat-model-agent` - Python, YAML, Cursor JSON

### Servers Agents (groups/servers/)
- `alert-agent` - Python, YAML, Cursor JSON

## Quick Sync Commands

### Verify All Agents Are Synced

```powershell
# Check all Python files have corresponding YAML
Get-ChildItem E:\agents\groups\*\*.py | ForEach-Object {
    $yaml = $_.FullName -replace '\.py$', '.yaml'
    $json = "E:\zip-jobmatch\.cursor\agents\$($_.BaseName).json"
    
    Write-Host "$($_.Name):"
    Write-Host "  Python: $(Test-Path $_.FullName)"
    Write-Host "  YAML: $(Test-Path $yaml)"
    Write-Host "  JSON: $(Test-Path $json)"
}
```

### Find Agents Missing YAML

```powershell
Get-ChildItem E:\agents\groups\*\*.py | Where-Object {
    -not (Test-Path ($_.FullName -replace '\.py$', '.yaml'))
} | Select-Object Name
```

## Best Practices

1. **Always update all three files** when making changes
2. **Test Python first** - Ensure functionality works
3. **Update YAML second** - Document the changes
4. **Update Cursor JSON last** - Make it available in Cursor
5. **Verify registry** - Ensure `agents-registry.json` is updated
6. **Test in Cursor** - Verify agent works with `@agent-name` syntax

## Sync Metadata

Each Cursor JSON file includes a `sync` section that lists all related files:

```json
"sync": {
  "python_file": "E:\\agents\\groups\\c-suite\\branding-agent.py",
  "yaml_file": "E:\\agents\\groups\\c-suite\\branding-agent.yaml",
  "cursor_config": "E:\\zip-jobmatch\\.cursor\\agents\\branding-agent.json"
}
```

Use this to quickly locate all related files for an agent.




