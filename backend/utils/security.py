from flask import Flask, request, jsonify, g
from functools import wraps
import logging
import os

logger = logging.getLogger(__name__)

class SecurityHeaders:
    """Security headers middleware for Flask application"""
    
    @staticmethod
    def add_security_headers(app: Flask):
        """Add security headers to all responses"""
        
        @app.after_request
        def set_security_headers(response):
            """Set security headers for all responses"""
            
            # Content Security Policy
            csp_policy = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; "
                "font-src 'self' https://fonts.gstatic.com; "
                "img-src 'self' data: https:; "
                "connect-src 'self' https: wss: ws:; "
                "frame-src 'none'; "
                "object-src 'none'; "
                "base-uri 'self'; "
                "form-action 'self'; "
                "frame-ancestors 'none';"
            )
            response.headers['Content-Security-Policy'] = csp_policy
            
            # HTTP Strict Transport Security
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
            
            # X-Content-Type-Options
            response.headers['X-Content-Type-Options'] = 'nosniff'
            
            # X-Frame-Options
            response.headers['X-Frame-Options'] = 'DENY'
            
            # X-XSS-Protection
            response.headers['X-XSS-Protection'] = '1; mode=block'
            
            # Referrer Policy
            response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
            
            # Permissions Policy
            permissions_policy = (
                "geolocation=(), "
                "microphone=(), "
                "camera=(), "
                "payment=(), "
                "usb=(), "
                "magnetometer=(), "
                "gyroscope=(), "
                "speaker=(), "
                "vibrate=(), "
                "fullscreen=(self), "
                "sync-xhr=()"
            )
            response.headers['Permissions-Policy'] = permissions_policy
            
            # Cross-Origin Embedder Policy
            response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
            
            # Cross-Origin Opener Policy
            response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
            
            # Cross-Origin Resource Policy
            response.headers['Cross-Origin-Resource-Policy'] = 'same-origin'
            
            # Remove server header
            response.headers.pop('Server', None)
            
            # Add custom security headers
            response.headers['X-Powered-By'] = 'ASI Autonomous Agents Platform'
            response.headers['X-API-Version'] = '1.0.0'
            
            return response

class CSRFProtection:
    """CSRF protection middleware"""
    
    @staticmethod
    def generate_csrf_token():
        """Generate CSRF token"""
        import secrets
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def validate_csrf_token(token: str, session_token: str) -> bool:
        """Validate CSRF token"""
        if not token or not session_token:
            return False
        return token == session_token
    
    @staticmethod
    def csrf_protect(f):
        """CSRF protection decorator"""
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Skip CSRF for GET requests and health checks
            if request.method == 'GET' or request.endpoint in ['health.health_check', 'health.liveness_check', 'health.readiness_check']:
                return f(*args, **kwargs)
            
            # Skip CSRF for API endpoints with proper authentication
            if request.path.startswith('/api/') and request.headers.get('Authorization'):
                return f(*args, **kwargs)
            
            # Check CSRF token for other requests
            csrf_token = request.headers.get('X-CSRF-Token') or request.form.get('csrf_token')
            session_token = request.cookies.get('csrf_token')
            
            if not CSRFProtection.validate_csrf_token(csrf_token, session_token):
                return jsonify({'error': 'CSRF token validation failed'}), 403
            
            return f(*args, **kwargs)
        
        return decorated_function

class RequestValidation:
    """Request validation middleware"""
    
    @staticmethod
    def validate_request_size(max_size: int = 16 * 1024 * 1024):  # 16MB default
        """Validate request size"""
        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                content_length = request.content_length
                if content_length and content_length > max_size:
                    return jsonify({'error': 'Request too large'}), 413
                return f(*args, **kwargs)
            return decorated_function
        return decorator
    
    @staticmethod
    def validate_content_type(allowed_types: list = None):
        """Validate content type"""
        if allowed_types is None:
            allowed_types = ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data']
        
        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                if request.method in ['POST', 'PUT', 'PATCH']:
                    content_type = request.content_type
                    if not any(content_type.startswith(allowed) for allowed in allowed_types):
                        return jsonify({'error': 'Invalid content type'}), 415
                return f(*args, **kwargs)
            return decorated_function
        return decorator

