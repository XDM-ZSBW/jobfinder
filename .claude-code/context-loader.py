"""
Claude Code Context Loader
Loads project context for optimized prompt generation with credit-saving practices
"""
import json
import os
from pathlib import Path
from typing import Dict, List, Any, Union


def estimate_tokens(text: str) -> int:
    """Rough token estimation: ~4 characters per token."""
    return len(text) // 4


def load_file_with_limits(file_path: Path, lines: str = None, max_size_kb: int = None) -> str:
    """Load file with line range and size limits for credit saving."""
    if not file_path.exists():
        return ""
    
    # Check file size first
    file_size_kb = file_path.stat().st_size / 1024
    if max_size_kb and file_size_kb > max_size_kb:
        return f"[File too large: {file_size_kb:.1f}KB > {max_size_kb}KB limit - skipped]"
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Apply line range if specified
    if lines:
        try:
            if '-' in lines:
                start, end = map(int, lines.split('-'))
                lines_list = content.split('\n')
                # Convert to 0-based indexing
                start_idx = max(0, start - 1)
                end_idx = min(len(lines_list), end)
                content = '\n'.join(lines_list[start_idx:end_idx])
        except (ValueError, IndexError):
            pass  # If parsing fails, return full content
    
    return content


class ContextLoader:
    """Loads and provides project context for Claude Code with credit-saving optimizations."""
    
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root)
        self.hooks_file = self.project_root / ".claude-code" / "hooks.json"
        self.context_cache = {}
        self.credit_config = {}
    
    def load_hooks(self) -> Dict[str, Any]:
        """Load hooks configuration."""
        if self.hooks_file.exists():
            with open(self.hooks_file, 'r') as f:
                hooks = json.load(f)
                # Cache credit-saving config
                self.credit_config = hooks.get("credit_saving", {})
                return hooks
        return {}
    
    def get_project_context(self) -> Dict[str, Any]:
        """Get comprehensive project context."""
        hooks = self.load_hooks()
        
        return {
            "project_name": "AI-Enabled LLC Matching Platform",
            "tech_stack": hooks.get("context", {}).get("tech_stack", {}),
            "key_features": hooks.get("context", {}).get("key_features", []),
            "principles": hooks.get("context", {}).get("principles", []),
            "development_tools": ["Warp", "Claude Code", "Cursor"],
            "workflow": "Interactive business-side coding"
        }
    
    def get_relevant_files(self, feature_type: str) -> List[Union[str, Dict]]:
        """Get relevant example files for a feature type."""
        hooks = self.load_hooks()
        hook_config = hooks.get("hooks", {}).get(feature_type, {})
        return hook_config.get("example_files", [])
    
    def load_file_content(self, file_spec: Union[str, Dict]) -> str:
        """Load file content with credit-saving limits."""
        if isinstance(file_spec, str):
            # Legacy format: just a path
            file_path = self.project_root / file_spec
            return load_file_with_limits(file_path)
        elif isinstance(file_spec, dict):
            # New format: dict with path, lines, max_size_kb
            file_path = self.project_root / file_spec.get("path", "")
            lines = file_spec.get("lines")
            max_size_kb = file_spec.get("max_size_kb")
            return load_file_with_limits(file_path, lines, max_size_kb)
        return ""
    
    def build_prompt_context(self, task: str, feature_type: str = None) -> str:
        """Build optimized prompt context for a task with credit-saving practices."""
        # Check cache first
        cache_key = f"{feature_type}:{task}"
        if self.credit_config.get("cache_context") and cache_key in self.context_cache:
            return self.context_cache[cache_key]
        
        context = self.get_project_context()
        hooks = self.load_hooks()
        
        # Handle tech_stack string properly
        backend_stack = context['tech_stack'].get('backend', '')
        if isinstance(backend_stack, str):
            backend_tech = backend_stack
        else:
            backend_tech = ', '.join(backend_stack) if backend_stack else ''
        
        prompt_parts = [
            f"Project: {context['project_name']}",
            f"Tech Stack: {backend_tech}",
            "",
            "Key Principles:",
        ]
        
        for principle in context['principles']:
            prompt_parts.append(f"- {principle}")
        
        current_tokens = estimate_tokens('\n'.join(prompt_parts))
        max_tokens = self.credit_config.get("max_tokens_per_context", 8000)
        
        if feature_type and feature_type in hooks.get("hooks", {}):
            hook_config = hooks["hooks"][feature_type]
            hook_max_tokens = hook_config.get("max_context_tokens")
            if hook_max_tokens:
                max_tokens = min(max_tokens, hook_max_tokens)
            
            # Load prompt file if specified (preferred over inline template)
            if "prompt_file" in hook_config:
                prompt_file_path = self.project_root / hook_config["prompt_file"]
                if prompt_file_path.exists():
                    prompt_content = load_file_with_limits(
                        prompt_file_path,
                        max_size_kb=self.credit_config.get("max_file_size_kb", 100)
                    )
                    if estimate_tokens(prompt_content) + current_tokens < max_tokens:
                        prompt_parts.append("")
                        prompt_parts.append("=" * 60)
                        prompt_parts.append("PROMPT TEMPLATE:")
                        prompt_parts.append("=" * 60)
                        prompt_parts.append(prompt_content)
                        prompt_parts.append("=" * 60)
                        current_tokens = estimate_tokens('\n'.join(prompt_parts))
            
            # Fallback to inline template if no prompt_file or if prompt_file wasn't loaded
            if "template" in hook_config and ("prompt_file" not in hook_config or 
                                               not (self.project_root / hook_config["prompt_file"]).exists()):
                template = hook_config["template"]
                if estimate_tokens(template) + current_tokens < max_tokens:
                    prompt_parts.append("")
                    prompt_parts.append("Template:")
                    prompt_parts.append(template)
                    current_tokens = estimate_tokens('\n'.join(prompt_parts))
            
            # Load example files with limits
            if "example_files" in hook_config:
                prompt_parts.append("")
                prompt_parts.append("Reference Examples:")
                for file_spec in hook_config["example_files"]:
                    if current_tokens >= max_tokens * 0.9:  # Stop at 90% of limit
                        prompt_parts.append("[Additional files skipped due to token limit]")
                        break
                    
                    if isinstance(file_spec, dict):
                        file_path = file_spec.get("path", "")
                    else:
                        file_path = file_spec
                    
                    prompt_parts.append(f"- {file_path}")
                    
                    # Optionally include file content preview
                    if self.credit_config.get("selective_loading"):
                        file_content = self.load_file_content(file_spec)
                        if file_content and not file_content.startswith("[File too large"):
                            content_preview = file_content[:500]  # First 500 chars
                            if len(file_content) > 500:
                                content_preview += "\n[... truncated ...]"
                            if estimate_tokens(content_preview) + current_tokens < max_tokens:
                                prompt_parts.append(f"  Preview:\n{content_preview}")
                                current_tokens = estimate_tokens('\n'.join(prompt_parts))
        
        prompt_parts.append("")
        prompt_parts.append(f"Task: {task}")
        
        result = "\n".join(prompt_parts)
        
        # Cache result if caching enabled
        if self.credit_config.get("cache_context"):
            self.context_cache[cache_key] = result
        
        return result


