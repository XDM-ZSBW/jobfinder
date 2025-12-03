#!/usr/bin/env python3
"""
Comprehensive Agent Execution and Codebase Indexing Script
Runs all agents from E:\agents across E:\zip-jobmatch project
Indexes codebase and scans external context from E:\
"""

import os
import sys
import json
import subprocess
import yaml
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging

# Windows-specific flag for hiding console windows
if sys.platform == "win32":
    # CREATE_NO_WINDOW constant (0x08000000) - prevents window creation on Windows
    CREATE_NO_WINDOW = 0x08000000
    # Create STARTUPINFO to hide windows
    STARTUPINFO = subprocess.STARTUPINFO()
    STARTUPINFO.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    STARTUPINFO.wShowWindow = subprocess.SW_HIDE
else:
    CREATE_NO_WINDOW = 0
    STARTUPINFO = None

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Paths
PROJECT_PATH = Path("E:/zip-jobmatch")
AGENTS_PATH = Path("E:/agents")
EXTERNAL_SCAN_PATH = Path("E:/")
OUTPUT_DIR = PROJECT_PATH / "agent-index-output"

def ensure_output_dir():
    """Ensure output directory exists"""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    return OUTPUT_DIR

def index_codebase(project_path: Path, output_dir: Path) -> Dict[str, Any]:
    """Index the codebase structure and files"""
    logger.info("=== Indexing Codebase ===")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    index_file = output_dir / f"codebase-index-{timestamp}.json"
    
    index = {
        "timestamp": datetime.now().isoformat(),
        "project_path": str(project_path),
        "files": [],
        "structure": {},
        "languages": {},
        "dependencies": {}
    }
    
    # Exclude directories
    exclude_dirs = {'node_modules', '__pycache__', '.git', 'dist', 'build', '.next', 'venv', '.venv', 'env', 'logs'}
    include_extensions = {'.py', '.ts', '.tsx', '.js', '.jsx', '.json', '.yaml', '.yml', '.md', '.sql', '.ps1', '.sh', '.toml'}
    
    logger.info("Scanning project structure...")
    
    files_scanned = 0
    for root, dirs, files in os.walk(project_path):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
        
        for file in files:
            file_path = Path(root) / file
            relative_path = file_path.relative_to(project_path)
            
            # Skip if extension not in include list
            if file_path.suffix not in include_extensions:
                continue
            
            # Skip if in excluded directory
            if any(excluded in str(relative_path) for excluded in exclude_dirs):
                continue
            
            extension = file_path.suffix
            if extension not in index["languages"]:
                index["languages"][extension] = 0
            index["languages"][extension] += 1
            
            # Get file info
            try:
                stat = file_path.stat()
                file_info = {
                    "path": str(relative_path),
                    "full_path": str(file_path),
                    "extension": extension,
                    "size": stat.st_size,
                    "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
                }
                
                # Get line count
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        file_info["lines"] = len(f.readlines())
                except:
                    file_info["lines"] = 0
                
                index["files"].append(file_info)
                files_scanned += 1
                
            except Exception as e:
                logger.debug(f"Error processing {file_path}: {e}")
    
    logger.info(f"Found {files_scanned} files to index")
    
    # Scan dependencies
    logger.info("Scanning dependencies...")
    
    # Python dependencies
    requirements_txt = project_path / "requirements.txt"
    if requirements_txt.exists():
        index["dependencies"]["python"] = []
        try:
            with open(requirements_txt, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        # Parse package name (handle version specifiers)
                        package = line.split('==')[0].split('>=')[0].split('<=')[0].split('~=')[0].strip()
                        if package:
                            index["dependencies"]["python"].append(package)
        except Exception as e:
            logger.warning(f"Error reading requirements.txt: {e}")
    
    # Node.js dependencies
    package_json = project_path / "package.json"
    if package_json.exists():
        try:
            with open(package_json, 'r') as f:
                package_data = json.load(f)
                index["dependencies"]["node"] = {
                    "dependencies": list(package_data.get("dependencies", {}).keys()),
                    "devDependencies": list(package_data.get("devDependencies", {}).keys())
                }
        except Exception as e:
            logger.warning(f"Error reading package.json: {e}")
    
    # Save index
    with open(index_file, 'w') as f:
        json.dump(index, f, indent=2)
    logger.info(f"Codebase index saved to: {index_file}")
    
    # Generate summary
    summary_file = output_dir / f"codebase-summary-{timestamp}.md"
    with open(summary_file, 'w') as f:
        f.write(f"# Codebase Index Summary\n\n")
        f.write(f"Generated: {index['timestamp']}\n\n")
        f.write(f"## Project Structure\n\n")
        f.write(f"- **Total Files**: {len(index['files'])}\n")
        f.write(f"- **Languages**: {len(index['languages'])}\n\n")
        f.write(f"## File Types\n\n")
        
        for ext, count in sorted(index["languages"].items(), key=lambda x: x[1], reverse=True):
            f.write(f"- {ext}: {count} files\n")
        
        f.write(f"\n## Dependencies\n\n")
        
        if index["dependencies"].get("python"):
            f.write(f"### Python ({len(index['dependencies']['python'])} packages)\n\n")
            for pkg in sorted(index["dependencies"]["python"]):
                f.write(f"- {pkg}\n")
            f.write("\n")
        
        if index["dependencies"].get("node"):
            node_deps = index["dependencies"]["node"]
            if node_deps.get("dependencies"):
                f.write(f"### Node.js Dependencies ({len(node_deps['dependencies'])})\n\n")
                for dep in sorted(node_deps["dependencies"]):
                    f.write(f"- {dep}\n")
                f.write("\n")
            if node_deps.get("devDependencies"):
                f.write(f"### Node.js Dev Dependencies ({len(node_deps['devDependencies'])})\n\n")
                for dep in sorted(node_deps["devDependencies"]):
                    f.write(f"- {dep}\n")
                f.write("\n")
    
    logger.info(f"Summary saved to: {summary_file}")
    
    return index

def scan_external_context(scan_path: Path, output_dir: Path) -> Dict[str, Any]:
    """Scan external directories for projects and codebases"""
    logger.info("=== Scanning External Context ===")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    scan_file = output_dir / f"external-context-{timestamp}.json"
    
    context = {
        "timestamp": datetime.now().isoformat(),
        "scan_path": str(scan_path),
        "projects": [],
        "codebases": []
    }
    
    logger.info(f"Scanning {scan_path} for projects and codebases...")
    
    # Use project_discovery.py if available
    try:
        sys.path.insert(0, str(AGENTS_PATH / "runtime"))
        from project_discovery import get_project_discovery
        
        discovery = get_project_discovery([str(scan_path)])
        projects = discovery.discover_projects(force_refresh=True, max_depth=3)
        
        logger.info(f"Discovered {len(projects)} projects")
        
        for project_path, project_info in projects.items():
            context["projects"].append({
                "path": project_path,
                "name": project_info.get("name", ""),
                "type": project_info.get("type", "unknown"),
                "has_git": project_info.get("has_git", False),
                "has_cursor": project_info.get("has_cursor", False),
                "has_agents": project_info.get("has_agents", False)
            })
    except Exception as e:
        logger.warning(f"Error in project discovery: {e}")
        logger.info("Falling back to manual scanning...")
    
    # Manual codebase scanning
    codebase_indicators = {
        'package.json': 'node',
        'requirements.txt': 'python',
        'pyproject.toml': 'python',
        'Cargo.toml': 'rust',
        'pom.xml': 'java',
        '.git': 'git'
    }
    
    try:
        if scan_path.exists() and scan_path.is_dir():
            for item in scan_path.iterdir():
                if not item.is_dir() or item.name.startswith('.'):
                    continue
                
                # Check for codebase indicators
                codebase_type = None
                for indicator, ctype in codebase_indicators.items():
                    if (item / indicator).exists():
                        codebase_type = ctype
                        break
                
                if codebase_type:
                    context["codebases"].append({
                        "path": str(item),
                        "name": item.name,
                        "type": codebase_type
                    })
        
        logger.info(f"Found {len(context['codebases'])} codebases")
    except Exception as e:
        logger.error(f"Error scanning codebases: {e}")
    
    # Save context
    with open(scan_file, 'w') as f:
        json.dump(context, f, indent=2)
    logger.info(f"External context saved to: {scan_file}")
    
    return context

def load_agent_config(agent_path: Path) -> Optional[Dict[str, Any]]:
    """Load agent configuration from agent.yaml"""
    agent_yaml = agent_path / "agent.yaml"
    if not agent_yaml.exists():
        return None
    
    try:
        with open(agent_yaml, 'r', encoding='utf-8', errors='replace') as f:
            return yaml.safe_load(f)
    except Exception as e:
        logger.warning(f"Error loading {agent_yaml}: {e}")
        return None

def invoke_agent_command(agent_name: str, command: str, agent_path: Path, project_path: Path) -> bool:
    """Execute an agent command"""
    logger.info(f"Executing {agent_name}.{command}")
    
    config = load_agent_config(agent_path)
    if not config:
        logger.debug(f"  No agent.yaml found, skipping")
        return False
    
    # Check if enabled
    if config.get("config", {}).get("enabled", True) == False:
        logger.debug(f"  Agent is disabled, skipping")
        return False
    
    # Get command definition
    commands = config.get("commands", {})
    if command not in commands:
        logger.debug(f"  Command '{command}' not found")
        return False
    
    command_def = commands[command]
    
    # Extract script
    script = None
    if isinstance(command_def, str):
        script = command_def
    elif isinstance(command_def, dict):
        script = command_def.get("script") or command_def.get("cursor_cli")
    
    if not script:
        logger.debug(f"  No script found for command")
        return False
    
    # Replace paths
    script = script.replace("E:\\zip-jobmatch", str(project_path))
    script = script.replace("E:\\agents", str(AGENTS_PATH))
    
    logger.debug(f"  Running: {script}")
    
    try:
        # Execute script
        if script.startswith("python"):
            # Python script
            parts = script.split(" ", 1)
            if len(parts) > 1:
                result = subprocess.run(
                    ["python"] + parts[1].split(),
                    cwd=agent_path,
                    capture_output=True,
                    text=True,
                    timeout=300,
                    encoding='utf-8',
                    errors='replace',
                    creationflags=CREATE_NO_WINDOW if sys.platform == "win32" else 0,
                    startupinfo=STARTUPINFO if sys.platform == "win32" else None
                )
            else:
                result = subprocess.run(
                    ["python", script],
                    cwd=agent_path,
                    capture_output=True,
                    text=True,
                    timeout=300,
                    encoding='utf-8',
                    errors='replace',
                    creationflags=CREATE_NO_WINDOW if sys.platform == "win32" else 0,
                    startupinfo=STARTUPINFO if sys.platform == "win32" else None
                )
        elif script.startswith("pwsh") or script.startswith("powershell") or "Write-Host" in script or "Write-Output" in script:
            # PowerShell script - detect PowerShell commands
            parts = script.split(" ", 1)
            if len(parts) > 1 and parts[1].endswith(".ps1"):
                # PowerShell file - hide window on Windows
                result = subprocess.run(
                    ["pwsh", "-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-File", parts[1]],
                    cwd=agent_path,
                    capture_output=True,
                    text=True,
                    timeout=300,
                    encoding='utf-8',
                    errors='replace',
                    creationflags=CREATE_NO_WINDOW if sys.platform == "win32" else 0,
                    startupinfo=STARTUPINFO if sys.platform == "win32" else None
                )
            else:
                # PowerShell command - hide window on Windows
                cmd = parts[1] if len(parts) > 1 else script
                result = subprocess.run(
                    ["pwsh", "-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", cmd],
                    cwd=agent_path,
                    capture_output=True,
                    text=True,
                    timeout=300,
                    encoding='utf-8',
                    errors='replace',
                    creationflags=CREATE_NO_WINDOW if sys.platform == "win32" else 0,
                    startupinfo=STARTUPINFO if sys.platform == "win32" else None
                )
        else:
            # Generic command - try PowerShell first if it looks like PowerShell
            if "Write-Host" in script or "Write-Output" in script or script.endswith(".ps1"):
                result = subprocess.run(
                    ["pwsh", "-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", script],
                    cwd=agent_path,
                    capture_output=True,
                    text=True,
                    timeout=300,
                    encoding='utf-8',
                    errors='replace',
                    creationflags=CREATE_NO_WINDOW if sys.platform == "win32" else 0,
                    startupinfo=STARTUPINFO if sys.platform == "win32" else None
                )
            else:
                # Generic shell command - use cmd.exe on Windows with hidden window
                if sys.platform == "win32":
                    # On Windows, use cmd.exe explicitly with /c to avoid PowerShell windows
                    result = subprocess.run(
                        ["cmd.exe", "/c", script],
                        cwd=agent_path,
                        capture_output=True,
                        text=True,
                        timeout=300,
                        encoding='utf-8',
                        errors='replace',
                        creationflags=CREATE_NO_WINDOW,
                        startupinfo=STARTUPINFO
                    )
                else:
                    # On Unix-like systems, use shell normally
                    result = subprocess.run(
                        script,
                        shell=True,
                        cwd=agent_path,
                        capture_output=True,
                        text=True,
                        timeout=300,
                        encoding='utf-8',
                        errors='replace'
                    )
        
        if result.returncode == 0:
            logger.info(f"  ✓ {agent_name}.{command} completed successfully")
            if result.stdout:
                for line in result.stdout.strip().split('\n')[:10]:  # Limit output
                    logger.debug(f"    {line}")
            return True
        else:
            logger.error(f"  ✗ {agent_name}.{command} failed (exit code: {result.returncode})")
            if result.stderr:
                for line in result.stderr.strip().split('\n')[:10]:
                    logger.error(f"    {line}")
            return False
            
    except subprocess.TimeoutExpired:
        logger.error(f"  ✗ {agent_name}.{command} timed out")
        return False
    except Exception as e:
        logger.error(f"  ✗ Error executing {agent_name}.{command}: {e}")
        return False

def run_all_agents(agents_path: Path, project_path: Path, output_dir: Path) -> Dict[str, Any]:
    """Run all agents across the project"""
    logger.info("=== Running All Agents ===")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    agent_results = {
        "timestamp": datetime.now().isoformat(),
        "agents_run": [],
        "summary": {
            "total": 0,
            "successful": 0,
            "failed": 0,
            "skipped": 0
        }
    }
    
    # Load agent registry
    registry_path = project_path / ".cursor" / "agents" / "agents-registry.json"
    if registry_path.exists():
        try:
            with open(registry_path, 'r') as f:
                registry = json.load(f)
            logger.info(f"Loaded agent registry with {len(registry.get('agents', []))} agents")
        except Exception as e:
            logger.error(f"Error loading registry: {e}")
            registry = {"agents": []}
    else:
        logger.warning("Agent registry not found, scanning agents directory")
        registry = {"agents": []}
        
        # Scan for agents manually
        for agent_dir in agents_path.iterdir():
            if agent_dir.is_dir() and (agent_dir / "agent.yaml").exists():
                registry["agents"].append({
                    "id": agent_dir.name,
                    "name": agent_dir.name,
                    "enabled": True
                })
    
    # Run each agent
    for agent in registry.get("agents", []):
        if not agent.get("enabled", True):
            logger.info(f"Skipping disabled agent: {agent['id']}")
            agent_results["summary"]["skipped"] += 1
            continue
        
        agent_results["summary"]["total"] += 1
        agent_path = agents_path / agent["id"]
        
        if not agent_path.exists():
            logger.error(f"Agent path not found: {agent_path}")
            agent_results["agents_run"].append({
                "agent": agent["id"],
                "status": "not_found",
                "commands_run": []
            })
            agent_results["summary"]["failed"] += 1
            continue
        
        logger.info(f"Processing agent: {agent['id']}")
        
        agent_result = {
            "agent": agent["id"],
            "status": "running",
            "commands_run": []
        }
        
        # Determine commands to run based on agent category
        category = agent.get("category", "")
        commands_to_run = []
        
        if category == "c-suite":
            commands_to_run = ["status", "review", "assess"]
        elif category == "development":
            commands_to_run = ["review", "analyze", "status"]
        elif category == "project-management":
            commands_to_run = ["status", "scan_repos", "work"]
        elif category == "operations":
            commands_to_run = ["status", "healthcheck", "assess"]
        elif category == "specialized":
            commands_to_run = ["status", "record", "validate"]
        else:
            commands_to_run = ["status"]
        
        # Check what commands are actually available
        config = load_agent_config(agent_path)
        if config:
            available_commands = list(config.get("commands", {}).keys())
            # Filter to only available commands
            commands_to_run = [cmd for cmd in commands_to_run if cmd in available_commands]
            # If no matches, try first available command
            if not commands_to_run and available_commands:
                commands_to_run = [available_commands[0]]
        
        success_count = 0
        for command in commands_to_run:
            success = invoke_agent_command(
                agent["id"],
                command,
                agent_path,
                project_path
            )
            agent_result["commands_run"].append({
                "command": command,
                "success": success
            })
            if success:
                success_count += 1
        
        if success_count > 0:
            agent_result["status"] = "success"
            agent_results["summary"]["successful"] += 1
        else:
            agent_result["status"] = "failed"
            agent_results["summary"]["failed"] += 1
        
        agent_results["agents_run"].append(agent_result)
    
    # Save results
    results_file = output_dir / f"agent-results-{timestamp}.json"
    with open(results_file, 'w') as f:
        json.dump(agent_results, f, indent=2)
    logger.info(f"Agent results saved to: {results_file}")
    
    # Print summary
    logger.info("=== Agent Execution Summary ===")
    logger.info(f"Total: {agent_results['summary']['total']}")
    logger.info(f"Successful: {agent_results['summary']['successful']}")
    logger.info(f"Failed: {agent_results['summary']['failed']}")
    logger.info(f"Skipped: {agent_results['summary']['skipped']}")
    
    return agent_results

def main():
    """Main execution"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Run all agents and index codebase")
    parser.add_argument("--project-path", default=str(PROJECT_PATH), help="Project path")
    parser.add_argument("--agents-path", default=str(AGENTS_PATH), help="Agents path")
    parser.add_argument("--external-scan-path", default=str(EXTERNAL_SCAN_PATH), help="External scan path")
    parser.add_argument("--index-only", action="store_true", help="Only index codebase")
    parser.add_argument("--scan-only", action="store_true", help="Only scan external context")
    
    args = parser.parse_args()
    
    project_path = Path(args.project_path)
    agents_path = Path(args.agents_path)
    external_scan_path = Path(args.external_scan_path)
    
    output_dir = ensure_output_dir()
    
    logger.info("=" * 60)
    logger.info("Comprehensive Agent Execution & Indexing")
    logger.info("=" * 60)
    logger.info(f"Project: {project_path}")
    logger.info(f"Agents: {agents_path}")
    logger.info(f"External Scan: {external_scan_path}")
    logger.info("")
    
    try:
        # Step 1: Index codebase
        if not args.scan_only:
            codebase_index = index_codebase(project_path, output_dir)
        
        # Step 2: Scan external context
        if not args.index_only:
            external_context = scan_external_context(external_scan_path, output_dir)
        
        # Step 3: Run all agents
        if not args.index_only and not args.scan_only:
            agent_results = run_all_agents(agents_path, project_path, output_dir)
        
        logger.info("=== Complete ===")
        logger.info(f"Output directory: {output_dir}")
        
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()

