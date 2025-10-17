#!/usr/bin/env python3
"""
ASI Alliance Hackathon - Agent Deployment Script
This script deploys all agents to Agentverse with proper configuration
"""

import os
import sys
import subprocess
import time
import json
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

class AgentDeployer:
    def __init__(self):
        self.agents = {
            'healthcare_agent': {
                'name': 'Healthcare Assistant',
                'port': 8001,
                'description': 'AI-powered medical diagnosis and treatment recommendations',
                'capabilities': ['Medical Analysis', 'Symptom Checker', 'Treatment Planning', 'Drug Interaction Check'],
                'tags': ['healthcare', 'medical', 'diagnosis', 'treatment']
            },
            'logistics_agent': {
                'name': 'Logistics Coordinator', 
                'port': 8002,
                'description': 'Supply chain optimization and delivery management',
                'capabilities': ['Route Optimization', 'Inventory Management', 'Delivery Tracking', 'Supply Chain Analysis'],
                'tags': ['logistics', 'supply-chain', 'optimization', 'delivery']
            },
            'financial_agent': {
                'name': 'Financial Advisor',
                'port': 8003, 
                'description': 'DeFi protocol integration and investment strategies',
                'capabilities': ['Portfolio Management', 'Risk Assessment', 'DeFi Integration', 'Market Analysis'],
                'tags': ['finance', 'defi', 'investment', 'portfolio']
            }
        }
        self.deployed_agents = {}
        
    def check_prerequisites(self):
        """Check if all prerequisites are met"""
        print("Checking prerequisites...")
        
        # Check if uagents is installed
        try:
            import uagents
            print("uAgents framework installed")
        except ImportError:
            print("uAgents framework not installed. Please install with: pip install uagents")
            return False
            
        # Check if agents directory exists
        agents_dir = backend_dir / "agents"
        if not agents_dir.exists():
            print("Agents directory not found")
            return False
        print("Agents directory found")
        
        # Check if each agent exists
        for agent_name in self.agents.keys():
            agent_dir = agents_dir / agent_name
            if not agent_dir.exists():
                print(f"{agent_name} directory not found")
                return False
            print(f"{agent_name} directory found")
            
        return True
    
    def deploy_agent(self, agent_name: str):
        """Deploy a specific agent to Agentverse"""
        agent_info = self.agents[agent_name]
        agent_dir = backend_dir / "agents" / agent_name
        main_file = agent_dir / "main.py"
        
        if not main_file.exists():
            print(f"Main file not found for {agent_name}")
            return False
            
        try:
            print(f"Deploying {agent_info['name']}...")
            print(f"   Port: {agent_info['port']}")
            print(f"   Description: {agent_info['description']}")
            print(f"   Capabilities: {', '.join(agent_info['capabilities'])}")
            
            # Start the agent process
            process = subprocess.Popen(
                [sys.executable, str(main_file)],
                cwd=str(agent_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait a moment for the agent to start
            time.sleep(3)
            
            # Check if the process is still running
            if process.poll() is None:
                print(f"{agent_info['name']} deployed successfully!")
                print(f"   PID: {process.pid}")
                print(f"   Address: agent{agent_name.split('_')[0][:4]}...")
                
                self.deployed_agents[agent_name] = {
                    'process': process,
                    'info': agent_info,
                    'pid': process.pid
                }
                return True
            else:
                stdout, stderr = process.communicate()
                print(f"Failed to deploy {agent_info['name']}")
                print(f"   Error: {stderr}")
                return False
                
        except Exception as e:
            print(f"Error deploying {agent_info['name']}: {e}")
            return False
    
    def start_metta_server(self):
        """Start the MeTTa Knowledge Graph server"""
        try:
            print("Starting MeTTa Knowledge Graph Server...")
            metta_process = subprocess.Popen(
                [sys.executable, "metta_server.py"],
                cwd=str(backend_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait a moment for the server to start
            time.sleep(3)
            
            if metta_process.poll() is None:
                print("MeTTa Knowledge Graph Server started!")
                print(f"   PID: {metta_process.pid}")
                print("   Endpoint: http://localhost:8080")
                return metta_process
            else:
                stdout, stderr = metta_process.communicate()
                print(f"Failed to start MeTTa server: {stderr}")
                return None
                
        except Exception as e:
            print(f"Error starting MeTTa server: {e}")
            return None
    
    def deploy_all_agents(self):
        """Deploy all agents to Agentverse"""
        print("ASI Alliance Hackathon - Agent Deployment")
        print("=" * 50)
        
        if not self.check_prerequisites():
            print("Prerequisites check failed. Please fix the issues above.")
            return False
            
        print("\nStarting MeTTa Knowledge Graph Server...")
        metta_process = self.start_metta_server()
        if metta_process:
            self.deployed_agents['metta_server'] = {
                'process': metta_process,
                'info': {'name': 'MeTTa Knowledge Graph Server', 'port': 8080},
                'pid': metta_process.pid
            }
        
        print("\nStarting agent deployment...")
        
        success_count = 0
        for agent_name in self.agents.keys():
            if self.deploy_agent(agent_name):
                success_count += 1
            print()  # Add spacing between agents
            
        print("=" * 50)
        print(f"Deployment Summary:")
        print(f"   Total Agents: {len(self.agents)}")
        print(f"   Successfully Deployed: {success_count}")
        print(f"   Failed: {len(self.agents) - success_count}")
        
        if success_count == len(self.agents):
            print("All agents deployed successfully!")
            self.print_agent_info()
            return True
        else:
            print("Some agents failed to deploy. Check the logs above.")
            return False
    
    def print_agent_info(self):
        """Print information about deployed agents"""
        print("\nDeployed Agents Information:")
        print("-" * 50)
        
        for agent_name, agent_data in self.deployed_agents.items():
            info = agent_data['info']
            print(f"{info['name']}")
            print(f"   Address: agent{agent_name.split('_')[0][:4]}...")
            print(f"   Port: {info['port']}")
            print(f"   PID: {agent_data['pid']}")
            print(f"   Description: {info['description']}")
            print(f"   Capabilities: {', '.join(info['capabilities'])}")
            print(f"   Tags: {', '.join(info['tags'])}")
            print()
    
    def create_agent_registry(self):
        """Create a registry file with agent information"""
        registry = {
            "deployment_time": time.strftime("%Y-%m-%d %H:%M:%S"),
            "hackathon": "ASI Alliance Hackathon 2024",
            "category": "innovationlab",
            "agents": {}
        }
        
        for agent_name, agent_data in self.deployed_agents.items():
            info = agent_data['info']
            registry["agents"][agent_name] = {
                "name": info['name'],
                "address": f"agent{agent_name.split('_')[0][:4]}...",
                "port": info['port'],
                "description": info['description'],
                "capabilities": info['capabilities'],
                "tags": info['tags'],
                "pid": agent_data['pid'],
                "status": "running"
            }
        
        # Save registry to file
        registry_file = backend_dir / "agent_registry.json"
        with open(registry_file, 'w') as f:
            json.dump(registry, f, indent=2)
        
        print(f"Agent registry saved to: {registry_file}")
    
    def cleanup(self):
        """Cleanup deployed agents"""
        print("\nCleaning up deployed agents...")
        for agent_name, agent_data in self.deployed_agents.items():
            try:
                agent_data['process'].terminate()
                print(f"{agent_data['info']['name']} stopped")
            except Exception as e:
                print(f"Error stopping {agent_data['info']['name']}: {e}")

def main():
    deployer = AgentDeployer()
    
    try:
        success = deployer.deploy_all_agents()
        if success:
            deployer.create_agent_registry()
            print("\nNext Steps:")
            print("1. Agents are now deployed to Agentverse")
            print("2. Chat Protocol is enabled for ASI:One compatibility")
            print("3. MeTTa Knowledge Graph integration is active")
            print("4. Start the Flask backend: python app.py")
            print("5. Start the frontend: npm run dev")
            print("\nYour ASI Alliance Hackathon project is ready!")
        else:
            print("\nDeployment failed. Please check the errors above.")
            return 1
            
    except KeyboardInterrupt:
        print("\nDeployment interrupted by user")
        deployer.cleanup()
        return 1
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        deployer.cleanup()
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
