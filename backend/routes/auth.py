from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, verify_jwt_in_request
from models import User, Agent, Message, db
from datetime import datetime
import uuid
import bcrypt
import bleach
import re
from utils.sanitization import require_sanitized_input, validate_input_schema, VALIDATION_SCHEMAS, InputSanitizer
from utils.logging import logger

auth_bp = Blueprint('auth', __name__)

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"\d", password):
        return False, "Password must contain at least one digit"
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character"
    return True, "Password is valid"

def sanitize_input(text):
    """Sanitize user input to prevent XSS"""
    if not text:
        return ""
    # Remove HTML tags and dangerous characters
    return bleach.clean(text, tags=[], strip=True)

def hash_password(password):
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    # Return as string for database storage
    return hashed.decode('utf-8')

def verify_password(password, password_hash):
    """Verify password against hash"""
    # Convert string back to bytes for bcrypt
    if isinstance(password_hash, str):
        password_hash = password_hash.encode('utf-8')
    return bcrypt.checkpw(password.encode('utf-8'), password_hash)

@auth_bp.route('/register', methods=['POST'])
@require_sanitized_input
@validate_input_schema(VALIDATION_SCHEMAS['user_registration'])
def register():
    """Register a new user"""
    data = getattr(g, 'sanitized_data', request.get_json())
    
    # Sanitize inputs using our sanitizer
    username = InputSanitizer.sanitize_username(data['username'])
    email = InputSanitizer.sanitize_email(data['email'])
    password = data['password']
    
    # Validate password strength
    is_valid, message = validate_password(password)
    if not is_valid:
        return jsonify({'error': message}), 400
    
    # Check if user already exists
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # Hash password
    password_hash = hash_password(password)
    
    # Sanitize wallet address if provided
    wallet_address = None
    if data.get('wallet_address'):
        try:
            wallet_address = InputSanitizer.sanitize_wallet_address(data['wallet_address'])
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
    
    # Create new user
    user = User(
        username=username,
        email=email,
        password_hash=password_hash,
        wallet_address=wallet_address
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': 'User created successfully',
        'user_id': user.id,
        'username': user.username
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user with username or email"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username/email and password are required'}), 400
    
    login_identifier = data['username']  # Can be username or email
    password = data['password']
    
    # Try to find user by username first, then by email
    user = User.query.filter_by(username=login_identifier).first()
    if not user:
        user = User.query.filter_by(email=login_identifier).first()
    
    if not user:
        return jsonify({'error': 'Invalid username/email or password'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 403
    
    # Verify password
    if not verify_password(password, user.password_hash):
        return jsonify({'error': 'Invalid username/email or password'}), 401
    
    # Create JWT token
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
        'wallet_address': user.wallet_address
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'wallet_address': user.wallet_address,
        'created_at': user.created_at.isoformat(),
        'is_active': user.is_active
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if 'email' in data:
        user.email = data['email']
    
    if 'wallet_address' in data:
        user.wallet_address = data['wallet_address']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
        'wallet_address': user.wallet_address
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required()
def refresh_token():
    """Refresh JWT token"""
    try:
        # Verify current token is valid
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        
        # Get user to ensure they still exist and are active
        user = User.query.get(current_user_id)
        if not user or not user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 404
        
        # Create new access token
        new_token = create_access_token(identity=str(current_user_id))
        
        return jsonify({
            'message': 'Token refreshed successfully',
            'access_token': new_token,
            'user_id': user.id,
            'username': user.username
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Token refresh failed', 'details': str(e)}), 401

@auth_bp.route('/update-password', methods=['POST'])
@jwt_required()
def update_password():
    """Update user password"""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    if not data or not data.get('currentPassword') or not data.get('newPassword'):
        return jsonify({'error': 'Current password and new password are required'}), 400
    
    current_password = data['currentPassword']
    new_password = data['newPassword']
    
    # Verify current password
    if not verify_password(current_password, user.password_hash):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Validate new password
    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters long'}), 400
    
    # Update password
    user.password_hash = hash_password(new_password)
    user.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({'message': 'Password updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.log_error(e, f"Error updating password for user {user.id}")
        return jsonify({'error': 'Failed to update password'}), 500

@auth_bp.route('/delete-account', methods=['DELETE'])
@jwt_required()
def delete_account():
    """Delete user account"""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        # Delete user and all associated data
        db.session.delete(user)
        db.session.commit()
        
        logger.log_event('INFO', 'account_deleted', {'user_id': current_user_id})
        return jsonify({'message': 'Account deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.log_error(e, f"Error deleting account for user {user.id}")
        return jsonify({'error': 'Failed to delete account'}), 500
