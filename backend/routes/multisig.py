from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.multisig import multisig_manager
from utils.logging import logger
from utils.sanitization import require_sanitized_input, validate_input_schema, InputSanitizer
from datetime import datetime
import json

multisig_bp = Blueprint('multisig', __name__)

# Validation schemas for multisig operations
MULTISIG_SCHEMAS = {
    'create_wallet': {
        'chain': {
            'required': True,
            'type': str,
            'pattern': r'^(ethereum|polygon|solana)$'
        },
        'owners': {
            'required': True,
            'type': list,
            'min_length': 1,
            'max_length': 50
        },
        'threshold': {
            'required': True,
            'type': int,
            'min_value': 1
        },
        'wallet_name': {
            'required': False,
            'type': str,
            'max_length': 100
        }
    },
    'create_transaction': {
        'multisig_address': {
            'required': True,
            'type': str,
            'max_length': 50
        },
        'to_address': {
            'required': True,
            'type': str,
            'max_length': 50
        },
        'value': {
            'required': True,
            'type': str,
            'max_length': 50
        },
        'data': {
            'required': False,
            'type': str,
            'max_length': 1000
        },
        'chain': {
            'required': False,
            'type': str,
            'pattern': r'^(ethereum|polygon|solana)$'
        }
    },
    'approve_transaction': {
        'transaction_id': {
            'required': True,
            'type': str,
            'max_length': 100
        },
        'signature': {
            'required': False,
            'type': str,
            'max_length': 200
        }
    }
}

@multisig_bp.route('/create', methods=['POST'])
@jwt_required()
@require_sanitized_input
@validate_input_schema(MULTISIG_SCHEMAS['create_wallet'])
def create_multisig_wallet():
    """Create a new multi-signature wallet"""
    try:
        data = getattr(g, 'sanitized_data', request.get_json())
        user_id = get_jwt_identity()
        
        # Validate multisig configuration
        is_valid, error_message = multisig_manager.validate_multisig_config(
            data['owners'], data['threshold']
        )
        
        if not is_valid:
            return jsonify({'error': error_message}), 400
        
        # Create multisig wallet
        multisig_wallet = multisig_manager.create_multisig_wallet(
            chain=data['chain'],
            owners=data['owners'],
            threshold=data['threshold'],
            wallet_name=data.get('wallet_name')
        )
        
        # Log wallet creation
        logger.log_event('INFO', 'multisig_wallet_created_by_user', {
            'user_id': user_id,
            'chain': data['chain'],
            'owners_count': len(data['owners']),
            'threshold': data['threshold'],
            'contract_address': multisig_wallet.get('contract_address') or multisig_wallet.get('multisig_account')
        })
        
        return jsonify({
            'message': 'Multi-signature wallet created successfully',
            'wallet': multisig_wallet
        }), 201
        
    except Exception as e:
        logger.log_error(e, "Failed to create multisig wallet")
        return jsonify({'error': 'Failed to create multi-signature wallet'}), 500

@multisig_bp.route('/transaction', methods=['POST'])
@jwt_required()
@require_sanitized_input
@validate_input_schema(MULTISIG_SCHEMAS['create_transaction'])
def create_transaction():
    """Create a transaction for multi-signature approval"""
    try:
        data = getattr(g, 'sanitized_data', request.get_json())
        user_id = get_jwt_identity()
        
        # Create transaction
        transaction = multisig_manager.create_transaction(
            multisig_address=data['multisig_address'],
            to_address=data['to_address'],
            value=data['value'],
            data=data.get('data', '0x'),
            chain=data.get('chain', 'ethereum')
        )
        
        # Log transaction creation
        logger.log_event('INFO', 'multisig_transaction_created_by_user', {
            'user_id': user_id,
            'transaction_id': transaction['transaction_id'],
            'multisig_address': data['multisig_address'],
            'to_address': data['to_address'],
            'value': data['value']
        })
        
        return jsonify({
            'message': 'Transaction created successfully',
            'transaction': transaction
        }), 201
        
    except Exception as e:
        logger.log_error(e, "Failed to create multisig transaction")
        return jsonify({'error': 'Failed to create transaction'}), 500

