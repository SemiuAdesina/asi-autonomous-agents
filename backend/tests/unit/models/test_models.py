"""
Unit tests for database models
"""

import pytest
from datetime import datetime


class TestModelImports:
    """Test that models can be imported correctly"""
    
    def test_import_models(self, app):
        """Test importing models in app context"""
        with app.app_context():
            from models import Agent, Message, User, KnowledgeGraph, AgentSession, db
            
            # Test that models are imported successfully
            assert Agent is not None
            assert Message is not None
            assert User is not None
            assert KnowledgeGraph is not None
            assert AgentSession is not None
            assert db is not None
    
    def test_agent_model_creation(self, app, db_session):
        """Test creating an Agent model"""
        with app.app_context():
            from models import Agent, db
            
            agent = Agent(
                name='Healthcare Assistant',
                address='agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl',
                description='AI healthcare assistant',
                capabilities=['medical_advice', 'drug_interactions'],
                status='active',
                agent_type='healthcare'
            )
            
            db.session.add(agent)
            db.session.commit()
            
            # Verify agent was created
            saved_agent = Agent.query.filter_by(address=agent.address).first()
            assert saved_agent is not None
            assert saved_agent.name == 'Healthcare Assistant'
            assert saved_agent.agent_type == 'healthcare'
            assert saved_agent.status == 'active'
            assert 'medical_advice' in saved_agent.capabilities
    
    def test_message_model_creation(self, app, db_session):
        """Test creating a Message model"""
        with app.app_context():
            from models import Agent, Message, db
            
            # First create an agent
            agent = Agent(
                name='Healthcare Assistant',
                address='agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl',
                description='AI healthcare assistant',
                capabilities=['medical_advice'],
                status='active',
                agent_type='healthcare'
            )
            db.session.add(agent)
            db.session.commit()
            
            # Create message
            message = Message(
                content='What are the symptoms of flu?',
                sender_type='user',
                agent_id=agent.id
            )
            
            db.session.add(message)
            db.session.commit()
            
            # Verify message was created
            saved_message = Message.query.filter_by(agent_id=agent.id).first()
            assert saved_message is not None
            assert saved_message.agent_id == agent.id
            assert saved_message.content == 'What are the symptoms of flu?'
            assert saved_message.sender_type == 'user'
    
    def test_user_model_creation(self, app, db_session):
        """Test creating a User model"""
        with app.app_context():
            from models import User, db
            
            user = User(
                username='testuser',
                email='test@example.com'
            )
            
            db.session.add(user)
            db.session.commit()
            
            # Verify user was created
            saved_user = User.query.filter_by(username='testuser').first()
            assert saved_user is not None
            assert saved_user.email == 'test@example.com'
    
    def test_knowledge_graph_model_creation(self, app, db_session):
        """Test creating a KnowledgeGraph model"""
        with app.app_context():
            from models import KnowledgeGraph, db
            
            kg_entry = KnowledgeGraph(
                concept='flu',
                definition='Influenza is a viral infection',
                relationships={'symptoms': ['fever', 'cough']},
                source='medical_database',
                confidence_score=85
            )
            
            db.session.add(kg_entry)
            db.session.commit()
            
            # Verify entry was created
            saved_entry = KnowledgeGraph.query.filter_by(concept='flu').first()
            assert saved_entry is not None
            assert saved_entry.definition == 'Influenza is a viral infection'
            assert saved_entry.confidence_score == 85
            assert saved_entry.relationships['symptoms'] == ['fever', 'cough']