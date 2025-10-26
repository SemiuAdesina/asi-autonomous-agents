#!/usr/bin/env python3
"""
ASI Autonomous Agents Backend
Main Flask application with error handling for Render deployment
"""

import sys
import os

# Add error handling for imports
try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    from flask_sqlalchemy import SQLAlchemy
    from flask_migrate import Migrate
    from flask_socketio import SocketIO, emit, join_room
    from flask_jwt_extended import JWTManager
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
    from celery import Celery
    import requests
    from datetime import datetime
    from dotenv import load_dotenv
    from utils.rate_limiting import create_rate_limiter, rate_limit_handler
    from utils.security import SecurityMiddleware
    from utils.logging import RequestLogger, logger, monitor
    print("✅ All imports successful")
except Exception as e:
    print(f"❌ Import error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Load environment variables
load_dotenv()

# Set NO_PROXY to bypass proxy for localhost requests
os.environ['NO_PROXY'] = 'localhost,127.0.0.1'

# Initialize Flask app
print("🔧 Initializing Flask app...")
app = Flask(__name__)

# Configuration
print("🔧 Loading configuration...")
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql+psycopg://asi_user:asi_password_2024@localhost:5432/asi_agents')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 300,
    'pool_size': 10,
    'max_overflow': 20
}
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

# Initialize extensions
print("🔧 Initializing database...")
from models import db
db.init_app(app)
print("✅ Database initialized")
migrate = Migrate(app, db)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

# Initialize rate limiter
limiter = create_rate_limiter(app)
app.register_error_handler(429, rate_limit_handler)

# Initialize security middleware
SecurityMiddleware.init_security(app)

# Initialize request logging
request_logger = RequestLogger(app)

# Initialize Celery
celery = Celery(
    app.import_name,
    backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0')
)
celery.conf.update(app.config)

# Import models after db initialization
from models import Agent, Message, User, KnowledgeGraph

# Import routes
print("🔧 Importing routes...")
from routes import auth_bp, agents_bp, messages_bp, knowledge_bp, health_bp, multisig_bp, audit_bp, sessions_bp, transactions_bp, generate_bp
print("✅ Routes imported")

# Register blueprints
print("🔧 Registering blueprints...")
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(agents_bp, url_prefix='/api/agents')
app.register_blueprint(messages_bp, url_prefix='/api/messages')
app.register_blueprint(knowledge_bp, url_prefix='/api/knowledge')
app.register_blueprint(health_bp, url_prefix='/api')
app.register_blueprint(multisig_bp, url_prefix='/api/multisig')
app.register_blueprint(audit_bp, url_prefix='/api/audit')
app.register_blueprint(sessions_bp, url_prefix='/api/sessions')
app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
app.register_blueprint(generate_bp, url_prefix='/api')
print("✅ All blueprints registered")

# Socket.IO events
print("🔧 Setting up Socket.IO events...")
@socketio.on('connect')
def handle_connect():
    print('Client connected')
    # Don't emit status message to avoid duplicate notifications
    # emit('status', {'message': 'Connected to ASI Agents Platform'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join_agent')
def handle_join_agent(data):
    agent_id = data.get('agent_id')
    if agent_id:
        join_room(f'agent_{agent_id}')
        # Don't emit status message to avoid duplicate notifications
        # emit('status', {'message': f'Joined agent {agent_id}'})

@socketio.on('send_message')
def handle_message(data):
    agent_id = data.get('agent_id')
    message = data.get('message')
    
    if agent_id and message:
        # Process message with intelligent agent responses
        response = process_agent_message(agent_id, message)
        emit('agent_response', {
            'agent_id': agent_id,
            'message': response,
            'timestamp': str(datetime.utcnow())
        }, room=f'agent_{agent_id}')