class IPWhitelist:
    """IP whitelist middleware"""
    
    @staticmethod
    def whitelist_ips(allowed_ips: list):
        """Whitelist specific IP addresses"""
        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                client_ip = request.remote_addr
                if client_ip not in allowed_ips:
                    return jsonify({'error': 'Access denied'}), 403
                return f(*args, **kwargs)
            return decorated_function
        return decorator
    
    @staticmethod
    def block_suspicious_ips():
        """Block suspicious IP addresses"""
        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                client_ip = request.remote_addr
                
                # Block private IPs if not in development
                if os.getenv('FLASK_ENV') != 'development':
                    if client_ip.startswith(('10.', '172.', '192.168.')):
                        return jsonify({'error': 'Access denied'}), 403
                
                # Block known malicious IPs (this would be populated from a threat intelligence feed)
                malicious_ips = os.getenv('MALICIOUS_IPS', '').split(',')
                if client_ip in malicious_ips:
                    logger.warning(f"Blocked malicious IP: {client_ip}")
                    return jsonify({'error': 'Access denied'}), 403
                
                return f(*args, **kwargs)
            return decorated_function
        return decorator

class SecurityMiddleware:
    """Main security middleware class"""
    
    @staticmethod
    def init_security(app: Flask):
        """Initialize all security middleware"""
        
        # Add security headers
        SecurityHeaders.add_security_headers(app)
        
        # Add request validation
        app.before_request(SecurityMiddleware.validate_request)
        
        # Add security logging
        app.after_request(SecurityMiddleware.log_security_event)
        
        logger.info("Security middleware initialized")
    
    @staticmethod
    def validate_request():
        """Validate incoming requests"""
        
        # Check request size
        if request.content_length and request.content_length > 16 * 1024 * 1024:  # 16MB
            return jsonify({'error': 'Request too large'}), 413
        
        # Check for suspicious patterns
        user_agent = request.headers.get('User-Agent', '')
        if any(pattern in user_agent.lower() for pattern in ['bot', 'crawler', 'spider', 'scraper']):
            # Allow legitimate bots but log them
            logger.info(f"Bot detected: {user_agent}")
        
        # Check for SQL injection patterns
        if request.is_json and request.method in ['POST', 'PUT', 'PATCH']:
            try:
                data = request.get_json()
                if SecurityMiddleware.contains_sql_injection_pattern(str(data)):
                    logger.warning(f"SQL injection attempt detected from {request.remote_addr}")
                    return jsonify({'error': 'Invalid request'}), 400
            except Exception as e:
                logger.warning(f"JSON parsing error: {e}")
                pass
    
    @staticmethod
    def contains_sql_injection_pattern(text: str) -> bool:
        """Check for SQL injection patterns"""
        sql_patterns = [
            'union select', 'drop table', 'delete from', 'insert into',
            'update set', 'alter table', 'exec(', 'execute(',
            'script>', '<script', 'javascript:', 'vbscript:',
            'onload=', 'onerror=', 'onclick='
        ]
        
        text_lower = text.lower()
        return any(pattern in text_lower for pattern in sql_patterns)
    
    @staticmethod
    def log_security_event(response):
        """Log security-related events"""
        
        # Log failed authentication attempts
        if response.status_code == 401:
            logger.warning(f"Authentication failed from {request.remote_addr} for {request.endpoint}")
        
        # Log rate limit violations
        if response.status_code == 429:
            logger.warning(f"Rate limit exceeded from {request.remote_addr} for {request.endpoint}")
        
        # Log access to sensitive endpoints
        sensitive_endpoints = ['/api/auth/', '/api/agents/deploy', '/api/knowledge/add']
        if any(request.path.startswith(endpoint) for endpoint in sensitive_endpoints):
            logger.info(f"Access to sensitive endpoint {request.path} from {request.remote_addr}")
        
        return response

# Security configuration
SECURITY_CONFIG = {
    'max_request_size': 16 * 1024 * 1024,  # 16MB
    'allowed_content_types': [
        'application/json',
        'application/x-www-form-urlencoded',
        'multipart/form-data'
    ],
    'csp_policy': (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "connect-src 'self' https: wss: ws:; "
        "frame-src 'none'; "
        "object-src 'none';"
    ),
    'hsts_max_age': 31536000,  # 1 year
    'allowed_origins': os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
}
