"""
Unit tests for agents API endpoints
"""

import pytest
import json
from datetime import datetime


class TestAgentsAPI:
    """Test agents API endpoints"""
    
    def test_get_agents_empty(self, client, db_session, app):
        """Test getting agents when none exist"""
        with app.app_context():
            response = client.get('/api/agents/')
            assert response.status_code == 200
            
            data = json.loads(response.data)
            assert data == []
    
    def test_get_agents_with_data(self, client, db_session, mock_agent, app):
        """Test getting agents when they exist"""
        with app.app_context():
            from models import Agent, db
            
            # Create test agent
            agent = Agent(
                name=mock_agent['name'],
                address=mock_agent['address'],
                description=mock_agent['description'],
                capabilities=mock_agent['capabilities'],
                status=mock_agent['status'],
                agent_type=mock_agent['agent_type']
            )
            db.session.add(agent)
            db.session.commit()
            
            # Test GET /api/agents/
            response = client.get('/api/agents/')
            assert response.status_code == 200
            
            data = json.loads(response.data)
            assert len(data) == 1
            assert data[0]['name'] == mock_agent['name']
            assert data[0]['agent_type'] == mock_agent['agent_type']
            assert data[0]['capabilities'] == mock_agent['capabilities']
    
    def test_get_specific_agent(self, client, db_session, mock_agent, app):
        """Test getting a specific agent by ID"""
        with app.app_context():
            from models import Agent, db
            
            # Create test agent
            agent = Agent(
                name=mock_agent['name'],
                address=mock_agent['address'],
                description=mock_agent['description'],
                capabilities=mock_agent['capabilities'],
                status=mock_agent['status'],
                agent_type=mock_agent['agent_type']
            )
            db.session.add(agent)
            db.session.commit()
            
            # Test GET /api/agents/<agent_id>
            response = client.get(f'/api/agents/{agent.id}')
            assert response.status_code == 200
            
            data = json.loads(response.data)
            assert data['name'] == mock_agent['name']
            assert data['agent_type'] == mock_agent['agent_type']
    
    def test_get_nonexistent_agent(self, client, db_session, app):
        """Test getting a non-existent agent"""
        with app.app_context():
            response = client.get('/api/agents/999999')
            assert response.status_code == 404
            
            data = json.loads(response.data)
            assert 'error' in data
    
    def test_create_agent(self, client, db_session, auth_headers, app):
        """Test creating a new agent"""
        with app.app_context():
            agent_data = {
                'name': 'Test Agent',
                'address': 'agent1qtest123456789',
                'description': 'Test agent description',
                'capabilities': ['test_capability'],
                'agent_type': 'test'
            }
            
            response = client.post(
                '/api/agents/',
                data=json.dumps(agent_data),
                content_type='application/json',
                headers=auth_headers
            )
            
            assert response.status_code == 201
            
            data = json.loads(response.data)
            assert data['name'] == agent_data['name']
            assert data['agent_type'] == agent_data['agent_type']
            
            # Verify agent was saved to database
            from models import Agent
            saved_agent = Agent.query.filter_by(name=agent_data['name']).first()
            assert saved_agent is not None
            assert saved_agent.address == agent_data['address']
    
    def test_agent_unauthorized_access(self, client, db_session, app):
        """Test unauthorized access to protected endpoints"""
        with app.app_context():
            # Test creating agent without auth
            agent_data = {
                'name': 'Test Agent',
                'address': 'agent1qtest123456789',
                'description': 'Test agent description',
                'capabilities': ['test_capability'],
                'agent_type': 'test'
            }
            
            response = client.post(
                '/api/agents/',
                data=json.dumps(agent_data),
                content_type='application/json'
            )
            
            assert response.status_code == 401  # Unauthorized
    
    def test_get_agent_messages(self, client, db_session, mock_agent, app):
        """Test getting messages for a specific agent"""
        with app.app_context():
            from models import Agent, Message, db
            
            # Create test agent
            agent = Agent(
                name=mock_agent['name'],
                address=mock_agent['address'],
                description=mock_agent['description'],
                capabilities=mock_agent['capabilities'],
                status=mock_agent['status'],
                agent_type=mock_agent['agent_type']
            )
            db.session.add(agent)
            db.session.commit()
            
            # Create test messages
            message1 = Message(
                content='Hello agent',
                sender_type='user',
                agent_id=agent.id
            )
            message2 = Message(
                content='How are you?',
                sender_type='user',
                agent_id=agent.id
            )
            db.session.add_all([message1, message2])
            db.session.commit()
            
            # Test GET /api/agents/<agent_id>/messages
            response = client.get(f'/api/agents/{agent.id}/messages')
            assert response.status_code == 200
            
            data = json.loads(response.data)
            assert len(data) == 2
            # Messages are ordered by timestamp desc, so newest first
            assert data[0]['content'] == 'How are you?'
            assert data[1]['content'] == 'Hello agent'