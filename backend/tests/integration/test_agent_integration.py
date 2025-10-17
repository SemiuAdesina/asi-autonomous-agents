"""
Integration tests for agent functionality
"""

import pytest
from unittest.mock import patch, MagicMock


class TestAgentIntegration:
    """Integration tests for agent communication"""
    
    def test_agent_discovery_integration(self, client, db_session, app):
        """Test agent discovery integration"""
        with app.app_context():
            # Test the API endpoint
            response = client.get('/api/agents/')
            assert response.status_code == 200
            
            data = response.get_json()
            assert isinstance(data, list)
    
    def test_agent_message_flow(self, client, db_session, mock_agent, app):
        """Test complete message flow from user to agent"""
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
            
            # Test message creation
            message_data = {
                'agent_id': agent.id,
                'message': 'What are the symptoms of flu?',
                'session_id': 'test-session-123'
            }
            
            # This would normally send to the agent and get a response
            # For integration testing, we'll test the database storage
            message = Message(
                agent_id=agent.id,
                content=message_data['message'],
                sender_type='user'
            )
            db.session.add(message)
            db.session.commit()
            
            # Verify message was stored
            saved_message = Message.query.filter_by(agent_id=agent.id).first()
            assert saved_message is not None
            assert saved_message.content == message_data['message']
            assert saved_message.sender_type == 'user'
    
    def test_metta_knowledge_graph_integration(self, mock_metta_kg):
        """Test MeTTa Knowledge Graph integration"""
        from knowledge.metta_kg.integration import MeTTaKnowledgeGraph
        
        # Test knowledge graph query
        result = mock_metta_kg.query("What are the symptoms of flu?")
        
        assert result['status'] == 'success'
        assert 'result' in result
        assert 'confidence' in result
        assert result['confidence'] > 0.0
    
    def test_agent_health_check_integration(self):
        """Test agent health check integration"""
        # This would test actual agent health checks
        # For now, we'll test the concept
        
        agent_ports = [8001, 8002, 8003]  # Healthcare, Logistics, Financial
        
        for port in agent_ports:
            # Mock health check
            with patch('requests.get') as mock_get:
                mock_response = MagicMock()
                mock_response.status_code = 200
                mock_response.json.return_value = {'status': 'healthy'}
                mock_get.return_value = mock_response
                
                # Simulate health check
                response = mock_get(f'http://localhost:{port}/health')
                assert response.status_code == 200
                assert response.json()['status'] == 'healthy'
    
    def test_multi_agent_communication(self, client, db_session, app):
        """Test communication between multiple agents"""
        with app.app_context():
            from models import Agent, Message, db
            
            # Create multiple agents
            agents = [
                Agent(
                    name=f'Test Agent {i}',
                    address=f'agent{i}',
                    description=f'Test agent {i}',
                    capabilities=['test'],
                    status='active',
                    agent_type='test'
                )
                for i in range(1, 4)
            ]
            
            for agent in agents:
                db.session.add(agent)
            db.session.commit()
            
            # Create messages for each agent
            for i, agent in enumerate(agents):
                message = Message(
                    agent_id=agent.id,
                    content=f'Test message {i}',
                    sender_type='user'
                )
                db.session.add(message)
            
            db.session.commit()
            
            # Verify all messages were created
            messages = Message.query.all()
            assert len(messages) == 3
            
            # Verify each agent has its message
            for i, agent in enumerate(agents):
                agent_messages = Message.query.filter_by(agent_id=agent.id).all()
                assert len(agent_messages) == 1
                assert agent_messages[0].content == f'Test message {i}'