def process_agent_message(agent_id, message):
    """Process message with intelligent AI responses"""
    from utils.ai_intelligence import ai_intelligence
    
    # Map agent IDs to agent types for AI intelligence service
    agent_type_mapping = {
        'fetch-healthcare-001': 'healthcare',
        'fetch-logistics-002': 'logistics',
        'fetch-finance-003': 'financial',
        'fetch-education-004': 'education',
        'fetch-system-005': 'system',
        'fetch-research-006': 'research'
    }
    
    agent_type = agent_type_mapping.get(agent_id, 'healthcare')
    
    try:
        # Use AI intelligence service for real AI responses
        response = ai_intelligence.generate_response(agent_type, message)
        return response
    except Exception as e:
        logger.log_error(e, f"Failed to generate AI response for agent {agent_id}")
        # Fallback response
        return f"I'm here to help! I'm processing your message: '{message}'. Let me provide you with detailed assistance."

# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'ASI Agents Platform is running',
        'version': '1.0.0'
    })

@app.route('/api/discover-agents')
def discover_agents():
    """Discover available agents"""
    try:
        # Return hardcoded agents for now (matching frontend expectations)
        agents = [
            {
                "id": "healthcare-agent",
                "name": "Healthcare Assistant",
                "address": "agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl",
                "status": "active",
                "capabilities": [
                    "Medical Analysis",
                    "Symptom Checker", 
                    "Treatment Planning",
                    "Drug Interaction Check",
                    "MeTTa Knowledge Graph",
                    "ASI:One Integration",
                    "HTTP API"
                ],
                "lastSeen": datetime.now().isoformat(),
                "description": "AI-powered medical diagnosis and treatment recommendations with MeTTa Knowledge Graph and ASI:One integration. Currently running on port 8002."
            },
            {
                "id": "logistics-agent",
                "name": "Logistics Coordinator",
                "address": "agent1q09g48srfjc74zzlr80ag93qaaev7ue9vhgl2u3jgykca0trwm2hxpw66jl",
                "status": "inactive",
                "capabilities": [
                    "Route Optimization",
                    "Inventory Management",
                    "Delivery Tracking",
                    "Supply Chain Analysis",
                    "MeTTa Knowledge Graph",
                    "ASI:One Integration"
                ],
                "lastSeen": datetime.now().isoformat(),
                "description": "Supply chain optimization and delivery management with enhanced AI capabilities. Coming soon."
            },
            {
                "id": "financial-agent",
                "name": "Financial Advisor",
                "address": "agent1qtm6dj5n89vjda5adz223x7t7pdzle3rskugery36w4en3je67whkuke606",
                "status": "inactive",
                "capabilities": [
                    "Portfolio Management",
                    "Risk Assessment",
                    "DeFi Integration",
                    "Market Analysis",
                    "MeTTa Knowledge Graph",
                    "ASI:One Integration"
                ],
                "lastSeen": datetime.now().isoformat(),
                "description": "DeFi protocol integration and investment strategies with advanced AI reasoning. Coming soon."
            }
        ]
        
        return jsonify(agents)
        
    except Exception as e:
        logger.log_error(e, "Agent discovery failed")
        return jsonify({"error": str(e)}), 500

# Authentication Endpoints
@app.route('/api/auth/profile', methods=['GET'])
def get_profile():
    """Get user profile information"""
    try:
        # Mock profile data for now - in production, this would verify JWT token
        profile = {
            "id": "user-123",
            "username": "ademola",
            "email": "ademolaadesinadev@gmail.com",
            "wallet_address": "0x6c28bd74cb9106f6a58708542a177025d44e5a31",
            "member_since": "2024-10-18T00:00:00Z",
            "role": "user"
        }
        
        return jsonify({"user": profile})
        
    except Exception as e:
        logger.log_error(e, "Failed to get user profile")
        return jsonify({"error": str(e)}), 500

# Authentication endpoints are handled by auth_bp blueprint

