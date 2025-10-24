from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Message, Agent, db
from datetime import datetime
import uuid
from utils.ai_intelligence import ai_intelligence, ai_enhanced_response
from utils.logging import log_agent_interaction, logger

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
    
    # Handle string agent IDs
    agent_id = data['agent_id']
    if isinstance(agent_id, str) and not agent_id.isdigit():
        agent_mapping = {
            'healthcare-agent': 1,
            'logistics-agent': 2, 
            'financial-agent': 3
        }
        agent_id = agent_mapping.get(agent_id, 1)
    
    agent = Agent.query.get(agent_id)
    if not agent:
        return jsonify({'error': 'Agent not found'}), 404
    
    # Create user message
    user_message = Message(
        content=data['content'],
        sender_type='user',
        agent_id=agent_id,
        user_id=user_id,
        message_type=data.get('message_type', 'text'),
        metadata=data.get('metadata', {})
    )
    
    db.session.add(user_message)
    db.session.commit()
    
    # Generate intelligent agent response based on agent type
    agent_response_content = generate_agent_response(agent.name, data['content'])
    
    # Analyze user sentiment and intent
    sentiment_analysis = ai_intelligence.analyze_sentiment(data['content'])
    intent_analysis = ai_intelligence.extract_intent(data['content'], agent.agent_type)
    
    # Log agent interaction
    logger.log_agent_event(str(agent.id), 'message_processed', {
        'user_message_length': len(data['content']),
        'agent_type': agent.agent_type,
        'sentiment': sentiment_analysis['sentiment'],
        'intent': intent_analysis['primary_intent']
    })
    
    # Create agent response
    agent_response = Message(
        content=agent_response_content,
        sender_type='agent',
        agent_id=agent_id,
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

def generate_agent_response(agent_name: str, user_message: str) -> str:
    """Generate intelligent responses based on agent type using AI"""
    
    # Determine agent type
    agent_type = 'general'
    if 'healthcare' in agent_name.lower():
        agent_type = 'healthcare'
    elif 'logistics' in agent_name.lower():
        agent_type = 'logistics'
    elif 'financial' in agent_name.lower():
        agent_type = 'financial'
    
    # Use AI intelligence to generate response
    try:
        # Get conversation context (last 5 messages)
        recent_messages = Message.query.filter_by(
            agent_id=Agent.query.filter_by(name=agent_name).first().id
        ).order_by(Message.timestamp.desc()).limit(5).all()
        
        context = {
            'recent_messages': [
                {
                    'content': msg.content,
                    'sender_type': msg.sender_type,
                    'timestamp': msg.timestamp.isoformat()
                } for msg in reversed(recent_messages)
            ],
            'agent_type': agent_type,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Generate AI response
        response = ai_intelligence.generate_response(agent_type, user_message, context)
        
        # Log AI response generation
        logger.log_agent_event(agent_type, 'ai_response_generated', {
            'agent_name': agent_name,
            'user_message_length': len(user_message),
            'response_length': len(response),
            'context_messages': len(context['recent_messages'])
        })
        
        return response
        
    except Exception as e:
        logger.log_error(e, f"AI response generation failed for {agent_name}")
        
        # Fallback to original logic
        return generate_fallback_response(agent_name, user_message)

def generate_fallback_response(agent_name: str, user_message: str) -> str:
    """Fallback response generation"""
    if 'healthcare' in agent_name.lower():
        return f"As a Healthcare Assistant, I understand your concern: '{user_message}'. I can help with medical analysis, symptom checking, and treatment planning. For accurate diagnosis, please consult with a healthcare professional. Based on your query, I recommend maintaining a healthy lifestyle and seeking medical advice if symptoms persist."
    
    elif 'logistics' in agent_name.lower():
        return f"As a Logistics Coordinator, I'll help optimize your logistics for: '{user_message}'. I specialize in route optimization, inventory management, and delivery tracking. Let me analyze your supply chain needs and suggest improvements to reduce costs and improve delivery times."
    
    elif 'financial' in agent_name.lower():
        return f"As a Financial Advisor, I'll analyze your financial query: '{user_message}'. I can help with portfolio management, risk assessment, and DeFi integration. Let me provide investment insights and suggest strategies to optimize your returns while managing risk effectively."
    
    else:
        return f"I understand your message: '{user_message}'. I'm processing this request and will provide detailed assistance. Thank you for reaching out!"

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
