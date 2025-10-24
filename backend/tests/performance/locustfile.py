# Performance Testing with Locust

from locust import HttpUser, task, between
import json
import random

class ASIAgentsUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """Login and get authentication token"""
        response = self.client.post("/api/auth/login", json={
            "username": "test_user",
            "password": "test_password"
        })
        if response.status_code == 200:
            self.token = response.json()["access_token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            # Use mock token for testing
            self.token = "mock_token"
            self.headers = {"Authorization": f"Bearer {self.token}"}
    
    @task(3)
    def get_agents(self):
        """Test getting list of agents"""
        self.client.get("/api/agents", headers=self.headers)
    
    @task(2)
    def get_agent_details(self):
        """Test getting specific agent details"""
        agent_id = random.randint(1, 3)
        self.client.get(f"/api/agents/{agent_id}", headers=self.headers)
    
    @task(2)
    def send_message(self):
        """Test sending message to agent"""
        agent_id = random.randint(1, 3)
        messages = [
            "Hello, how can you help me?",
            "What are your capabilities?",
            "Can you analyze this data?",
            "I need assistance with my portfolio",
            "Help me optimize my supply chain"
        ]
        
        self.client.post(f"/api/messages", 
                        json={
                            "content": random.choice(messages),
                            "agent_id": agent_id
                        },
                        headers=self.headers)
    
    @task(1)
    def get_messages(self):
        """Test getting message history"""
        agent_id = random.randint(1, 3)
        self.client.get(f"/api/messages?agent_id={agent_id}", headers=self.headers)
    
    @task(1)
    def query_knowledge(self):
        """Test knowledge graph queries"""
        queries = [
            "healthcare",
            "logistics",
            "financial",
            "blockchain",
            "artificial intelligence"
        ]
        
        self.client.get(f"/api/knowledge/query?q={random.choice(queries)}", 
                       headers=self.headers)
    
    @task(1)
    def health_check(self):
        """Test health check endpoint"""
        self.client.get("/api/health")
    
    @task(1)
    def get_metrics(self):
        """Test metrics endpoint"""
        self.client.get("/api/health/metrics")
    
    @task(1)
    def multisig_operations(self):
        """Test multi-signature wallet operations"""
        # Test getting supported chains
        self.client.get("/api/multisig/supported-chains", headers=self.headers)
        
        # Test getting audit templates
        self.client.get("/api/audit/templates", headers=self.headers)
    
    @task(1)
    def audit_contract(self):
        """Test smart contract audit"""
        sample_contract = """
        pragma solidity ^0.8.0;
        
        contract TestContract {
            mapping(address => uint256) public balances;
            
            function deposit() public payable {
                balances[msg.sender] += msg.value;
            }
            
            function withdraw(uint256 amount) public {
                require(balances[msg.sender] >= amount);
                balances[msg.sender] -= amount;
                payable(msg.sender).transfer(amount);
            }
        }
        """
        
        self.client.post("/api/audit/contract",
                        json={
                            "contract_code": sample_contract,
                            "language": "solidity",
                            "contract_name": "TestContract"
                        },
                        headers=self.headers)

class HighLoadUser(HttpUser):
    """High load user for stress testing"""
    wait_time = between(0.1, 0.5)
    
    def on_start(self):
        self.token = "mock_token"
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    @task(10)
    def rapid_requests(self):
        """Rapid fire requests"""
        self.client.get("/api/health")
    
    @task(5)
    def concurrent_messages(self):
        """Concurrent message sending"""
        self.client.post("/api/messages",
                        json={
                            "content": "Stress test message",
                            "agent_id": 1
                        },
                        headers=self.headers)