@multisig_bp.route('/transaction/<transaction_id>/approve', methods=['POST'])
@jwt_required()
@require_sanitized_input
@validate_input_schema(MULTISIG_SCHEMAS['approve_transaction'])
def approve_transaction(transaction_id):
    """Approve a multi-signature transaction"""
    try:
        data = getattr(g, 'sanitized_data', request.get_json())
        user_id = get_jwt_identity()
        
        # Get user's wallet address (in real implementation, get from user profile)
        approver_address = data.get('approver_address', f"0x{user_id:040d}")
        
        # Approve transaction
        approval = multisig_manager.approve_transaction(
            transaction_id=transaction_id,
            approver=approver_address,
            signature=data.get('signature')
        )
        
        # Log approval
        logger.log_event('INFO', 'multisig_transaction_approved_by_user', {
            'user_id': user_id,
            'transaction_id': transaction_id,
            'approver': approver_address
        })
        
        return jsonify({
            'message': 'Transaction approved successfully',
            'approval': approval
        }), 200
        
    except Exception as e:
        logger.log_error(e, f"Failed to approve transaction {transaction_id}")
        return jsonify({'error': 'Failed to approve transaction'}), 500

@multisig_bp.route('/transaction/<transaction_id>/reject', methods=['POST'])
@jwt_required()
@require_sanitized_input
def reject_transaction(transaction_id):
    """Reject a multi-signature transaction"""
    try:
        data = getattr(g, 'sanitized_data', request.get_json())
        user_id = get_jwt_identity()
        
        # Get user's wallet address
        rejector_address = data.get('rejector_address', f"0x{user_id:040d}")
        
        # Reject transaction
        rejection = multisig_manager.reject_transaction(
            transaction_id=transaction_id,
            rejector=rejector_address,
            reason=data.get('reason')
        )
        
        # Log rejection
        logger.log_event('WARNING', 'multisig_transaction_rejected_by_user', {
            'user_id': user_id,
            'transaction_id': transaction_id,
            'rejector': rejector_address,
            'reason': data.get('reason')
        })
        
        return jsonify({
            'message': 'Transaction rejected successfully',
            'rejection': rejection
        }), 200
        
    except Exception as e:
        logger.log_error(e, f"Failed to reject transaction {transaction_id}")
        return jsonify({'error': 'Failed to reject transaction'}), 500

@multisig_bp.route('/wallet/<multisig_address>/status', methods=['GET'])
@jwt_required()
def get_wallet_status(multisig_address):
    """Get status of a multi-signature wallet"""
    try:
        chain = request.args.get('chain', 'ethereum')
        
        # Get wallet status
        status = multisig_manager.get_multisig_status(multisig_address, chain)
        
        return jsonify({
            'wallet_status': status
        }), 200
        
    except Exception as e:
        logger.log_error(e, f"Failed to get wallet status for {multisig_address}")
        return jsonify({'error': 'Failed to get wallet status'}), 500

@multisig_bp.route('/wallet/<multisig_address>/history', methods=['GET'])
@jwt_required()
def get_transaction_history(multisig_address):
    """Get transaction history for a multi-signature wallet"""
    try:
        limit = int(request.args.get('limit', 50))
        
        # Get transaction history
        history = multisig_manager.get_transaction_history(multisig_address, limit)
        
        return jsonify({
            'transaction_history': history,
            'count': len(history)
        }), 200
        
    except Exception as e:
        logger.log_error(e, f"Failed to get transaction history for {multisig_address}")
        return jsonify({'error': 'Failed to get transaction history'}), 500

