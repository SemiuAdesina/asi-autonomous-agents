from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import AgentSession, Agent, User, db
from datetime import datetime
import uuid

sessions_bp = Blueprint('sessions', __name__)

@sessions_bp.route('/', methods=['POST'])
@sessions_bp.route('', methods=['POST'])
@jwt_required()
def create_session():
    """Create a new agent session"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('agent_id'):
        return jsonify({'error': 'Agent ID is required'}), 400
    
    agent_id = data['agent_id']
    
    try:
        # Verify agent exists
        agent = Agent.query.get(agent_id)
        if not agent:
            return jsonify({'error': 'Agent not found'}), 404
        
        # Check if user has permission to create session with this agent
        if agent.owner_id and agent.owner_id != int(user_id):
            return jsonify({'error': 'Permission denied'}), 403
        
        # Create new session
        session = AgentSession(
            agent_id=agent_id,
            user_id=user_id,
            session_id=str(uuid.uuid4()),
            status='active',
            agent_metadata=data.get('metadata', {})
        )
        
        db.session.add(session)
        db.session.commit()
        
        return jsonify({
            'message': 'Session created successfully',
            'session': {
                'id': session.id,
                'session_id': session.session_id,
                'agent_id': session.agent_id,
                'user_id': session.user_id,
                'status': session.status,
                'started_at': session.started_at.isoformat(),
                'agent_metadata': session.agent_metadata
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create session: {str(e)}'}), 500

@sessions_bp.route('/', methods=['GET'])
@sessions_bp.route('', methods=['GET'])
@jwt_required()
def get_sessions():
    """Get all sessions for the current user"""
    user_id = get_jwt_identity()
    
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        status = request.args.get('status', None)
        agent_id = request.args.get('agent_id', None)
        
        query = AgentSession.query.filter_by(user_id=int(user_id))
        
        if status:
            query = query.filter_by(status=status)
        if agent_id:
            query = query.filter_by(agent_id=agent_id)
        
        sessions = query.order_by(AgentSession.started_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'sessions': [{
                'id': session.id,
                'session_id': session.session_id,
                'agent_id': session.agent_id,
                'user_id': session.user_id,
                'status': session.status,
                'started_at': session.started_at.isoformat(),
                'ended_at': session.ended_at.isoformat() if session.ended_at else None,
                'agent_metadata': session.agent_metadata
            } for session in sessions.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': sessions.total,
                'pages': sessions.pages,
                'has_next': sessions.has_next,
                'has_prev': sessions.has_prev
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get sessions: {str(e)}'}), 500

@sessions_bp.route('/<int:session_id>', methods=['GET'])
@jwt_required()
def get_session(session_id):
    """Get a specific session"""
    user_id = get_jwt_identity()
    
    try:
        session = AgentSession.query.get(session_id)
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        # Check if user has permission to view this session
        if session.user_id != int(user_id):
            return jsonify({'error': 'Permission denied'}), 403
        
        return jsonify({
            'session': {
                'id': session.id,
                'session_id': session.session_id,
                'agent_id': session.agent_id,
                'user_id': session.user_id,
                'status': session.status,
                'started_at': session.started_at.isoformat(),
                'ended_at': session.ended_at.isoformat() if session.ended_at else None,
                'agent_metadata': session.agent_metadata
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get session: {str(e)}'}), 500

@sessions_bp.route('/<int:session_id>', methods=['PUT'])
@jwt_required()
def update_session(session_id):
    """Update a session"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        session = AgentSession.query.get(session_id)
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        # Check if user has permission to update this session
        if session.user_id != int(user_id):
            return jsonify({'error': 'Permission denied'}), 403
        
        # Update fields if provided
        if 'status' in data:
            session.status = data['status']
            if data['status'] in ['ended', 'timeout'] and not session.ended_at:
                session.ended_at = datetime.utcnow()
        
        if 'agent_metadata' in data:
            session.agent_metadata = data['agent_metadata']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Session updated successfully',
            'session': {
                'id': session.id,
                'session_id': session.session_id,
                'agent_id': session.agent_id,
                'user_id': session.user_id,
                'status': session.status,
                'started_at': session.started_at.isoformat(),
                'ended_at': session.ended_at.isoformat() if session.ended_at else None,
                'agent_metadata': session.agent_metadata
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update session: {str(e)}'}), 500

@sessions_bp.route('/<int:session_id>', methods=['DELETE'])
@jwt_required()
def delete_session(session_id):
    """Delete a session"""
    user_id = get_jwt_identity()
    
    try:
        session = AgentSession.query.get(session_id)
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        # Check if user has permission to delete this session
        if session.user_id != int(user_id):
            return jsonify({'error': 'Permission denied'}), 403
        
        db.session.delete(session)
        db.session.commit()
        
        return jsonify({
            'message': 'Session deleted successfully',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete session: {str(e)}'}), 500

@sessions_bp.route('/active', methods=['GET'])
@jwt_required()
def get_active_sessions():
    """Get all active sessions for the current user"""
    user_id = get_jwt_identity()
    
    try:
        active_sessions = AgentSession.query.filter_by(
            user_id=user_id,
            status='active'
        ).order_by(AgentSession.started_at.desc()).all()
        
        return jsonify({
            'active_sessions': [{
                'id': session.id,
                'session_id': session.session_id,
                'agent_id': session.agent_id,
                'user_id': session.user_id,
                'status': session.status,
                'started_at': session.started_at.isoformat(),
                'agent_metadata': session.agent_metadata
            } for session in active_sessions],
            'count': len(active_sessions),
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get active sessions: {str(e)}'}), 500
