"""
Pytest configuration and fixtures for backend tests
"""

import pytest
import os
import tempfile
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from unittest.mock import patch, MagicMock

# Set test environment
os.environ['TESTING'] = 'True'
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ['SECRET_KEY'] = 'test-secret-key'
os.environ['JWT_SECRET_KEY'] = 'test-jwt-secret'

@pytest.fixture(scope='session')
def app():
    """Create and configure a test Flask application"""
    # Create a temporary database file
    db_fd, db_path = tempfile.mkstemp()
    
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'test-secret-key'
    app.config['JWT_SECRET_KEY'] = 'test-jwt-secret'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
    
    # Initialize extensions
    import sys
    import os
    backend_dir = os.path.dirname(__file__) + '/..'
    sys.path.insert(0, backend_dir)
    from models import db
    db.init_app(app)
    
    # Initialize JWT
    jwt = JWTManager(app)
    
    # Initialize migrations
    migrate = Migrate(app, db)
    
    # Register blueprints for testing
    from routes import auth_bp, agents_bp, messages_bp, knowledge_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(agents_bp, url_prefix='/api/agents')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    app.register_blueprint(knowledge_bp, url_prefix='/api/knowledge')
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    yield app
    
    # Clean up
    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture
def client(app):
    """Create a test client for the Flask application"""
    return app.test_client()

@pytest.fixture
def db_session(app):
    """Create a database session for testing"""
    from models import db
    
    with app.app_context():
        db.create_all()
        yield db
        db.drop_all()

@pytest.fixture
def auth_headers(app):
    """Create authentication headers for protected routes"""
    from flask_jwt_extended import create_access_token
    
    with app.app_context():
        # Create a test user token
        access_token = create_access_token(identity='test-user')
        return {'Authorization': f'Bearer {access_token}'}

@pytest.fixture
def mock_agent():
    """Create a mock agent for testing"""
    agent_data = {
        'id': 'agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl',
        'name': 'Healthcare Assistant',
        'address': 'agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl',
        'description': 'AI healthcare assistant for medical advice',
        'capabilities': ['medical_advice', 'drug_interactions', 'symptom_analysis'],
        'status': 'active',
        'agent_type': 'healthcare',
        'port': 8001
    }
    return agent_data

@pytest.fixture
def mock_financial_agent():
    """Create a mock financial agent for testing"""
    agent_data = {
        'name': 'Financial Advisor',
        'address': 'agent1q0mhyw50uglat30my4ecm93t9xnt0wfegddx9k3s8t0nqn5k42z6qjvd69g',
        'description': 'AI financial advisor for investment advice',
        'capabilities': ['investment_advice', 'portfolio_analysis', 'market_analysis'],
        'status': 'active',
        'agent_type': 'financial'
    }
    return agent_data

@pytest.fixture
def mock_logistics_agent():
    """Create a mock logistics agent for testing"""
    agent_data = {
        'name': 'Logistics Coordinator',
        'address': 'agent1qve8agrlc8yjqa3wqrz7cehwr2eh06yq4339afd0hhd0ec4g7vwyv5pw40u',
        'description': 'AI logistics coordinator for supply chain management',
        'capabilities': ['supply_chain', 'route_optimization', 'inventory_management'],
        'status': 'active',
        'agent_type': 'logistics'
    }
    return agent_data

@pytest.fixture
def mock_metta_kg():
    """Mock MeTTa Knowledge Graph for testing"""
    with patch('knowledge.metta_kg.integration.MeTTaKnowledgeGraph') as mock:
        mock_instance = MagicMock()
        mock.return_value = mock_instance
        
        # Mock successful query response
        mock_instance.query.return_value = {
            'status': 'success',
            'result': 'Mock knowledge graph response',
            'confidence': 0.85
        }
        
        yield mock_instance

@pytest.fixture
def mock_healthcare_agent():
    """Mock healthcare agent for testing"""
    with patch('agents.healthcare_agent.main.healthcare_agent') as mock:
        mock.name = 'Healthcare Assistant'
        mock.address = 'agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl'
        mock.port = 8001
        mock.include = MagicMock()
        yield mock

@pytest.fixture
def mock_financial_agent_module():
    """Mock financial agent module for testing"""
    with patch('agents.financial_agent.main.financial_agent') as mock:
        mock.name = 'Financial Advisor'
        mock.address = 'agent1q0mhyw50uglat30my4ecm93t9xnt0wfegddx9k3s8t0nqn5k42z6qjvd69g'
        mock.port = 8003
        mock.include = MagicMock()
        yield mock

@pytest.fixture
def mock_logistics_agent_module():
    """Mock logistics agent module for testing"""
    with patch('agents.logistics_agent.main.logistics_agent') as mock:
        mock.name = 'Logistics Coordinator'
        mock.address = 'agent1qve8agrlc8yjqa3wqrz7cehwr2eh06yq4339afd0hhd0ec4g7vwyv5pw40u'
        mock.port = 8002
        mock.include = MagicMock()
        yield mock
