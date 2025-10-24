from flask import Flask, request, jsonify, g
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import redis
import os
import logging

logger = logging.getLogger(__name__)

def create_rate_limiter(app: Flask) -> Limiter:
    """Create and configure rate limiter"""
    
    # Redis configuration for rate limiting
    redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    try:
        # Test Redis connection
        redis_client = redis.Redis.from_url(redis_url)
        redis_client.ping()
        storage_uri = redis_url
    except Exception as e:
        logger.warning(f"Redis not available for rate limiting: {e}. Using memory storage.")
        storage_uri = "memory://"
    
    limiter = Limiter(
        app,
        storage_uri=storage_uri,
        default_limits=["1000 per hour", "100 per minute"],
        headers_enabled=True
    )
    
    return limiter

# Rate limiting decorators for different endpoints
def auth_rate_limit():
    """Rate limiting for authentication endpoints"""
    from flask_limiter import Limiter
    from flask import current_app
    
    limiter = Limiter(
        current_app,
        key_func=get_remote_address,
        storage_uri=os.getenv('REDIS_URL', 'memory://'),
        default_limits=["5 per minute", "20 per hour"]
    )
    
    return limiter.limit("5 per minute", "20 per hour")

def api_rate_limit():
    """Rate limiting for general API endpoints"""
    from flask_limiter import Limiter
    from flask import current_app
    
    limiter = Limiter(
        current_app,
        key_func=get_remote_address,
        storage_uri=os.getenv('REDIS_URL', 'memory://'),
        default_limits=["100 per minute", "1000 per hour"]
    )
    
    return limiter.limit("100 per minute", "1000 per hour")

def message_rate_limit():
    """Rate limiting for message endpoints"""
    from flask_limiter import Limiter
    from flask import current_app
    
    limiter = Limiter(
        current_app,
        key_func=get_remote_address,
        storage_uri=os.getenv('REDIS_URL', 'memory://'),
        default_limits=["30 per minute", "500 per hour"]
    )
    
    return limiter.limit("30 per minute", "500 per hour")

def knowledge_rate_limit():
    """Rate limiting for knowledge graph endpoints"""
    from flask_limiter import Limiter
    from flask import current_app
    
    limiter = Limiter(
        current_app,
        key_func=get_remote_address,
        storage_uri=os.getenv('REDIS_URL', 'memory://'),
        default_limits=["50 per minute", "1000 per hour"]
    )
    
    return limiter.limit("50 per minute", "1000 per hour")

def strict_rate_limit():
    """Strict rate limiting for sensitive operations"""
    from flask_limiter import Limiter
    from flask import current_app
    
    limiter = Limiter(
        current_app,
        key_func=get_remote_address,
        storage_uri=os.getenv('REDIS_URL', 'memory://'),
        default_limits=["10 per minute", "50 per hour"]
    )
    
    return limiter.limit("10 per minute", "50 per hour")

# Custom key functions for different scenarios
def get_user_id():
    """Get user ID for authenticated requests"""
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    return f"user:{user_id}" if user_id else get_remote_address()

def get_agent_id():
    """Get agent ID for agent-specific rate limiting"""
    agent_id = request.args.get('agent_id') or request.json.get('agent_id') if request.is_json else None
    return f"agent:{agent_id}" if agent_id else get_remote_address()

# Rate limiting configurations
RATE_LIMITS = {
    'auth': {
        'login': "5 per minute, 20 per hour",
        'register': "3 per minute, 10 per hour",
        'refresh': "10 per minute, 50 per hour",
        'profile': "30 per minute, 200 per hour"
    },
    'agents': {
        'list': "100 per minute, 1000 per hour",
        'create': "5 per minute, 50 per hour",
        'update': "20 per minute, 200 per hour",
        'delete': "5 per minute, 50 per hour",
        'connect': "10 per minute, 100 per hour",
        'deploy': "2 per minute, 20 per hour"
    },
    'messages': {
        'send': "30 per minute, 500 per hour",
        'get': "100 per minute, 2000 per hour",
        'conversation': "50 per minute, 1000 per hour"
    },
    'knowledge': {
        'query': "50 per minute, 1000 per hour",
        'add': "20 per minute, 200 per hour",
        'search': "100 per minute, 2000 per hour"
    },
    'health': {
        'check': "1000 per minute",
        'metrics': "100 per minute"
    }
}

def apply_rate_limits(limiter: Limiter):
    """Apply rate limits to all endpoints"""
    
    # Authentication endpoints
    limiter.limit(RATE_LIMITS['auth']['login'])(auth_bp.route('/login', methods=['POST']))
    limiter.limit(RATE_LIMITS['auth']['register'])(auth_bp.route('/register', methods=['POST']))
    limiter.limit(RATE_LIMITS['auth']['refresh'])(auth_bp.route('/refresh', methods=['POST']))
    limiter.limit(RATE_LIMITS['auth']['profile'])(auth_bp.route('/profile', methods=['GET', 'PUT']))
    
    # Agent endpoints
    limiter.limit(RATE_LIMITS['agents']['list'])(agents_bp.route('/', methods=['GET']))
    limiter.limit(RATE_LIMITS['agents']['create'])(agents_bp.route('/', methods=['POST']))
    limiter.limit(RATE_LIMITS['agents']['update'])(agents_bp.route('/<int:agent_id>', methods=['PUT']))
    limiter.limit(RATE_LIMITS['agents']['delete'])(agents_bp.route('/<int:agent_id>', methods=['DELETE']))
    limiter.limit(RATE_LIMITS['agents']['connect'])(agents_bp.route('/connect', methods=['POST']))
    limiter.limit(RATE_LIMITS['agents']['deploy'])(agents_bp.route('/deploy', methods=['POST']))
    
    # Message endpoints
    limiter.limit(RATE_LIMITS['messages']['send'])(messages_bp.route('/', methods=['POST']))
    limiter.limit(RATE_LIMITS['messages']['get'])(messages_bp.route('/', methods=['GET']))
    limiter.limit(RATE_LIMITS['messages']['conversation'])(messages_bp.route('/conversation/<int:agent_id>', methods=['GET']))
    
    # Knowledge endpoints
    limiter.limit(RATE_LIMITS['knowledge']['query'])(knowledge_bp.route('/query', methods=['POST']))
    limiter.limit(RATE_LIMITS['knowledge']['add'])(knowledge_bp.route('/concept', methods=['POST']))
    limiter.limit(RATE_LIMITS['knowledge']['search'])(knowledge_bp.route('/search', methods=['GET']))
    
    # Health endpoints
    limiter.limit(RATE_LIMITS['health']['check'])(health_bp.route('/health', methods=['GET']))
    limiter.limit(RATE_LIMITS['health']['metrics'])(health_bp.route('/health/metrics', methods=['GET']))

# Rate limiting error handler
def rate_limit_handler(e):
    """Handle rate limit exceeded errors"""
    return jsonify({
        'error': 'Rate limit exceeded',
        'message': str(e.description),
        'retry_after': e.retry_after
    }), 429