def main():
    """CLI interface for context loading."""
    import sys
    import argparse
    
    parser = argparse.ArgumentParser(description="Load project context for Claude Code")
    parser.add_argument('--dry-run', action='store_true', help='Dry run mode without side effects')
    parser.add_argument('--print', action='store_true', dest='print_context', help='Print the context')
    parser.add_argument('--limit', type=int, default=None, help='Limit output lines')
    parser.add_argument('--hook', type=str, help='Hook type (e.g., api_endpoint, database_model)')
    parser.add_argument('--topic', type=str, help='Topic/feature type')
    parser.add_argument('--example', type=str, help='Show examples for a hook type')
    parser.add_argument('task', nargs='*', help='Task description')
    
    args = parser.parse_args()
    
    loader = ContextLoader()
    
    # Handle --example flag
    if args.example:
        hooks = loader.load_hooks()
        hook_config = hooks.get('hooks', {}).get(args.example, {})
        if hook_config:
            print(f"Hook: {args.example}")
            print(f"\nTemplate:\n{hook_config.get('template', 'N/A')}")
            print(f"\nExample Files:")
            for file_spec in hook_config.get('example_files', []):
                if isinstance(file_spec, dict):
                    file_path = file_spec.get("path", "")
                    lines = file_spec.get("lines", "")
                    max_size = file_spec.get("max_size_kb", "")
                    print(f"  - {file_path}" + (f" (lines: {lines}, max: {max_size}KB)" if lines or max_size else ""))
                else:
                    print(f"  - {file_spec}")
            if hook_config.get("max_context_tokens"):
                print(f"\nMax Context Tokens: {hook_config.get('max_context_tokens')}")
        else:
            print(f"Hook '{args.example}' not found")
            print(f"Available hooks: {', '.join(hooks.get('hooks', {}).keys())}")
        return
    
    # Handle --hook or task
    if args.hook or args.task:
        feature_type = args.hook or args.topic
        task = ' '.join(args.task) if args.task else 'General task'
        context = loader.build_prompt_context(task, feature_type)
        
        # Apply limit if specified
        if args.limit:
            lines = context.split('\n')[:args.limit]
            context = '\n'.join(lines)
        
        if args.dry_run:
            print("[DRY RUN MODE]")
        if args.print_context or not args.task:
            print(context)
    else:
        # Default: show project context as JSON
        context = loader.get_project_context()
        output = json.dumps(context, indent=2)
        
        if args.limit:
            lines = output.split('\n')[:args.limit]
            output = '\n'.join(lines)
        
        print(output)


if __name__ == "__main__":
    main()


