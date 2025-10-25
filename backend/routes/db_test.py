# Database Test Endpoint for Backend
# Add this to your backend/routes/ directory

from flask import Blueprint, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

# Create blueprint for database testing
db_test_bp = Blueprint('db_test', __name__)

@db_test_bp.route('/api/test/database', methods=['GET'])
def test_database():
    """Test database connectivity and basic operations"""
    try:
        from app import db
        
        # Test 1: Check database connection
        db.session.execute('SELECT 1')
        
        # Test 2: Check if health_check table exists
        result = db.session.execute('SELECT COUNT(*) FROM health_check')
        count = result.scalar()
        
        # Test 3: Insert a test record
        db.session.execute("""
            INSERT INTO health_check (status, created_at) 
            VALUES ('backend_test', CURRENT_TIMESTAMP)
        """)
        db.session.commit()
        
        # Test 4: Query the test record
        result = db.session.execute("""
            SELECT status, created_at 
            FROM health_check 
            WHERE status = 'backend_test' 
            ORDER BY created_at DESC 
            LIMIT 1
        """)
        test_record = result.fetchone()
        
        return jsonify({
            'status': 'success',
            'message': 'Database connection successful',
            'database_url': os.environ.get('DATABASE_URL', 'Not set'),
            'health_check_count': count,
            'test_record': {
                'status': test_record[0] if test_record else None,
                'created_at': test_record[1].isoformat() if test_record else None
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Database connection failed: {str(e)}',
            'database_url': os.environ.get('DATABASE_URL', 'Not set'),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@db_test_bp.route('/api/database/status', methods=['GET'])
def database_status():
    """Get database status information"""
    try:
        from app import db
        
        # Test connection
        db.session.execute('SELECT 1')
        
        # Get database info
        result = db.session.execute("""
            SELECT 
                current_database() as database_name,
                current_user as current_user,
                version() as postgres_version,
                now() as current_time
        """)
        db_info = result.fetchone()
        
        return jsonify({
            'status': 'healthy',
            'database_name': db_info[0],
            'current_user': db_info[1],
            'postgres_version': db_info[2],
            'current_time': db_info[3].isoformat(),
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500
