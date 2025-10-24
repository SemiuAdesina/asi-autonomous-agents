from flask import request, g
import bleach
import re
import html
from functools import wraps
import logging

logger = logging.getLogger(__name__)

class InputSanitizer:
    """Comprehensive input sanitization for XSS protection"""
    
    # Allowed HTML tags for rich text content
    ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li']
    
    # Allowed attributes
    ALLOWED_ATTRIBUTES = {
        'a': ['href', 'title'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'p': ['class'],
        'div': ['class'],
        'span': ['class']
    }
    
    # Allowed URL schemes
    ALLOWED_SCHEMES = ['http', 'https', 'mailto']
    
    @staticmethod
    def sanitize_text(text: str, allow_html: bool = False) -> str:
        """Sanitize text input to prevent XSS attacks"""
        if not text:
            return ""
        
        # HTML encode first
        text = html.escape(text)
        
        if allow_html:
            # Use bleach for HTML content
            text = bleach.clean(
                text,
                tags=InputSanitizer.ALLOWED_TAGS,
                attributes=InputSanitizer.ALLOWED_ATTRIBUTES,
                protocols=InputSanitizer.ALLOWED_SCHEMES,
                strip=True
            )
        
        return text.strip()
    
    @staticmethod
    def sanitize_email(email: str) -> str:
        """Sanitize email input"""
        if not email:
            return ""
        
        # Basic email validation and sanitization
        email = email.strip().lower()
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        if re.match(email_pattern, email):
            return email
        else:
            raise ValueError("Invalid email format")
    
    @staticmethod
    def sanitize_username(username: str) -> str:
        """Sanitize username input"""
        if not username:
            return ""
        
        # Remove HTML tags and dangerous characters
        username = bleach.clean(username, tags=[], strip=True)
        
        # Allow only alphanumeric, underscore, and hyphen
        username = re.sub(r'[^a-zA-Z0-9_-]', '', username)
        
        # Length validation
        if len(username) < 3 or len(username) > 30:
            raise ValueError("Username must be between 3 and 30 characters")
        
        return username
    
    @staticmethod
    def sanitize_wallet_address(address: str) -> str:
        """Sanitize wallet address input"""
        if not address:
            return ""
        
        # Remove whitespace and convert to lowercase
        address = address.strip().lower()
        
        # Ethereum address validation (42 characters, starts with 0x)
        if re.match(r'^0x[a-fA-F0-9]{40}$', address):
            return address
        
        # Solana address validation (32-44 characters, base58)
        if re.match(r'^[1-9A-HJ-NP-Za-km-z]{32,44}$', address):
            return address
        
        raise ValueError("Invalid wallet address format")
    
    @staticmethod
    def sanitize_json_data(data: dict) -> dict:
        """Recursively sanitize JSON data"""
        if not isinstance(data, dict):
            return data
        
        # Fields that should not be sanitized (passwords, tokens, etc.)
        UNSANITIZED_FIELDS = {'password', 'token', 'access_token', 'refresh_token', 'api_key', 'secret'}
        
        sanitized = {}
        for key, value in data.items():
            # Sanitize key
            clean_key = InputSanitizer.sanitize_text(str(key))
            
            # Skip sanitization for sensitive fields
            if key.lower() in UNSANITIZED_FIELDS:
                sanitized[clean_key] = value
                continue
            
            # Sanitize value based on type
            if isinstance(value, str):
                clean_value = InputSanitizer.sanitize_text(value)
            elif isinstance(value, dict):
                clean_value = InputSanitizer.sanitize_json_data(value)
            elif isinstance(value, list):
                clean_value = [InputSanitizer.sanitize_text(item) if isinstance(item, str) else item for item in value]
            else:
                clean_value = value
            
            sanitized[clean_key] = clean_value
        
        return sanitized

def sanitize_request_data():
    """Middleware to sanitize all request data"""
    if request.is_json:
        try:
            original_data = request.get_json()
            sanitized_data = InputSanitizer.sanitize_json_data(original_data)
            g.sanitized_data = sanitized_data
        except Exception as e:
            logger.warning(f"Failed to sanitize JSON data: {e}")
            g.sanitized_data = {}
    
    # Sanitize form data
    if request.form:
        sanitized_form = {}
        for key, value in request.form.items():
            sanitized_form[InputSanitizer.sanitize_text(key)] = InputSanitizer.sanitize_text(value)
        g.sanitized_form = sanitized_form
    
    # Sanitize query parameters
    if request.args:
        sanitized_args = {}
        for key, value in request.args.items():
            sanitized_args[InputSanitizer.sanitize_text(key)] = InputSanitizer.sanitize_text(value)
        g.sanitized_args = sanitized_args

def require_sanitized_input(f):
    """Decorator to ensure input sanitization"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            sanitize_request_data()
            return f(*args, **kwargs)
        except ValueError as e:
            from flask import jsonify
            return jsonify({'error': f'Invalid input: {str(e)}'}), 400
        except Exception as e:
            logger.error(f"Sanitization error: {e}")
            from flask import jsonify
            return jsonify({'error': 'Input sanitization failed'}), 400
    
    return decorated_function

def validate_input_schema(schema: dict):
    """Validate input against a schema"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                data = getattr(g, 'sanitized_data', request.get_json() or {})
                
                # Validate required fields
                for field, rules in schema.items():
                    if rules.get('required', False) and field not in data:
                        raise ValueError(f"Required field '{field}' is missing")
                    
                    if field in data:
                        value = data[field]
                        
                        # Type validation
                        expected_type = rules.get('type', str)
                        if not isinstance(value, expected_type):
                            raise ValueError(f"Field '{field}' must be of type {expected_type.__name__}")
                        
                        # Length validation
                        if 'min_length' in rules and len(str(value)) < rules['min_length']:
                            raise ValueError(f"Field '{field}' must be at least {rules['min_length']} characters")
                        
                        if 'max_length' in rules and len(str(value)) > rules['max_length']:
                            raise ValueError(f"Field '{field}' must be no more than {rules['max_length']} characters")
                        
                        # Pattern validation
                        if 'pattern' in rules and not re.match(rules['pattern'], str(value)):
                            raise ValueError(f"Field '{field}' does not match required pattern")
                
                return f(*args, **kwargs)
            except ValueError as e:
                from flask import jsonify
                return jsonify({'error': str(e)}), 400
        
        return decorated_function
    return decorator

# Common validation schemas
VALIDATION_SCHEMAS = {
    'user_registration': {
        'username': {
            'required': True,
            'type': str,
            'min_length': 3,
            'max_length': 30,
            'pattern': r'^[a-zA-Z0-9_-]+$'
        },
        'email': {
            'required': True,
            'type': str,
            'pattern': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        },
        'password': {
            'required': True,
            'type': str,
            'min_length': 8,
            'max_length': 128
        },
        'wallet_address': {
            'required': False,
            'type': str,
            'max_length': 44
        }
    },
    'user_login': {
        'username': {
            'required': True,
            'type': str,
            'min_length': 1,
            'max_length': 30
        },
        'password': {
            'required': True,
            'type': str,
            'min_length': 1,
            'max_length': 128
        }
    },
    'message_send': {
        'content': {
            'required': True,
            'type': str,
            'min_length': 1,
            'max_length': 1000
        },
        'agent_id': {
            'required': True,
            'type': (str, int)
        },
        'message_type': {
            'required': False,
            'type': str,
            'max_length': 20
        }
    },
    'knowledge_query': {
        'query': {
            'required': True,
            'type': str,
            'min_length': 1,
            'max_length': 500
        },
        'domain': {
            'required': False,
            'type': str,
            'max_length': 50
        }
    }
}
