# Agent-to-Agent Communication Coordinator
# Enables seamless communication between all agents in the ecosystem

from datetime import datetime
from uuid import uuid4
from uagents import Agent, Context, Model
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

# Agent Registry for tracking all agents
AGENT_REGISTRY = {
    "healthcare": {
        "address": "agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl",
        "name": "Healthcare Assistant",
        "port": 8001,
        "capabilities": ["medical_consultation", "health_check", "symptom_analysis"]
    },
    "financial": {
        "address": "agent1q0mhyw50uglat30my4ecm93t9xnt0wfegddx9k3s8t0nqn5k42z6qjvd69g", 
        "name": "Financial Advisor",
        "port": 8003,
        "capabilities": ["financial_consultation", "market_analysis", "investment_advice"]
    },
    "logistics": {
        "address": "agent1qve8agrlc8yjqa3wqrz7cehwr2eh06yq4339afd0hhd0ec4g7vwyv5pw40u",
        "name": "Logistics Coordinator", 
        "port": 8002,
        "capabilities": ["logistics_consultation", "supply_chain_analysis", "route_optimization"]
    }
}

class AgentMessage(Model):
    from_agent: str
    to_agent: str
    message_type: str
    content: str
    timestamp: datetime
    conversation_id: Optional[str] = None

class AgentResponse(Model):
    from_agent: str
    to_agent: str
    message_type: str
    content: str
    timestamp: datetime
    conversation_id: Optional[str] = None

class MultiAgentQuery(Model):
    query: str
    required_capabilities: List[str]
    context: Dict[str, str]

class MultiAgentResponse(Model):
    responses: List[AgentResponse]
    summary: str
    timestamp: datetime

class AgentCoordinator:
    """
    Coordinates communication between all agents in the ecosystem
    """
    
    def __init__(self):
        self.agent = Agent(
            name="Agent Coordinator",
            seed="agent-coordinator-seed-phrase-for-asi-hackathon-2024",
            port=8004,
            endpoint=["http://localhost:8004/submit"]
        )
        self.active_conversations: Dict[str, List[AgentMessage]] = {}
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup message handlers for agent coordination"""
        
        @self.agent.on_message(AgentMessage)
        async def handle_agent_message(ctx: Context, sender: str, msg: AgentMessage):
            """Handle inter-agent messages"""
            ctx.logger.info(f"Coordinator received message from {msg.from_agent} to {msg.to_agent}")
            
            # Route message to appropriate agent
            if msg.to_agent in AGENT_REGISTRY:
                target_agent = AGENT_REGISTRY[msg.to_agent]
                ctx.logger.info(f"Routing message to {target_agent['name']}")
                
                # Store in conversation history
                if msg.conversation_id:
                    if msg.conversation_id not in self.active_conversations:
                        self.active_conversations[msg.conversation_id] = []
                    self.active_conversations[msg.conversation_id].append(msg)
                
                # Forward message to target agent
                await ctx.send(target_agent["address"], msg)
            else:
                ctx.logger.error(f"Unknown target agent: {msg.to_agent}")
        
        @self.agent.on_message(AgentResponse)
        async def handle_agent_response(ctx: Context, sender: str, msg: AgentResponse):
            """Handle responses from agents"""
            ctx.logger.info(f"Coordinator received response from {msg.from_agent} to {msg.to_agent}")
            
            # Store response in conversation history
            if msg.conversation_id:
                if msg.conversation_id in self.active_conversations:
                    # Convert response to message format for storage
                    response_msg = AgentMessage(
                        from_agent=msg.from_agent,
                        to_agent=msg.to_agent,
                        message_type=msg.message_type,
                        content=msg.content,
                        timestamp=msg.timestamp,
                        conversation_id=msg.conversation_id
                    )
                    self.active_conversations[msg.conversation_id].append(response_msg)
            
            # Forward response to original sender
            if msg.to_agent in AGENT_REGISTRY:
                target_agent = AGENT_REGISTRY[msg.to_agent]
                await ctx.send(target_agent["address"], msg)
        
        @self.agent.on_message(MultiAgentQuery)
        async def handle_multi_agent_query(ctx: Context, sender: str, msg: MultiAgentQuery):
            """Handle queries requiring multiple agents"""
            ctx.logger.info(f"Coordinator received multi-agent query: {msg.query}")
            
            # Find agents with required capabilities
            suitable_agents = []
            for agent_id, agent_info in AGENT_REGISTRY.items():
                if any(cap in agent_info["capabilities"] for cap in msg.required_capabilities):
                    suitable_agents.append(agent_id)
            
            # Send query to all suitable agents
            conversation_id = str(uuid4())
            responses = []
            
            for agent_id in suitable_agents:
                agent_info = AGENT_REGISTRY[agent_id]
                query_msg = AgentMessage(
                    from_agent="Agent Coordinator",
                    to_agent=agent_id,
                    message_type="multi_agent_query",
                    content=msg.query,
                    timestamp=datetime.utcnow(),
                    conversation_id=conversation_id
                )
                
                try:
                    await ctx.send(agent_info["address"], query_msg)
                    ctx.logger.info(f"Sent query to {agent_info['name']}")
                except Exception as e:
                    ctx.logger.error(f"Error sending query to {agent_info['name']}: {e}")
            
            # Create summary response
            summary = f"Multi-agent query sent to {len(suitable_agents)} agents: {', '.join(suitable_agents)}"
            response = MultiAgentResponse(
                responses=responses,
                summary=summary,
                timestamp=datetime.utcnow()
            )
            
            await ctx.send(sender, response)
    
    def get_agent_capabilities(self, agent_id: str) -> List[str]:
        """Get capabilities of a specific agent"""
        if agent_id in AGENT_REGISTRY:
            return AGENT_REGISTRY[agent_id]["capabilities"]
        return []
    
    def get_all_agents(self) -> Dict[str, Dict]:
        """Get information about all registered agents"""
        return AGENT_REGISTRY.copy()
    
    def get_conversation_history(self, conversation_id: str) -> List[AgentMessage]:
        """Get conversation history for a specific conversation"""
        return self.active_conversations.get(conversation_id, [])
    
    def run(self):
        """Start the agent coordinator"""
        print("Starting Agent Coordinator...")
        print(f"Coordinator Address: {self.agent.address}")
        print("Registered Agents:")
        for agent_id, agent_info in AGENT_REGISTRY.items():
            print(f"  - {agent_info['name']} ({agent_id}): {agent_info['address']}")
        print("=" * 50)
        
        self.agent.run()

# Global coordinator instance
coordinator = AgentCoordinator()

if __name__ == "__main__":
    coordinator.run()
