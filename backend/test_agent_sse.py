"""
Test script to create a demo agent and test SSE endpoint
"""

from backend.api.agent_ui import register_agent
from src.agents.base_agent import BaseAgent
from typing import Dict, Any
import time
import threading

class TestAgent(BaseAgent):
    """Simple test agent for SSE testing."""
    
    def perceive(self, environment: Dict[str, Any]) -> Dict[str, Any]:
        return {"input": environment.get("input", "")}
    
    def decide(self, perception: Dict[str, Any]) -> Dict[str, Any]:
        return {"action": "test"}
    
    def act(self, decision: Dict[str, Any]) -> Dict[str, Any]:
        # Simulate state change
        count = self.state.get("count", 0) + 1
        self.update_state({"count": count, "last_update": time.time()})
        return {"result": "success", "count": count}

# Create and register test agent
test_agent = TestAgent(
    agent_id="test-agent-sse",
    name="Test Agent for SSE"
)

register_agent(test_agent.agent_id, test_agent)

# Simulate state changes in background
def simulate_state_changes():
    """Simulate agent state changes every 2 seconds."""
    while True:
        time.sleep(2)
        test_agent.act({"action": "test"})
        print(f"Agent state updated: {test_agent.get_state()}")

# Start background thread
thread = threading.Thread(target=simulate_state_changes, daemon=True)
thread.start()

print(f"✅ Test agent registered: {test_agent.agent_id}")
print(f"✅ Agent state: {test_agent.get_state()}")
print(f"\n📡 Test SSE endpoint with:")
print(f"   curl -N -H 'Accept: text/event-stream' http://localhost:8000/api/agents/{test_agent.agent_id}/state/stream")
print(f"\n🔄 Agent state will update every 2 seconds")

