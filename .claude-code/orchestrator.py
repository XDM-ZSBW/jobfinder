"""
Orchestrator Agent for JobFinder Development
Monitors backend server, coordinates between agents, and manages development workflow.
"""
import os
import sys
import json
import time
import asyncio
import requests
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime
from enum import Enum


class AgentType(Enum):
    """Types of agents in the system."""
    WARP = "warp"
    CURSOR = "cursor"
    PIECES = "pieces"
    ORCHESTRATOR = "orchestrator"


class TaskPriority(Enum):
    """Task priority levels."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class OrchestratorAgent:
    """
    Main orchestrator that monitors backend server and coordinates between agents.
    Determines what prompts to send to different agents and manages the workflow.
    """
    
    def __init__(self, project_root: str = "E:\\JobFinder"):
        self.project_root = Path(project_root)
        self.backend_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:3000"
        self.backend_health_endpoint = f"{self.backend_url}/health"
        self.monitoring_interval = 5  # seconds
        self.is_running = False
        
        # Agent coordination
        self.active_agents = {
            AgentType.WARP: {"status": "active", "last_sync": None},
            AgentType.CURSOR: {"status": "idle", "last_sync": None},
            AgentType.PIECES: {"status": "active", "last_sync": None}
        }
        
        # Task queue
        self.task_queue: List[Dict[str, Any]] = []
        
        # State tracking - Backend
        self.backend_status = {
            "is_healthy": False,
            "last_check": None,
            "version": None,
            "consecutive_failures": 0
        }
        
        # State tracking - Frontend
        self.frontend_status = {
            "is_healthy": False,
            "last_check": None,
            "consecutive_failures": 0
        }
        
        # Session context
        self.session = {
            "start_time": datetime.utcnow().isoformat(),
            "project": "JobFinder",
            "activities": []
        }
    
    def check_backend_health(self) -> Dict[str, Any]:
        """Check if backend server is running and healthy."""
        try:
            response = requests.get(self.backend_health_endpoint, timeout=3)
            if response.status_code == 200:
                data = response.json()
                self.backend_status.update({
                    "is_healthy": True,
                    "last_check": datetime.utcnow().isoformat(),
                    "version": data.get("version", "unknown"),
                    "consecutive_failures": 0
                })
                return {"status": "healthy", "data": data}
            else:
                self._handle_backend_failure(f"HTTP {response.status_code}")
                return {"status": "unhealthy", "error": f"HTTP {response.status_code}"}
        
        except requests.exceptions.RequestException as e:
            self._handle_backend_failure(str(e))
            return {"status": "error", "error": str(e)}
    
    def check_frontend_health(self) -> Dict[str, Any]:
        """Check if frontend server is running and healthy."""
        try:
            response = requests.get(self.frontend_url, timeout=3)
            if response.status_code == 200:
                self.frontend_status.update({
                    "is_healthy": True,
                    "last_check": datetime.utcnow().isoformat(),
                    "consecutive_failures": 0
                })
                return {"status": "healthy"}
            else:
                self._handle_frontend_failure(f"HTTP {response.status_code}")
                return {"status": "unhealthy", "error": f"HTTP {response.status_code}"}
        
        except requests.exceptions.RequestException as e:
            self._handle_frontend_failure(str(e))
            return {"status": "error", "error": str(e)}
    
    def _handle_backend_failure(self, error: str):
        """Handle backend server failure."""
        self.backend_status["consecutive_failures"] += 1
        self.backend_status["is_healthy"] = False
        self.backend_status["last_check"] = datetime.utcnow().isoformat()
        
        # Create high-priority task for investigation
        if self.backend_status["consecutive_failures"] >= 3:
            self.create_task(
                agent=AgentType.WARP,
                priority=TaskPriority.CRITICAL,
                description="Backend server is down - investigate and restart",
                context={
                    "error": error,
                    "failures": self.backend_status["consecutive_failures"],
                    "suggested_actions": [
                        "Check if uvicorn process is running",
                        "Review backend logs for errors",
                        "Verify port 8000 is not blocked",
                        "Try restarting: python -m uvicorn backend.main:app --reload"
                    ]
                }
            )
    
    def _handle_frontend_failure(self, error: str):
        """Handle frontend server failure."""
        self.frontend_status["consecutive_failures"] += 1
        self.frontend_status["is_healthy"] = False
        self.frontend_status["last_check"] = datetime.utcnow().isoformat()
        
        # Create high-priority task for investigation
        if self.frontend_status["consecutive_failures"] >= 3:
            self.create_task(
                agent=AgentType.WARP,
                priority=TaskPriority.CRITICAL,
                description="Frontend server is down - investigate and restart",
                context={
                    "error": error,
                    "failures": self.frontend_status["consecutive_failures"],
                    "suggested_actions": [
                        "Check if Next.js dev server is running",
                        "Review frontend console for errors",
                        "Verify port 3000 is not blocked",
                        "Navigate to frontend directory: cd E:\\JobFinder\\frontend",
                        "Try restarting: npm run dev"
                    ]
                }
            )
    
    def create_task(
        self, 
        agent: AgentType, 
        priority: TaskPriority,
        description: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new task for an agent."""
        task = {
            "id": f"task_{len(self.task_queue)}_{int(time.time())}",
            "agent": agent.value,
            "priority": priority.value,
            "description": description,
            "context": context or {},
            "created_at": datetime.utcnow().isoformat(),
            "status": "queued"
        }
        
        self.task_queue.append(task)
        self._log_activity("task_created", task)
        return task
    
    def get_next_task(self, agent: AgentType) -> Optional[Dict[str, Any]]:
        """Get the next highest-priority task for a specific agent."""
        priority_order = [
            TaskPriority.CRITICAL,
            TaskPriority.HIGH,
            TaskPriority.MEDIUM,
            TaskPriority.LOW
        ]
        
        for priority in priority_order:
            for task in self.task_queue:
                if (task["agent"] == agent.value and 
                    task["priority"] == priority.value and
                    task["status"] == "queued"):
                    task["status"] = "in_progress"
                    return task
        
        return None
    
    def complete_task(self, task_id: str, result: Optional[Dict[str, Any]] = None):
        """Mark a task as completed."""
        for task in self.task_queue:
            if task["id"] == task_id:
                task["status"] = "completed"
                task["completed_at"] = datetime.utcnow().isoformat()
                task["result"] = result
                self._log_activity("task_completed", task)
                break
    
    def generate_warp_prompt(self, task: Dict[str, Any]) -> str:
        """Generate a prompt to send to Warp terminal agent."""
        prompt_parts = [
            f"**Priority: {task['priority'].upper()}**",
            f"\nTask: {task['description']}",
        ]
        
        if task.get("context"):
            prompt_parts.append("\n**Context:**")
            for key, value in task["context"].items():
                if isinstance(value, list):
                    prompt_parts.append(f"- {key}:")
                    for item in value:
                        prompt_parts.append(f"  - {item}")
                else:
                    prompt_parts.append(f"- {key}: {value}")
        
        return "\n".join(prompt_parts)
    
    def generate_cursor_prompt(self, task: Dict[str, Any]) -> str:
        """Generate a prompt to send to Cursor IDE agent."""
        return f"""
Task: {task['description']}
Priority: {task['priority']}

Context:
{json.dumps(task.get('context', {}), indent=2)}

Please review and implement the necessary code changes.
"""
    
    def sync_to_pieces(self, activity_type: str, data: Dict[str, Any]):
        """Sync activity to Pieces MCP."""
        sync_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "project": "JobFinder",
            "activity_type": activity_type,
            "orchestrator": True,
            "data": data
        }
        
        # In production, this would call Pieces MCP via subprocess
        # For now, log the sync operation
        print(f"\n📦 Syncing to Pieces: {activity_type}")
        if os.getenv("PIECES_DEBUG"):
            print(json.dumps(sync_data, indent=2))
        
        self.active_agents[AgentType.PIECES]["last_sync"] = datetime.utcnow().isoformat()
    
    def _log_activity(self, activity_type: str, data: Any):
        """Log an activity to session history."""
        activity = {
            "type": activity_type,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data
        }
        self.session["activities"].append(activity)
        
        # Sync to Pieces if significant activity
        if activity_type in ["task_created", "backend_error", "agent_coordinated"]:
            self.sync_to_pieces(activity_type, data)
    
    def coordinate_agents(self):
        """Coordinate between Warp, Cursor, and Pieces agents."""
        coordination = {
            "timestamp": datetime.utcnow().isoformat(),
            "backend_healthy": self.backend_status["is_healthy"],
            "frontend_healthy": self.frontend_status["is_healthy"],
            "pending_tasks": len([t for t in self.task_queue if t["status"] == "queued"]),
            "active_tasks": len([t for t in self.task_queue if t["status"] == "in_progress"]),
            "agent_status": self.active_agents
        }
        
        self._log_activity("agent_coordinated", coordination)
        return coordination
    
    def run_monitoring_cycle(self):
        """Run a single monitoring cycle."""
        print(f"\n🔄 Monitoring cycle at {datetime.utcnow().strftime('%H:%M:%S')}")
        
        # Check backend health
        backend_result = self.check_backend_health()
        if backend_result["status"] == "healthy":
            print(f"✅ Backend healthy - Version: {self.backend_status['version']}")
        else:
            print(f"❌ Backend error: {backend_result.get('error', 'Unknown')}")
        
        # Check frontend health
        frontend_result = self.check_frontend_health()
        if frontend_result["status"] == "healthy":
            print(f"✅ Frontend healthy")
        else:
            print(f"❌ Frontend error: {frontend_result.get('error', 'Unknown')}")
        
        # Coordinate agents
        coordination = self.coordinate_agents()
        print(f"📊 Tasks: {coordination['pending_tasks']} queued, {coordination['active_tasks']} active")
        
        # Process next task for Warp if available
        warp_task = self.get_next_task(AgentType.WARP)
        if warp_task:
            print(f"\n📋 New task for Warp:")
            print(self.generate_warp_prompt(warp_task))
    
    async def start_monitoring(self):
        """Start continuous monitoring of backend and frontend servers."""
        self.is_running = True
        print(f"🚀 Orchestrator started")
        print(f"📁 Project: {self.project_root}")
        print(f"🔙 Backend: {self.backend_url}")
        print(f"🌐 Frontend: {self.frontend_url}")
        print(f"⏱️  Check interval: {self.monitoring_interval}s")
        print("\nPress Ctrl+C to stop\n")
        
        try:
            while self.is_running:
                self.run_monitoring_cycle()
                await asyncio.sleep(self.monitoring_interval)
        
        except KeyboardInterrupt:
            print("\n\n⏹️  Orchestrator stopped")
            self.stop_monitoring()
    
    def stop_monitoring(self):
        """Stop monitoring and save session data."""
        self.is_running = False
        
        # Save session summary
        session_file = self.project_root / ".claude-code" / "orchestrator_session.json"
        with open(session_file, "w") as f:
            json.dump({
                "session": self.session,
                "backend_status": self.backend_status,
                "frontend_status": self.frontend_status,
                "tasks": self.task_queue,
                "ended_at": datetime.utcnow().isoformat()
            }, f, indent=2)
        
        print(f"💾 Session saved to {session_file}")
    
    def get_status_report(self) -> str:
        """Generate a comprehensive status report."""
        report_lines = [
            "=" * 60,
            "ORCHESTRATOR STATUS REPORT",
            "=" * 60,
            f"\n📊 Backend Status:",
            f"  - Healthy: {self.backend_status['is_healthy']}",
            f"  - Version: {self.backend_status.get('version', 'Unknown')}",
            f"  - Last Check: {self.backend_status.get('last_check', 'Never')}",
            f"  - Consecutive Failures: {self.backend_status['consecutive_failures']}",
            f"\n🖥️ Frontend Status:",
            f"  - Healthy: {self.frontend_status['is_healthy']}",
            f"  - Last Check: {self.frontend_status.get('last_check', 'Never')}",
            f"  - Consecutive Failures: {self.frontend_status['consecutive_failures']}",
            f"\n🤖 Agent Status:",
        ]
        
        for agent_type, status in self.active_agents.items():
            report_lines.append(f"  - {agent_type.value}: {status['status']}")
        
        report_lines.extend([
            f"\n📋 Tasks:",
            f"  - Total: {len(self.task_queue)}",
            f"  - Queued: {len([t for t in self.task_queue if t['status'] == 'queued'])}",
            f"  - In Progress: {len([t for t in self.task_queue if t['status'] == 'in_progress'])}",
            f"  - Completed: {len([t for t in self.task_queue if t['status'] == 'completed'])}",
            f"\n⏰ Session:",
            f"  - Start: {self.session['start_time']}",
            f"  - Activities: {len(self.session['activities'])}",
            "=" * 60
        ])
        
        return "\n".join(report_lines)


