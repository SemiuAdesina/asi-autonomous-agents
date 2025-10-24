from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.ai_intelligence import ai_intelligence
from utils.logging import logger
from datetime import datetime

generate_bp = Blueprint('generate', __name__)

@generate_bp.route('/generate-response', methods=['POST'])
def generate_response():
    """Generate AI response for agent communication"""
    try:
        data = request.get_json()
        
        if not data or not data.get('prompt'):
            return jsonify({'error': 'Prompt is required'}), 400
        
        prompt = data['prompt']
        agent_type = data.get('agentType', 'general')
        
        # Determine agent type from agentType parameter
        if 'healthcare' in agent_type.lower():
            agent_type = 'healthcare'
        elif 'logistics' in agent_type.lower():
            agent_type = 'logistics'
        elif 'financial' in agent_type.lower():
            agent_type = 'financial'
        else:
            agent_type = 'general'
        
        # Generate AI response
        response = ai_intelligence.generate_response(agent_type, prompt)
        
        # Log the interaction
        logger.log_event('INFO', 'api_response_generated', {
            'agent_type': agent_type,
            'prompt_length': len(prompt),
            'response_length': len(response),
            'timestamp': datetime.utcnow().isoformat()
        })
        
        return jsonify({
            'response': response,
            'agent_type': agent_type,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.log_error(e, 'Failed to generate AI response')
        return jsonify({'error': f'Failed to generate response: {str(e)}'}), 500

@generate_bp.route('/health', methods=['GET'])
def health_check():
    """Health check for generate service"""
    return jsonify({
        'status': 'healthy',
        'service': 'generate-response',
        'timestamp': datetime.utcnow().isoformat()
    }), 200
