from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Transaction, Agent, User, db
from datetime import datetime
import uuid

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/', methods=['POST'])
@transactions_bp.route('', methods=['POST'])
@jwt_required()
def create_transaction():
    """Create a new transaction record"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    required_fields = ['agent_id', 'transaction_hash', 'transaction_type']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'agent_id, transaction_hash, and transaction_type are required'}), 400
    
    agent_id = data['agent_id']
    
    try:
        # Verify agent exists and user has permission
        agent = Agent.query.get(agent_id)
        if not agent:
            return jsonify({'error': 'Agent not found'}), 404
        
        # Check if user owns the agent or has permission
        if agent.owner_id and agent.owner_id != int(user_id):
            return jsonify({'error': 'Permission denied'}), 403
        
        # Check if transaction hash already exists
        existing_transaction = Transaction.query.filter_by(
            transaction_hash=data['transaction_hash']
        ).first()
        if existing_transaction:
            return jsonify({'error': 'Transaction hash already exists'}), 400
        
        # Create new transaction
        transaction = Transaction(
            agent_id=agent_id,
            transaction_hash=data['transaction_hash'],
            transaction_type=data['transaction_type'],
            status=data.get('status', 'pending'),
            gas_used=data.get('gas_used'),
            gas_price=data.get('gas_price'),
            block_number=data.get('block_number'),
            agent_metadata=data.get('metadata', {})
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Transaction created successfully',
            'transaction': {
                'id': transaction.id,
                'agent_id': transaction.agent_id,
                'transaction_hash': transaction.transaction_hash,
                'transaction_type': transaction.transaction_type,
                'status': transaction.status,
                'gas_used': transaction.gas_used,
                'gas_price': transaction.gas_price,
                'block_number': transaction.block_number,
                'created_at': transaction.created_at.isoformat(),
                'agent_metadata': transaction.agent_metadata
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create transaction: {str(e)}'}), 500

@transactions_bp.route('/', methods=['GET'])
@transactions_bp.route('', methods=['GET'])
@jwt_required()
def get_transactions():
    """Get all transactions for the current user's agents"""
    user_id = get_jwt_identity()
    
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        status = request.args.get('status', None)
        agent_id = request.args.get('agent_id', None)
        transaction_type = request.args.get('transaction_type', None)
        
        # Get user's agents
        user_agents = Agent.query.filter_by(owner_id=int(user_id)).all()
        agent_ids = [agent.id for agent in user_agents]
        
        if not agent_ids:
            return jsonify({
                'transactions': [],
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': 0,
                    'pages': 0,
                    'has_next': False,
                    'has_prev': False
                },
                'timestamp': datetime.utcnow().isoformat()
            }), 200
        
        query = Transaction.query.filter(Transaction.agent_id.in_(agent_ids))
        
        if status:
            query = query.filter_by(status=status)
        if agent_id:
            query = query.filter_by(agent_id=agent_id)
        if transaction_type:
            query = query.filter_by(transaction_type=transaction_type)
        
        transactions = query.order_by(Transaction.created_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'transactions': [{
                'id': transaction.id,
                'agent_id': transaction.agent_id,
                'transaction_hash': transaction.transaction_hash,
                'transaction_type': transaction.transaction_type,
                'status': transaction.status,
                'gas_used': transaction.gas_used,
                'gas_price': transaction.gas_price,
                'block_number': transaction.block_number,
                'created_at': transaction.created_at.isoformat(),
                'agent_metadata': transaction.agent_metadata
            } for transaction in transactions.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': transactions.total,
                'pages': transactions.pages,
                'has_next': transactions.has_next,
                'has_prev': transactions.has_prev
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get transactions: {str(e)}'}), 500

@transactions_bp.route('/<int:transaction_id>', methods=['GET'])
@jwt_required()
def get_transaction(transaction_id):
    """Get a specific transaction"""
    user_id = get_jwt_identity()
    
    try:
        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        # Check if user has permission to view this transaction
        agent = Agent.query.get(transaction.agent_id)
        if not agent or (agent.owner_id and agent.owner_id != int(user_id)):
            return jsonify({'error': 'Permission denied'}), 403
        
        return jsonify({
            'transaction': {
                'id': transaction.id,
                'agent_id': transaction.agent_id,
                'transaction_hash': transaction.transaction_hash,
                'transaction_type': transaction.transaction_type,
                'status': transaction.status,
                'gas_used': transaction.gas_used,
                'gas_price': transaction.gas_price,
                'block_number': transaction.block_number,
                'created_at': transaction.created_at.isoformat(),
                'agent_metadata': transaction.agent_metadata
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get transaction: {str(e)}'}), 500

@transactions_bp.route('/<int:transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction(transaction_id):
    """Update a transaction"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        # Check if user has permission to update this transaction
        agent = Agent.query.get(transaction.agent_id)
        if not agent or (agent.owner_id and agent.owner_id != int(user_id)):
            return jsonify({'error': 'Permission denied'}), 403
        
        # Update fields if provided
        if 'status' in data:
            transaction.status = data['status']
        if 'gas_used' in data:
            transaction.gas_used = data['gas_used']
        if 'gas_price' in data:
            transaction.gas_price = data['gas_price']
        if 'block_number' in data:
            transaction.block_number = data['block_number']
        if 'agent_metadata' in data:
            transaction.agent_metadata = data['agent_metadata']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Transaction updated successfully',
            'transaction': {
                'id': transaction.id,
                'agent_id': transaction.agent_id,
                'transaction_hash': transaction.transaction_hash,
                'transaction_type': transaction.transaction_type,
                'status': transaction.status,
                'gas_used': transaction.gas_used,
                'gas_price': transaction.gas_price,
                'block_number': transaction.block_number,
                'created_at': transaction.created_at.isoformat(),
                'agent_metadata': transaction.agent_metadata
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update transaction: {str(e)}'}), 500

@transactions_bp.route('/agent/<int:agent_id>', methods=['GET'])
@jwt_required()
def get_agent_transactions(agent_id):
    """Get all transactions for a specific agent"""
    user_id = get_jwt_identity()
    
    try:
        # Verify agent exists and user has permission
        agent = Agent.query.get(agent_id)
        if not agent:
            return jsonify({'error': 'Agent not found'}), 404
        
        if agent.owner_id and agent.owner_id != int(user_id):
            return jsonify({'error': 'Permission denied'}), 403
        
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        status = request.args.get('status', None)
        
        query = Transaction.query.filter_by(agent_id=agent_id)
        
        if status:
            query = query.filter_by(status=status)
        
        transactions = query.order_by(Transaction.created_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'transactions': [{
                'id': transaction.id,
                'agent_id': transaction.agent_id,
                'transaction_hash': transaction.transaction_hash,
                'transaction_type': transaction.transaction_type,
                'status': transaction.status,
                'gas_used': transaction.gas_used,
                'gas_price': transaction.gas_price,
                'block_number': transaction.block_number,
                'created_at': transaction.created_at.isoformat(),
                'agent_metadata': transaction.agent_metadata
            } for transaction in transactions.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': transactions.total,
                'pages': transactions.pages,
                'has_next': transactions.has_next,
                'has_prev': transactions.has_prev
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get agent transactions: {str(e)}'}), 500

@transactions_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_transaction_stats():
    """Get transaction statistics for the current user's agents"""
    user_id = get_jwt_identity()
    
    try:
        # Get user's agents
        user_agents = Agent.query.filter_by(owner_id=int(user_id)).all()
        agent_ids = [agent.id for agent in user_agents]
        
        if not agent_ids:
            return jsonify({
                'total_transactions': 0,
                'pending_transactions': 0,
                'confirmed_transactions': 0,
                'failed_transactions': 0,
                'total_gas_used': 0,
                'average_gas_price': 0,
                'transaction_types': {},
                'timestamp': datetime.utcnow().isoformat()
            }), 200
        
        # Get transaction statistics
        total_transactions = Transaction.query.filter(Transaction.agent_id.in_(agent_ids)).count()
        pending_transactions = Transaction.query.filter(
            Transaction.agent_id.in_(agent_ids),
            Transaction.status == 'pending'
        ).count()
        confirmed_transactions = Transaction.query.filter(
            Transaction.agent_id.in_(agent_ids),
            Transaction.status == 'confirmed'
        ).count()
        failed_transactions = Transaction.query.filter(
            Transaction.agent_id.in_(agent_ids),
            Transaction.status == 'failed'
        ).count()
        
        # Gas statistics
        gas_stats = db.session.query(
            db.func.sum(Transaction.gas_used).label('total_gas'),
            db.func.avg(Transaction.gas_price).label('avg_gas_price')
        ).filter(
            Transaction.agent_id.in_(agent_ids),
            Transaction.gas_used.isnot(None)
        ).first()
        
        # Transaction types
        type_stats = db.session.query(
            Transaction.transaction_type,
            db.func.count(Transaction.id).label('count')
        ).filter(Transaction.agent_id.in_(agent_ids)).group_by(
            Transaction.transaction_type
        ).all()
        
        transaction_types = {stat.transaction_type: stat.count for stat in type_stats}
        
        return jsonify({
            'total_transactions': total_transactions,
            'pending_transactions': pending_transactions,
            'confirmed_transactions': confirmed_transactions,
            'failed_transactions': failed_transactions,
            'total_gas_used': int(gas_stats.total_gas or 0),
            'average_gas_price': float(gas_stats.avg_gas_price or 0),
            'transaction_types': transaction_types,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get transaction stats: {str(e)}'}), 500