def main():
    """CLI interface for orchestrator agent."""
    import argparse
    
    parser = argparse.ArgumentParser(description="JobFinder Orchestrator Agent")
    parser.add_argument(
        "command",
        choices=["start", "status", "task", "stop"],
        help="Command to execute"
    )
    parser.add_argument("--interval", type=int, default=5, help="Monitoring interval in seconds")
    parser.add_argument("--task-desc", type=str, help="Task description for 'task' command")
    parser.add_argument("--agent", type=str, choices=["warp", "cursor", "pieces"], help="Target agent")
    parser.add_argument("--priority", type=str, choices=["critical", "high", "medium", "low"], default="medium")
    
    args = parser.parse_args()
    
    orchestrator = OrchestratorAgent()
    orchestrator.monitoring_interval = args.interval
    
    if args.command == "start":
        # Start continuous monitoring
        asyncio.run(orchestrator.start_monitoring())
    
    elif args.command == "status":
        # One-time status check
        orchestrator.check_backend_health()
        print(orchestrator.get_status_report())
    
    elif args.command == "task":
        # Create a new task
        if not args.task_desc or not args.agent:
            print("Error: --task-desc and --agent required for 'task' command")
            sys.exit(1)
        
        agent = AgentType(args.agent)
        priority = TaskPriority(args.priority)
        
        task = orchestrator.create_task(
            agent=agent,
            priority=priority,
            description=args.task_desc
        )
        
        print(f"✅ Task created: {task['id']}")
        print(f"Agent: {agent.value}")
        print(f"Priority: {priority.value}")
    
    elif args.command == "stop":
        orchestrator.stop_monitoring()


if __name__ == "__main__":
    main()