@multisig_bp.route('/wallet/<multisig_address>/add-owner', methods=['POST'])
@jwt_required()
@require_sanitized_input
def add_owner(multisig_address):
    """Add a new owner to multi-signature wallet"""
    try:
        data = getattr(g, 'sanitized_input', request.get_json())
        user_id = get_jwt_identity()
        
        new_owner = InputSanitizer.sanitize_text(data.get('new_owner'))
        chain = data.get('chain', 'ethereum')
        
        if not new_owner:
            return jsonify({'error': 'New owner address is required'}), 400
        
        # Add owner
        result = multisig_manager.add_owner(
            multisig_address=multisig_address,
            new_owner=new_owner,
            approver=f"0x{user_id:040d}",
            chain=chain
        )
        
        # Log owner addition
        logger.log_event('INFO', 'multisig_owner_added_by_user', {
            'user_id': user_id,
            'multisig_address': multisig_address,
            'new_owner': new_owner
        })
        
        return jsonify({
            'message': 'Owner addition initiated successfully',
            'result': result
        }), 200
        
    except Exception as e:
        logger.log_error(e, f"Failed to add owner to {multisig_address}")
        return jsonify({'error': 'Failed to add owner'}), 500

@multisig_bp.route('/wallet/<multisig_address>/remove-owner', methods=['POST'])
@jwt_required()
@require_sanitized_input
def remove_owner(multisig_address):
    """Remove an owner from multi-signature wallet"""
    try:
        data = getattr(g, 'sanitized_input', request.get_json())
        user_id = get_jwt_identity()
        
        owner_to_remove = InputSanitizer.sanitize_text(data.get('owner_to_remove'))
        chain = data.get('chain', 'ethereum')
        
        if not owner_to_remove:
            return jsonify({'error': 'Owner address to remove is required'}), 400
        
        # Remove owner
        result = multisig_manager.remove_owner(
            multisig_address=multisig_address,
            owner_to_remove=owner_to_remove,
            approver=f"0x{user_id:040d}",
            chain=chain
        )
        
        # Log owner removal
        logger.log_event('INFO', 'multisig_owner_removed_by_user', {
            'user_id': user_id,
            'multisig_address': multisig_address,
            'owner_removed': owner_to_remove
        })
        
        return jsonify({
            'message': 'Owner removal initiated successfully',
            'result': result
        }), 200
        
    except Exception as e:
        logger.log_error(e, f"Failed to remove owner from {multisig_address}")
        return jsonify({'error': 'Failed to remove owner'}), 500

@multisig_bp.route('/wallet/<multisig_address>/change-threshold', methods=['POST'])
@jwt_required()
@require_sanitized_input
def change_threshold(multisig_address):
    """Change the threshold for multi-signature wallet"""
    try:
        data = getattr(g, 'sanitized_input', request.get_json())
        user_id = get_jwt_identity()
        
        new_threshold = data.get('new_threshold')
        chain = data.get('chain', 'ethereum')
        
        if not new_threshold or not isinstance(new_threshold, int):
            return jsonify({'error': 'Valid new threshold is required'}), 400
        
        # Change threshold
        result = multisig_manager.change_threshold(
            multisig_address=multisig_address,
            new_threshold=new_threshold,
            approver=f"0x{user_id:040d}",
            chain=chain
        )
        
        # Log threshold change
        logger.log_event('INFO', 'multisig_threshold_changed_by_user', {
            'user_id': user_id,
            'multisig_address': multisig_address,
            'new_threshold': new_threshold
        })
        
        return jsonify({
            'message': 'Threshold change initiated successfully',
            'result': result
        }), 200
        
    except Exception as e:
        logger.log_error(e, f"Failed to change threshold for {multisig_address}")
        return jsonify({'error': 'Failed to change threshold'}), 500

@multisig_bp.route('/supported-chains', methods=['GET'])
def get_supported_chains():
    """Get list of supported blockchain networks"""
    return jsonify({
        'supported_chains': multisig_manager.supported_chains,
        'capabilities': {
            'ethereum': [
                'Gnosis Safe integration',
                'ERC-20 token support',
                'Gas optimization',
                'Owner management'
            ],
            'polygon': [
                'Low-cost transactions',
                'EVM compatibility',
                'Fast confirmations',
                'Gas optimization'
            ],
            'solana': [
                'SPL token support',
                'Program upgrades',
                'Fast transactions',
                'Low fees'
            ]
        }
    }), 200