@app.route('/api/auth/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        # Mock registration - in production, this would create user account
        if username and email and password:
            return jsonify({
                "status": "success",
                "message": "User registered successfully",
                "user": {
                    "id": "user-" + str(int(datetime.now().timestamp())),
                    "username": username,
                    "email": email
                }
            })
        else:
            return jsonify({"error": "Username, email, and password are required"}), 400
            
    except Exception as e:
        logger.log_error(e, "Failed to register user")
        return jsonify({"error": str(e)}), 500

# Multi-Agent Communication Endpoints
@app.route('/api/multi-agent/communications', methods=['GET'])
def get_communications():
    """Get multi-agent communication logs"""
    try:
        # Mock data for now - in production, this would query the database
        communications = [
            {
                "id": "comm-1",
                "agents": ["Healthcare Assistant", "Financial Advisor"],
                "messages": [
                    {
                        "id": "msg-1",
                        "fromAgent": "Healthcare Assistant",
                        "toAgent": "Financial Advisor",
                        "message": "User needs health insurance advice for chronic condition",
                        "timestamp": "2024-10-19T10:30:00Z",
                        "type": "forward"
                    },
                    {
                        "id": "msg-2",
                        "fromAgent": "Financial Advisor",
                        "toAgent": "Healthcare Assistant",
                        "message": "I can help with health insurance options. What specific coverage do they need?",
                        "timestamp": "2024-10-19T10:30:15Z",
                        "type": "response"
                    }
                ],
                "status": "active",
                "createdAt": "2024-10-19T10:30:00Z"
            },
            {
                "id": "comm-2",
                "agents": ["Logistics Coordinator", "Healthcare Assistant"],
                "messages": [
                    {
                        "id": "msg-3",
                        "fromAgent": "Logistics Coordinator",
                        "toAgent": "Healthcare Assistant",
                        "message": "Need to optimize delivery routes for medical supplies",
                        "timestamp": "2024-10-19T09:45:00Z",
                        "type": "initiate"
                    },
                    {
                        "id": "msg-4",
                        "fromAgent": "Healthcare Assistant",
                        "toAgent": "Logistics Coordinator",
                        "message": "I can provide medical supply requirements and priority levels",
                        "timestamp": "2024-10-19T09:45:30Z",
                        "type": "response"
                    }
                ],
                "status": "completed",
                "createdAt": "2024-10-19T09:45:00Z"
            },
            {
                "id": "comm-3",
                "agents": ["Financial Advisor", "Logistics Coordinator"],
                "messages": [
                    {
                        "id": "msg-5",
                        "fromAgent": "Financial Advisor",
                        "toAgent": "Logistics Coordinator",
                        "message": "Budget analysis needed for Q4 logistics operations",
                        "timestamp": "2024-10-19T11:15:00Z",
                        "type": "initiate"
                    }
                ],
                "status": "pending",
                "createdAt": "2024-10-19T11:15:00Z"
            }
        ]
        
        return jsonify(communications)
        
    except Exception as e:
        logger.log_error(e, "Failed to get communications")
        return jsonify({"error": str(e)}), 500

@app.route('/api/multi-agent/start-monitoring', methods=['POST'])
def start_monitoring():
    """Start multi-agent communication monitoring"""
    try:
        # In production, this would start actual monitoring
        logger.log_event('INFO', 'monitoring_started', {'service': 'multi_agent'})
        return jsonify({"status": "success", "message": "Monitoring started"})
        
    except Exception as e:
        logger.log_error(e, "Failed to start monitoring")
        return jsonify({"error": str(e)}), 500

@app.route('/api/multi-agent/stop-monitoring', methods=['POST'])
def stop_monitoring():
    """Stop multi-agent communication monitoring"""
    try:
        # In production, this would stop actual monitoring
        logger.log_event('INFO', 'monitoring_stopped', {'service': 'multi_agent'})
        return jsonify({"status": "success", "message": "Monitoring stopped"})
        
    except Exception as e:
        logger.log_error(e, "Failed to stop monitoring")
        return jsonify({"error": str(e)}), 500

# Agentverse Registry Endpoints
@app.route('/api/agentverse/agents', methods=['GET'])
def get_agentverse_agents():
    """Get all registered agents from Agentverse"""
    try:
        # Mock data for now - in production, this would query Agentverse API
        agents = [
            {
                "id": "healthcare-agent",
                "name": "Healthcare Assistant",
                "address": "agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl",
                "status": "active",
                "capabilities": ["Medical Analysis", "Symptom Checker", "Treatment Planning", "Drug Interaction Check"],
                "description": "AI-powered medical diagnosis and treatment recommendations with MeTTa Knowledge Graph and ASI:One integration.",
                "registeredAt": "2024-10-15T08:00:00Z",
                "lastSeen": "2024-10-19T10:30:00Z"
            },
            {
                "id": "financial-agent",
                "name": "Financial Advisor",
                "address": "agent1qtm6dj5n89vjda5adz223x7t7pdzle3rskugery36w4en3je67whkuke606",
                "status": "inactive",
                "capabilities": ["Portfolio Management", "Risk Assessment", "DeFi Integration", "Market Analysis"],
                "description": "DeFi protocol integration and investment strategies with advanced AI reasoning.",
                "registeredAt": "2024-10-16T09:00:00Z",
                "lastSeen": "2024-10-18T15:45:00Z"
            }
        ]
        
        return jsonify(agents)
        
    except Exception as e:
        logger.log_error(e, "Failed to get Agentverse agents")
        return jsonify({"error": str(e)}), 500

@app.route('/api/agentverse/register', methods=['POST'])
def register_agent():
    """Register a new agent with Agentverse"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name') or not data.get('description'):
            return jsonify({"error": "Name and description are required"}), 400
        
        # Mock registration - in production, this would call Agentverse API
        agent = {
            "id": f"agent-{datetime.now().timestamp()}",
            "name": data['name'],
            "address": f"agent1q{datetime.now().timestamp()}...",
            "status": "pending",
            "capabilities": data.get('capabilities', []),
            "description": data['description'],
            "registeredAt": datetime.now().isoformat(),
            "lastSeen": datetime.now().isoformat()
        }
        
        logger.log_event('INFO', 'agent_registered', {'agent_name': agent['name'], 'agent_id': agent['id']})
        return jsonify({"status": "success", "agent": agent})
        
    except Exception as e:
        logger.log_error(e, "Failed to register agent")
        return jsonify({"error": str(e)}), 500

@app.route('/api/agentverse/agents/<agent_id>/status', methods=['PUT'])
def update_agent_status(agent_id):
    """Update agent status"""
    try:
        data = request.get_json()
        status = data.get('status')
        
        if status not in ['active', 'inactive']:
            return jsonify({"error": "Invalid status"}), 400
        
        # Mock update - in production, this would update the database
        logger.log_event('INFO', 'agent_status_updated', {'agent_id': agent_id, 'status': status})
        return jsonify({"status": "success", "message": f"Agent {agent_id} status updated to {status}"})
        
    except Exception as e:
        logger.log_error(e, f"Failed to update agent status for {agent_id}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/agentverse/agents/<agent_id>', methods=['DELETE'])
def delete_agent(agent_id):
    """Delete an agent"""
    try:
        # Mock deletion - in production, this would remove from database
        logger.log_event('INFO', 'agent_deleted', {'agent_id': agent_id})
        return jsonify({"status": "success", "message": f"Agent {agent_id} deleted successfully"})
        
    except Exception as e:
        logger.log_error(e, f"Failed to delete agent {agent_id}")
        return jsonify({"error": str(e)}), 500

# Agent Coordinator Endpoints
@app.route('/api/coordinator/agents', methods=['GET'])
def get_coordinator_agents():
    """Get agent coordination data"""
    try:
        # Mock data for now - in production, this would query the agent registry
        agents = [
            {
                "id": "healthcare-agent",
                "name": "Healthcare Assistant",
                "address": "agent1qgkvje3s0e9vsu7s5dcxf8d8rrw2z3y77dcyzmzjk8s6p6n3ekwlxzjl3vl",
                "port": 8001,
                "status": "running",
                "capabilities": ["medical_consultation", "health_check", "symptom_analysis", "MeTTa Knowledge Graph", "ASI:One Integration", "Chat Protocol"],
                "routingRules": [
                    {"id": "rule-1", "condition": "financial_query", "targetAgent": "financial-agent", "priority": 1, "enabled": True},
                    {"id": "rule-2", "condition": "logistics_query", "targetAgent": "logistics-agent", "priority": 2, "enabled": True}
                ],
                "healthScore": 95,
                "lastPing": "2024-10-19T10:30:00Z"
            },
            {
                "id": "financial-agent",
                "name": "Financial Advisor",
                "address": "agent1qtm6dj5n89vjda5adz223x7t7pdzle3rskugery36w4en3je67whkuke606",
                "port": 8003,
                "status": "running",
                "capabilities": ["financial_consultation", "market_analysis", "investment_advice", "MeTTa Knowledge Graph", "ASI:One Integration", "Chat Protocol"],
                "routingRules": [
                    {"id": "rule-3", "condition": "health_query", "targetAgent": "healthcare-agent", "priority": 1, "enabled": True},
                    {"id": "rule-4", "condition": "logistics_query", "targetAgent": "logistics-agent", "priority": 2, "enabled": True}
                ],
                "healthScore": 90,
                "lastPing": "2024-10-19T10:30:00Z"
            },
            {
                "id": "logistics-agent",
                "name": "Logistics Coordinator",
                "address": "agent1q09g48srfjc74zzlr80ag93qaaev7ue9vhgl2u3jgykca0trwm2hxpw66jl",
                "port": 8002,
                "status": "running",
                "capabilities": ["route_optimization", "inventory_management", "delivery_tracking", "supply_chain_analysis", "MeTTa Knowledge Graph", "ASI:One Integration", "Chat Protocol"],
                "routingRules": [
                    {"id": "rule-5", "condition": "health_query", "targetAgent": "healthcare-agent", "priority": 1, "enabled": True},
                    {"id": "rule-6", "condition": "financial_query", "targetAgent": "financial-agent", "priority": 2, "enabled": True}
                ],
                "healthScore": 88,
                "lastPing": "2024-10-19T10:30:00Z"
            }
        ]
        
        return jsonify(agents)
        
    except Exception as e:
        logger.log_error(e, "Failed to get coordinator agents")
        return jsonify({"error": str(e)}), 500

@app.route('/api/coordinator/agents/<agent_id>/start', methods=['POST'])
def start_agent(agent_id):
    """Start an agent"""
    try:
        # Mock start - in production, this would start the actual agent
        logger.log_event('INFO', 'agent_started', {'agent_id': agent_id})
        return jsonify({"status": "success", "message": f"Agent {agent_id} started"})
        
    except Exception as e:
        logger.log_error(e, f"Failed to start agent {agent_id}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/coordinator/agents/<agent_id>/stop', methods=['POST'])
def stop_agent(agent_id):
    """Stop an agent"""
    try:
        # Mock stop - in production, this would stop the actual agent
        logger.log_event('INFO', 'agent_stopped', {'agent_id': agent_id})
        return jsonify({"status": "success", "message": f"Agent {agent_id} stopped"})
        
    except Exception as e:
        logger.log_error(e, f"Failed to stop agent {agent_id}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/coordinator/flows', methods=['GET'])
def get_communication_flows():
    """Get communication flows between agents"""
    try:
        # Mock data for now
        flows = [
            {
                "id": "flow-1",
                "fromAgent": "Healthcare Assistant",
                "toAgent": "Financial Advisor",
                "messageType": "forward",
                "frequency": 12,
                "lastActivity": "2024-10-19T10:30:00Z"
            },
            {
                "id": "flow-2",
                "fromAgent": "Logistics Coordinator",
                "toAgent": "Healthcare Assistant",
                "messageType": "query",
                "frequency": 8,
                "lastActivity": "2024-10-19T09:15:00Z"
            }
        ]
        
        return jsonify(flows)
        
    except Exception as e:
        logger.log_error(e, "Failed to get communication flows")
        return jsonify({"error": str(e)}), 500

# MeTTa Knowledge Graph Query Endpoint
@app.route('/api/knowledge/metta-query', methods=['POST'])
def metta_query():
    """Execute MeTTa Knowledge Graph query"""
    try:
        data = request.get_json()
        query = data.get('query')
        format_type = data.get('format', 'structured')
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
        
        # Import MeTTa integration
        from knowledge.metta_kg.integration import MeTTaKnowledgeGraph
        
        # Initialize MeTTa
        kg = MeTTaKnowledgeGraph()
        
        # Execute query
        result = kg.query(query)
        
        # Format response based on request
        if format_type == 'structured':
            # Structure the response for frontend consumption
            structured_result = {
                'query': query,
                'timestamp': datetime.now().isoformat(),
                'concepts': [],
                'relationships': [],
                'raw_result': result
            }
            
            # Extract concepts if available
            if isinstance(result, list) and len(result) > 0:
                for item in result:
                    if isinstance(item, dict):
                        if 'concept' in item or 'name' in item:
                            structured_result['concepts'].append({
                                'name': item.get('concept') or item.get('name', 'Unknown'),
                                'definition': item.get('definition', 'No definition available'),
                                'confidence': item.get('confidence', 0.8),
                                'domain': item.get('domain', 'general')
                            })
                        elif 'relationship' in item or 'relation' in item:
                            structured_result['relationships'].append({
                                'from': item.get('from', 'Unknown'),
                                'to': item.get('to', 'Unknown'),
                                'type': item.get('relationship') or item.get('relation', 'related_to'),
                                'strength': item.get('strength', 0.5)
                            })
            
            return jsonify(structured_result)
        else:
            return jsonify({
                'query': query,
                'timestamp': datetime.now().isoformat(),
                'result': result
            })
        
    except Exception as e:
        logger.log_error(e, f"MeTTa query failed: {query}")
        return jsonify({"error": str(e)}), 500

# Learning Analytics Endpoints
@app.route('/api/learning/metrics', methods=['GET'])
def get_learning_metrics():
    """Get learning metrics for all agents"""
    try:
        # Get real data from all agents
        healthcare_metrics = None
        financial_metrics = None
        logistics_metrics = None
        
        # Healthcare Agent (port 8002)
        try:
            response = requests.get('http://localhost:8002/analytics', timeout=2)
            if response.status_code == 200:
                data = response.json()
                logger.log_event('INFO', f"Healthcare agent analytics data: {data}")
                healthcare_metrics = {
                    "agentId": "healthcare-agent",
                    "agentName": "Healthcare Assistant",
                    "interactions": data['metrics']['total_interactions'],
                    "knowledgeUpdates": data['metrics']['total_interactions'] // 10,  # Estimate
                    "accuracy": data['metrics']['success_rate'],
                    "learningRate": 0.15,
                    "lastUpdate": data['metrics']['last_interaction']
                }
                logger.log_event('INFO', f"Processed healthcare metrics: {healthcare_metrics}")
        except Exception as e:
            logger.log_error(e, "Failed to fetch healthcare agent metrics")
        
        # Financial Agent (port 8003)
        try:
            response = requests.get('http://localhost:8003/analytics', timeout=2)
            if response.status_code == 200:
                data = response.json()
                logger.log_event('INFO', f"Financial agent analytics data: {data}")
                financial_metrics = {
                    "agentId": "financial-agent",
                    "agentName": "Financial Advisor",
                    "interactions": data['metrics']['total_interactions'],
                    "knowledgeUpdates": data['metrics'].get('knowledge_updates', 0),
                    "accuracy": data['metrics']['success_rate'],
                    "learningRate": 0.12,
                    "lastUpdate": data['metrics']['last_interaction']
                }
                logger.log_event('INFO', f"Processed financial metrics: {financial_metrics}")
        except Exception as e:
            logger.log_error(e, "Failed to fetch financial agent metrics")
        
        # Logistics Agent (port 8004)
        try:
            response = requests.get('http://localhost:8004/analytics', timeout=2)
            if response.status_code == 200:
                data = response.json()
                logger.log_event('INFO', f"Logistics agent analytics data: {data}")
                logistics_metrics = {
                    "agentId": "logistics-agent",
                    "agentName": "Logistics Coordinator",
                    "interactions": data['metrics']['total_interactions'],
                    "knowledgeUpdates": data['metrics'].get('knowledge_updates', 0),
                    "accuracy": data['metrics']['success_rate'],
                    "learningRate": 0.18,
                    "lastUpdate": data['metrics']['last_interaction']
                }
                logger.log_event('INFO', f"Processed logistics metrics: {logistics_metrics}")
        except Exception as e:
            logger.log_error(e, "Failed to fetch logistics agent metrics")
        
        # Build metrics list with real data
        metrics = []
        
        if healthcare_metrics:
            metrics.append(healthcare_metrics)
        else:
            # Fallback to mock data if healthcare agent is not available
            metrics.append({
                "agentId": "healthcare-agent",
                "agentName": "Healthcare Assistant",
                "interactions": 1247,
                "knowledgeUpdates": 89,
                "accuracy": 94.2,
                "learningRate": 0.15,
                "lastUpdate": "2024-10-19T10:30:00Z"
            })
        
        if financial_metrics:
            metrics.append(financial_metrics)
        else:
            # Show not implemented if financial agent is not available
            metrics.append({
                "agentId": "financial-agent",
                "agentName": "Financial Advisor",
                "interactions": 0,
                "knowledgeUpdates": 0,
                "accuracy": 0.0,
                "learningRate": 0.0,
                "lastUpdate": "Not implemented yet",
                "status": "not_implemented"
            })
        
        if logistics_metrics:
            metrics.append(logistics_metrics)
        else:
            # Show not implemented if logistics agent is not available
            metrics.append({
                "agentId": "logistics-agent",
                "agentName": "Logistics Coordinator",
                "interactions": 0,
                "knowledgeUpdates": 0,
                "accuracy": 0.0,
                "learningRate": 0.0,
                "lastUpdate": "Not implemented yet",
                "status": "not_implemented"
            })
        
        return jsonify(metrics)
        
    except Exception as e:
        logger.log_error(e, "Failed to get learning metrics")
        return jsonify({"error": str(e)}), 500

@app.route('/api/learning/knowledge-updates', methods=['GET'])
def get_knowledge_updates():
    """Get recent knowledge updates"""
    try:
        agent_id = request.args.get('agent_id')
        
        updates = []
        
        # Get real data from healthcare agent if requested or no specific agent
        if not agent_id or agent_id == 'healthcare-agent':
            try:
                response = requests.get('http://localhost:8002/analytics', timeout=2)
                if response.status_code == 200:
                    data = response.json()
                    # Generate knowledge updates based on real interactions
                    if data['metrics']['total_interactions'] > 0:
                        updates.append({
                            "id": "update-real-1",
                            "agentId": "healthcare-agent",
                            "category": "symptoms",
                            "concept": "user_interaction_pattern",
                            "confidence": data['metrics']['success_rate'] / 100,
                            "source": "user_interaction",
                            "timestamp": data['metrics']['last_interaction']
                        })
            except Exception as e:
                logger.log_error(e, "Failed to fetch healthcare agent knowledge updates")
        
        # Add mock data for other agents or if healthcare agent is not available
        if not updates:
            updates = [
                {
                    "id": "update-1",
                    "agentId": "healthcare-agent",
                    "category": "symptoms",
                    "concept": "headache_migraine",
                    "confidence": 0.92,
                    "source": "user_interaction",
                    "timestamp": "2024-10-19T10:30:00Z"
                }
            ]
        
        # Add mock data for other agents
        if not agent_id or agent_id == 'financial-agent':
            updates.append({
                "id": "update-2",
                "agentId": "financial-agent",
                "category": "market_trends",
                "concept": "crypto_volatility",
                "confidence": 0.87,
                "source": "market_data",
                "timestamp": "2024-10-19T09:45:00Z"
            })
        
        # Filter by agent if specified
        if agent_id:
            updates = [u for u in updates if u['agentId'] == agent_id]
        
        return jsonify(updates)
        
    except Exception as e:
        logger.log_error(e, "Failed to get knowledge updates")
        return jsonify({"error": str(e)}), 500

@app.route('/api/learning/patterns', methods=['GET'])
def get_learning_patterns():
    """Get learning patterns"""
    try:
        agent_id = request.args.get('agent_id')
        
        # Mock data for now
        patterns = [
            {
                "id": "pattern-1",
                "pattern": "headache → migraine_diagnosis",
                "frequency": 23,
                "accuracy": 0.91,
                "lastSeen": "2024-10-19T10:30:00Z"
            },
            {
                "id": "pattern-2",
                "pattern": "investment_query → risk_assessment",
                "frequency": 18,
                "accuracy": 0.89,
                "lastSeen": "2024-10-19T09:45:00Z"
            }
        ]
        
        # Filter by agent if specified
        if agent_id:
            patterns = [p for p in patterns if agent_id in p['pattern'].lower()]
        
        return jsonify(patterns)
        
    except Exception as e:
        logger.log_error(e, "Failed to get learning patterns")
        return jsonify({"error": str(e)}), 500

@app.route('/api/learning/toggle', methods=['POST'])
def toggle_learning():
    """Toggle dynamic learning on/off"""
    try:
        data = request.get_json()
        is_active = data.get('isActive', True)
        
        # Mock toggle - in production, this would update the learning system
        logger.log_event('INFO', 'learning_toggled', {'is_active': is_active})
        return jsonify({"status": "success", "isActive": is_active})
        
    except Exception as e:
        logger.log_error(e, "Failed to toggle learning")
        return jsonify({"error": str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Initialize database with retry logic (non-blocking)
    def init_database():
        max_retries = 3  # Reduced retries for faster startup
        retry_delay = 5  # Reduced delay
        
        for attempt in range(max_retries):
            try:
                with app.app_context():
                    db.create_all()
                print("✅ Database initialized successfully")
                return True
            except Exception as e:
                print(f"❌ Database initialization attempt {attempt + 1}/{max_retries} failed: {e}")
                if attempt < max_retries - 1:
                    print(f"⏳ Retrying in {retry_delay} seconds...")
                    import time
                    time.sleep(retry_delay)
                else:
                    print("❌ Failed to initialize database after all retries. Starting app anyway...")
                    return False
    
    # Start database initialization in background
    import threading
    db_thread = threading.Thread(target=init_database)
    db_thread.daemon = True
    db_thread.start()
    
    # Run the application
    # Check if we're in production (Render sets PORT environment variable)
    port = os.getenv('PORT', 5001)
    print(f"🚀 Starting backend on port {port}")
    
    if os.getenv('PORT'):
        # Production mode - use standard Flask for Render compatibility
        print("🔧 Running in production mode")
        app.run(debug=False, host='0.0.0.0', port=int(port))
    else:
        # Development mode - use SocketIO for local development
        print("🔧 Running in development mode")
        socketio.run(app, debug=True, host='0.0.0.0', port=int(port))
