"""
Setup test agent for SSE testing
Add this to your backend startup or call manually
"""

from backend.api.agent_ui import register_agent
from src.agents.base_agent import BaseAgent
from typing import Dict, Any
import time

class TestAgent(BaseAgent):
    """Simple test agent for SSE testing."""
    
    def perceive(self, environment: Dict[str, Any]) -> Dict[str, Any]:
        return {"input": environment.get("input", "")}
    
    def decide(self, perception: Dict[str, Any]) -> Dict[str, Any]:
        return {"action": "test"}
    
    def act(self, decision: Dict[str, Any]) -> Dict[str, Any]:
        # Simulate state change
        count = self.state.get("count", 0) + 1
        self.update_state({
            "count": count,
            "last_update": time.time(),
            "status": "active"
        })
        return {"result": "success", "count": count}

def setup_test_agent():
    """Register a test agent for SSE testing."""
    test_agent = TestAgent(
        agent_id="test-agent-sse",
        name="Test Agent for SSE"
    )
    
    register_agent(test_agent.agent_id, test_agent)
    
    # Initialize with some state
    test_agent.update_state({
        "count": 0,
        "status": "ready",
        "created_at": time.time()
    })
    
    print(f"✅ Test agent registered: {test_agent.agent_id}")
    print(f"✅ Test with: curl -N -H 'Accept: text/event-stream' http://localhost:8000/api/agents/{test_agent.agent_id}/state/stream")
    
    return test_agent

# Auto-setup if run directly
if __name__ == "__main__":
    agent = setup_test_agent()
    print(f"\nAgent state: {agent.get_state()}")
    print("\nTo test SSE, run:")
    print(f"  curl.exe -N -H 'Accept: text/event-stream' http://localhost:8000/api/agents/{agent.agent_id}/state/stream")

