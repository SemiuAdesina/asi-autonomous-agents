from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Message, Agent, db
from datetime import datetime
import uuid

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/', methods=['GET'])
@jwt_required()
def get_messages():
    """Get messages for a specific agent"""
    agent_id = request.args.get('agent_id')
    user_id = get_jwt_identity()
    
    if not agent_id:
        return jsonify({'error': 'Agent ID is required'}), 400
    
    messages = Message.query.filter_by(
        agent_id=agent_id,
        user_id=user_id
    ).order_by(Message.timestamp.asc()).all()
    
    return jsonify([{
        'id': msg.id,
        'content': msg.content,
        'sender_type': msg.sender_type,
        'timestamp': msg.timestamp.isoformat(),
        'message_type': msg.message_type,
        'metadata': msg.metadata
    } for msg in messages]), 200

@messages_bp.route('/', methods=['POST'])
@jwt_required()
def send_message():
    """Send a message to an agent"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('content') or not data.get('agent_id'):
        return jsonify({'error': 'Content and agent_id are required'}), 400
    
    agent = Agent.query.get(data['agent_id'])
    if not agent:
        return jsonify({'error': 'Agent not found'}), 404
    
    # Create user message
    user_message = Message(
        content=data['content'],
        sender_type='user',
        agent_id=data['agent_id'],
        user_id=user_id,
        message_type=data.get('message_type', 'text'),
        metadata=data.get('metadata', {})
    )
    
    db.session.add(user_message)
    db.session.commit()
    
    # Simulate agent response (in real implementation, this would trigger the agent)
    agent_response = Message(
        content=f"Agent {agent.name} received your message: {data['content']}",
        sender_type='agent',
        agent_id=data['agent_id'],
        user_id=user_id,
        message_type='text',
        metadata={'response_time': datetime.utcnow().isoformat()}
    )
    
    db.session.add(agent_response)
    db.session.commit()
    
    return jsonify({
        'message': 'Message sent successfully',
        'user_message_id': user_message.id,
        'agent_response_id': agent_response.id
    }), 201

@messages_bp.route('/<int:message_id>', methods=['GET'])
@jwt_required()
def get_message(message_id):
    """Get a specific message"""
    user_id = get_jwt_identity()
    message = Message.query.filter_by(id=message_id, user_id=user_id).first()
    
    if not message:
        return jsonify({'error': 'Message not found'}), 404
    
    return jsonify({
        'id': message.id,
        'content': message.content,
        'sender_type': message.sender_type,
        'agent_id': message.agent_id,
        'timestamp': message.timestamp.isoformat(),
        'message_type': message.message_type,
        'metadata': message.metadata
    }), 200

@messages_bp.route('/conversation/<int:agent_id>', methods=['GET'])
@jwt_required()
def get_conversation(agent_id):
    """Get conversation history with a specific agent"""
    user_id = get_jwt_identity()
    
    messages = Message.query.filter_by(
        agent_id=agent_id,
        user_id=user_id
    ).order_by(Message.timestamp.asc()).all()
    
    return jsonify([{
        'id': msg.id,
        'content': msg.content,
        'sender_type': msg.sender_type,
        'timestamp': msg.timestamp.isoformat(),
        'message_type': msg.message_type
    } for msg in messages]), 200
