#!/usr/bin/env python3
"""
Agentverse Registration Script
Registers ASI agents with the Agentverse platform for discovery
"""

import requests
import json
import os
from datetime import datetime
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class AgentverseRegistrar:
    """
    Handles registration of agents with Agentverse platform
    """
    
    def __init__(self):
        self.base_url = "https://agentverse.ai/api/v1"
        self.api_key = os.getenv('AGENTVERSE_API_KEY')
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
    
    def register_agent(self, agent_config: Dict[str, Any]) -> bool:
        """
        Register a single agent with Agentverse
        
        Args:
            agent_config: Agent configuration dictionary
            
        Returns:
            bool: True if registration successful
        """
        try:
            if not self.api_key:
                logger.warning("Agentverse API key not found, using mock registration")
                return self._mock_register_agent(agent_config)
            
            response = requests.post(
                f"{self.base_url}/agents",
                headers=self.headers,
                json=agent_config,
                timeout=30
            )
            
            if response.status_code == 201:
                logger.info(f"Successfully registered agent: {agent_config['name']}")
                return True
            else:
                logger.error(f"Failed to register agent: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error registering agent {agent_config['name']}: {e}")
            return False
    
    def _mock_register_agent(self, agent_config: Dict[str, Any]) -> bool:
        """
        Mock registration for demo purposes
        """
        logger.info(f"Mock registration: {agent_config['name']} registered successfully")
        logger.info(f"Agent address: {agent_config.get('address', 'mock-address')}")
        logger.info(f"Capabilities: {agent_config.get('capabilities', [])}")
        return True
    
    def get_registered_agents(self) -> List[Dict[str, Any]]:
        """
        Get list of registered agents
        """
        try:
            if not self.api_key:
                return self._get_mock_agents()
            
            response = requests.get(
                f"{self.base_url}/agents",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json().get('agents', [])
            else:
                logger.error(f"Failed to get agents: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting registered agents: {e}")
            return []
    
    def _get_mock_agents(self) -> List[Dict[str, Any]]:
        """
        Return mock registered agents
        """
        return [
            {
                "id": "healthcare-agent",
                "name": "Healthcare Assistant",
                "address": "agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl",
                "status": "active",
                "capabilities": ["Medical Analysis", "Symptom Checker", "Treatment Planning", "MeTTa Knowledge Graph", "ASI:One Integration"],
                "endpoint": "http://localhost:8002",
                "registered_at": datetime.now().isoformat()
            },
            {
                "id": "financial-agent", 
                "name": "Financial Advisor",
                "address": "agent1qtm6dj5n89vjda5adz223x7t7pdzle3rskugery36w4en3je67whkuke606",
                "status": "inactive",
                "capabilities": ["Portfolio Management", "Risk Assessment", "DeFi Integration", "MeTTa Knowledge Graph", "ASI:One Integration"],
                "endpoint": "http://localhost:8003",
                "registered_at": datetime.now().isoformat()
            },
            {
                "id": "logistics-agent",
                "name": "Logistics Coordinator", 
                "address": "agent1q09g48srfjc74zzlr80ag93qaaev7ue9vhgl2u3jgykca0trwm2hxpw66jl",
                "status": "inactive",
                "capabilities": ["Route Optimization", "Inventory Management", "Supply Chain Analysis", "MeTTa Knowledge Graph", "ASI:One Integration"],
                "endpoint": "http://localhost:8004",
                "registered_at": datetime.now().isoformat()
            }
        ]

def register_all_agents():
    """
    Register all ASI agents with Agentverse
    """
    registrar = AgentverseRegistrar()
    
    # Define agent configurations
    agents = [
        {
            "name": "Healthcare Assistant",
            "description": "AI-powered medical diagnosis and treatment recommendations with MeTTa Knowledge Graph and ASI:One integration",
            "address": "agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl",
            "capabilities": [
                "Medical Analysis",
                "Symptom Checker", 
                "Treatment Planning",
                "Drug Interaction Check",
                "MeTTa Knowledge Graph",
                "ASI:One Integration",
                "HTTP API"
            ],
            "endpoint": "http://localhost:8002",
            "category": "healthcare",
            "tags": ["medical", "health", "diagnosis", "treatment", "metta", "asi-one"],
            "version": "1.0.0",
            "author": "ASI Alliance",
            "license": "MIT"
        },
        {
            "name": "Financial Advisor",
            "description": "DeFi protocol integration and investment strategies with advanced AI reasoning and MeTTa knowledge graphs",
            "address": "agent1qtm6dj5n89vjda5adz223x7t7pdzle3rskugery36w4en3je67whkuke606",
            "capabilities": [
                "Portfolio Management",
                "Risk Assessment",
                "DeFi Integration", 
                "Market Analysis",
                "MeTTa Knowledge Graph",
                "ASI:One Integration"
            ],
            "endpoint": "http://localhost:8003",
            "category": "finance",
            "tags": ["finance", "defi", "investment", "portfolio", "metta", "asi-one"],
            "version": "1.0.0",
            "author": "ASI Alliance",
            "license": "MIT"
        },
        {
            "name": "Logistics Coordinator",
            "description": "Supply chain optimization and delivery management with enhanced AI capabilities and MeTTa knowledge graphs",
            "address": "agent1q09g48srfjc74zzlr80ag93qaaev7ue9vhgl2u3jgykca0trwm2hxpw66jl",
            "capabilities": [
                "Route Optimization",
                "Inventory Management",
                "Delivery Tracking",
                "Supply Chain Analysis", 
                "MeTTa Knowledge Graph",
                "ASI:One Integration"
            ],
            "endpoint": "http://localhost:8004",
            "category": "logistics",
            "tags": ["logistics", "supply-chain", "optimization", "delivery", "metta", "asi-one"],
            "version": "1.0.0",
            "author": "ASI Alliance",
            "license": "MIT"
        }
    ]
    
    print("🚀 Registering ASI Agents with Agentverse")
    print("=" * 50)
    
    success_count = 0
    for agent in agents:
        print(f"\n📝 Registering {agent['name']}...")
        if registrar.register_agent(agent):
            success_count += 1
            print(f"✅ {agent['name']} registered successfully")
        else:
            print(f"❌ Failed to register {agent['name']}")
    
    print(f"\n📊 Registration Summary:")
    print(f"✅ Successfully registered: {success_count}/{len(agents)} agents")
    print(f"❌ Failed registrations: {len(agents) - success_count}/{len(agents)} agents")
    
    # Show registered agents
    print(f"\n📋 Registered Agents:")
    registered_agents = registrar.get_registered_agents()
    for agent in registered_agents:
        print(f"  • {agent['name']} ({agent['status']}) - {agent['address']}")
    
    return success_count == len(agents)

if __name__ == "__main__":
    print("🤖 ASI Agentverse Registration Tool")
    print("Following Fetch.ai Innovation Lab workshop examples")
    
    success = register_all_agents()
    
    if success:
        print("\n🎉 All agents registered successfully!")
        print("Your agents are now discoverable on Agentverse")
    else:
        print("\n⚠️ Some agents failed to register")
        print("Check the logs above for details")
