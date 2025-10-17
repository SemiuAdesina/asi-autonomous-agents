from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Agent, Message, AgentSession, db
from datetime import datetime
import uuid

agents_bp = Blueprint('agents', __name__)

@agents_bp.route('/', methods=['GET', 'POST'])
def agents():
    """Get all available agents or create a new agent"""
    if request.method == 'GET':
        agents = Agent.query.all()
        
        return jsonify([{
            'id': agent.id,
            'name': agent.name,
            'address': agent.address,
            'description': agent.description,
            'capabilities': agent.capabilities,
            'status': agent.status,
            'agent_type': agent.agent_type,
            'last_seen': agent.last_seen.isoformat() if agent.last_seen else None,
            'created_at': agent.created_at.isoformat()
        } for agent in agents]), 200
    
    elif request.method == 'POST':
        # Create new agent (requires authentication)
        if not request.headers.get('Authorization'):
            return jsonify({'error': 'Authorization required'}), 401
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        required_fields = ['name', 'address', 'description', 'agent_type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if agent with same address already exists
        existing_agent = Agent.query.filter_by(address=data['address']).first()
        if existing_agent:
            return jsonify({'error': 'Agent with this address already exists'}), 400
        
        agent = Agent(
            name=data['name'],
            address=data['address'],
            description=data['description'],
            capabilities=data.get('capabilities', []),
            agent_type=data['agent_type'],
            status=data.get('status', 'inactive')
        )
        
        db.session.add(agent)
        db.session.commit()
        
        return jsonify({
            'id': agent.id,
            'name': agent.name,
            'address': agent.address,
            'description': agent.description,
            'capabilities': agent.capabilities,
            'status': agent.status,
            'agent_type': agent.agent_type,
            'created_at': agent.created_at.isoformat()
        }), 201

@agents_bp.route('/<int:agent_id>', methods=['GET'])
def get_agent(agent_id):
    """Get specific agent details"""
    agent = Agent.query.get(agent_id)
    
    if not agent:
        return jsonify({'error': 'Agent not found'}), 404
    
    return jsonify({
        'id': agent.id,
        'name': agent.name,
        'address': agent.address,
        'description': agent.description,
        'capabilities': agent.capabilities,
        'status': agent.status,
        'agent_type': agent.agent_type,
        'last_seen': agent.last_seen.isoformat() if agent.last_seen else None,
        'created_at': agent.created_at.isoformat(),
        'metadata': agent.agent_metadata
    }), 200

@agents_bp.route('/connect', methods=['POST'])
@jwt_required()
def connect_agent():
    """Connect to an agent"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('agent_id'):
        return jsonify({'error': 'Agent ID is required'}), 400
    
    agent = Agent.query.get(data['agent_id'])
    
    if not agent:
        return jsonify({'error': 'Agent not found'}), 404
    
    if agent.status != 'active':
        return jsonify({'error': 'Agent is not available'}), 400
    
    # Create new session
    session_id = str(uuid.uuid4())
    session = AgentSession(
        agent_id=agent.id,
        user_id=user_id,
        session_id=session_id,
        status='active'
    )
    
    db.session.add(session)
    db.session.commit()
    
    return jsonify({
        'message': 'Connected to agent successfully',
        'session_id': session_id,
        'agent_id': agent.id,
        'agent_name': agent.name
    }), 200

@agents_bp.route('/disconnect', methods=['POST'])
@jwt_required()
def disconnect_agent():
    """Disconnect from an agent"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('session_id'):
        return jsonify({'error': 'Session ID is required'}), 400
    
    session = AgentSession.query.filter_by(
        session_id=data['session_id'],
        user_id=user_id,
        status='active'
    ).first()
    
    if not session:
        return jsonify({'error': 'Active session not found'}), 404
    
    # End the session
    session.status = 'ended'
    session.ended_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Disconnected from agent successfully',
        'session_id': session.session_id
    }), 200

@agents_bp.route('/status', methods=['GET'])
def get_agent_status():
    """Get status of all agents"""
    agents = Agent.query.all()
    
    status_data = []
    for agent in agents:
        # Count active sessions
        active_sessions = AgentSession.query.filter_by(
            agent_id=agent.id,
            status='active'
        ).count()
        
        status_data.append({
            'agent_id': agent.id,
            'name': agent.name,
            'status': agent.status,
            'active_sessions': active_sessions,
            'last_seen': agent.last_seen.isoformat() if agent.last_seen else None
        })
    
    return jsonify(status_data), 200

@agents_bp.route('/deploy', methods=['POST'])
@jwt_required()
def deploy_agent():
    """Deploy a new agent (admin only)"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('address'):
        return jsonify({'error': 'Name and address are required'}), 400
    
    # Check if agent address already exists
    if Agent.query.filter_by(address=data['address']).first():
        return jsonify({'error': 'Agent address already exists'}), 400
    
    # Create new agent
    agent = Agent(
        name=data['name'],
        address=data['address'],
        description=data.get('description'),
        capabilities=data.get('capabilities', []),
        agent_type=data.get('agent_type', 'general'),
        owner_id=user_id,
        agent_metadata=data.get('metadata', {})
    )
    
    db.session.add(agent)
    db.session.commit()
    
    return jsonify({
        'message': 'Agent deployed successfully',
        'agent_id': agent.id,
        'name': agent.name,
        'address': agent.address
    }), 201

@agents_bp.route('/<int:agent_id>/messages', methods=['GET'])
def get_agent_messages(agent_id):
    """Get messages for a specific agent"""
    agent = Agent.query.get(agent_id)
    
    if not agent:
        return jsonify({'error': 'Agent not found'}), 404
    
    messages = Message.query.filter_by(agent_id=agent_id).order_by(Message.timestamp.desc()).all()
    
    return jsonify([{
        'id': message.id,
        'content': message.content,
        'sender_type': message.sender_type,
        'timestamp': message.timestamp.isoformat() if message.timestamp else None,
        'message_type': message.message_type
    } for message in messages]), 200

@agents_bp.route('/<int:agent_id>/stats', methods=['GET'])
def get_agent_stats(agent_id):
    """Get statistics for a specific agent"""
    agent = Agent.query.get(agent_id)
    
    if not agent:
        return jsonify({'error': 'Agent not found'}), 404
    
    # Count messages and sessions
    total_messages = Message.query.filter_by(agent_id=agent_id).count()
    total_sessions = AgentSession.query.filter_by(agent_id=agent_id).count()
    
    return jsonify({
        'agent_id': agent_id,
        'agent_name': agent.name,
        'total_messages': total_messages,
        'total_sessions': total_sessions,
        'status': agent.status,
        'last_seen': agent.last_seen.isoformat() if agent.last_seen else None
    }), 200

@agents_bp.route('/<int:agent_id>', methods=['PUT'])
@jwt_required()
def update_agent(agent_id):
    """Update an agent"""
    agent = Agent.query.get(agent_id)
    
    if not agent:
        return jsonify({'error': 'Agent not found'}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Update fields if provided
    if 'name' in data:
        agent.name = data['name']
    if 'description' in data:
        agent.description = data['description']
    if 'capabilities' in data:
        agent.capabilities = data['capabilities']
    if 'status' in data:
        agent.status = data['status']
    
    db.session.commit()
    
    return jsonify({
        'id': agent.id,
        'name': agent.name,
        'address': agent.address,
        'description': agent.description,
        'capabilities': agent.capabilities,
        'status': agent.status,
        'agent_type': agent.agent_type,
        'last_seen': agent.last_seen.isoformat() if agent.last_seen else None,
        'created_at': agent.created_at.isoformat()
    }), 200

@agents_bp.route('/<int:agent_id>', methods=['DELETE'])
@jwt_required()
def delete_agent(agent_id):
    """Delete an agent"""
    agent = Agent.query.get(agent_id)
    
    if not agent:
        return jsonify({'error': 'Agent not found'}), 404
    
    db.session.delete(agent)
    db.session.commit()
    
    return jsonify({'message': 'Agent deleted successfully'}), 200
