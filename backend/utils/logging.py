import logging
import json
import os
import sys
from datetime import datetime
from flask import request, g, current_app
from functools import wraps
import traceback
import psutil
import time
from typing import Dict, Any, Optional

class StructuredLogger:
    """Structured logging for the application"""
    
    def __init__(self, name: str = 'asi_agents'):
        self.logger = logging.getLogger(name)
        self._setup_logger()
    
    def _setup_logger(self):
        """Setup logger with proper formatting"""
        
        # Create logs directory if it doesn't exist
        log_dir = os.getenv('LOG_DIR', 'logs')
        os.makedirs(log_dir, exist_ok=True)
        
        # Set log level
        log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
        self.logger.setLevel(getattr(logging, log_level))
        
        # Remove existing handlers
        for handler in self.logger.handlers[:]:
            self.logger.removeHandler(handler)
        
        # Console handler with colored output
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(console_formatter)
        self.logger.addHandler(console_handler)
        
        # File handler for all logs
        file_handler = logging.FileHandler(f'{log_dir}/asi_agents.log')
        file_handler.setLevel(logging.DEBUG)
        file_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
        )
        file_handler.setFormatter(file_formatter)
        self.logger.addHandler(file_handler)
        
        # Error file handler
        error_handler = logging.FileHandler(f'{log_dir}/errors.log')
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(file_formatter)
        self.logger.addHandler(error_handler)
        
        # Security log handler
        security_handler = logging.FileHandler(f'{log_dir}/security.log')
        security_handler.setLevel(logging.WARNING)
        security_formatter = logging.Formatter(
            '%(asctime)s - SECURITY - %(levelname)s - %(message)s'
        )
        security_handler.setFormatter(security_formatter)
        self.logger.addHandler(security_handler)
    
    def log_event(self, level: str, event: str, data: Dict[str, Any] = None, **kwargs):
        """Log a structured event"""
        
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'event': event,
            'level': level.upper(),
            'data': data or {},
            **kwargs
        }
        
        # Add request context if available
        if hasattr(g, 'request_id'):
            log_data['request_id'] = g.request_id
        
        if hasattr(g, 'user_id'):
            log_data['user_id'] = g.user_id
        
        # Log based on level
        log_message = json.dumps(log_data, default=str)
        
        if level.upper() == 'DEBUG':
            self.logger.debug(log_message)
        elif level.upper() == 'INFO':
            self.logger.info(log_message)
        elif level.upper() == 'WARNING':
            self.logger.warning(log_message)
        elif level.upper() == 'ERROR':
            self.logger.error(log_message)
        elif level.upper() == 'CRITICAL':
            self.logger.critical(log_message)
    
    def log_request(self, method: str, path: str, status_code: int, duration: float, **kwargs):
        """Log HTTP request"""
        self.log_event('INFO', 'http_request', {
            'method': method,
            'path': path,
            'status_code': status_code,
            'duration_ms': duration * 1000,
            'remote_addr': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', ''),
            **kwargs
        })
    
    def log_auth_event(self, event_type: str, user_id: str = None, success: bool = True, **kwargs):
        """Log authentication events"""
        self.log_event('INFO', 'auth_event', {
            'event_type': event_type,
            'user_id': user_id,
            'success': success,
            'remote_addr': request.remote_addr,
            **kwargs
        })
    
    def log_security_event(self, event_type: str, severity: str = 'WARNING', **kwargs):
        """Log security events"""
        self.log_event(severity, 'security_event', {
            'event_type': event_type,
            'remote_addr': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', ''),
            **kwargs
        })
    
    def log_agent_event(self, agent_id: str, event_type: str, **kwargs):
        """Log agent-related events"""
        self.log_event('INFO', 'agent_event', {
            'agent_id': agent_id,
            'event_type': event_type,
            **kwargs
        })
    
    def log_error(self, error: Exception, context: str = None):
        """Log errors with full context"""
        self.log_event('ERROR', 'application_error', {
            'error_type': type(error).__name__,
            'error_message': str(error),
            'context': context,
            'traceback': traceback.format_exc()
        })

class PerformanceMonitor:
    """Performance monitoring and metrics collection"""
    
    def __init__(self):
        self.metrics = {}
        self.start_time = time.time()
    
    def record_metric(self, name: str, value: float, tags: Dict[str, str] = None):
        """Record a performance metric"""
        if name not in self.metrics:
            self.metrics[name] = []
        
        metric_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'value': value,
            'tags': tags or {}
        }
        
        self.metrics[name].append(metric_data)
        
        # Keep only last 1000 metrics per name
        if len(self.metrics[name]) > 1000:
            self.metrics[name] = self.metrics[name][-1000:]
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """Get current system metrics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_available_gb': memory.available / (1024**3),
                'disk_percent': disk.percent,
                'disk_free_gb': disk.free / (1024**3),
                'uptime_seconds': time.time() - self.start_time
            }
        except Exception as e:
            return {'error': str(e)}
    
    def get_application_metrics(self) -> Dict[str, Any]:
        """Get application-specific metrics"""
        return {
            'total_requests': len(self.metrics.get('request_duration', [])),
            'average_response_time': self._calculate_average('request_duration'),
            'error_rate': self._calculate_error_rate(),
            'active_connections': self._get_active_connections()
        }
    
    def _calculate_average(self, metric_name: str) -> float:
        """Calculate average value for a metric"""
        if metric_name not in self.metrics:
            return 0.0
        
        values = [m['value'] for m in self.metrics[metric_name]]
        return sum(values) / len(values) if values else 0.0
    
    def _calculate_error_rate(self) -> float:
        """Calculate error rate"""
        total_requests = len(self.metrics.get('request_duration', []))
        error_requests = len(self.metrics.get('error_count', []))
        
        return (error_requests / total_requests * 100) if total_requests > 0 else 0.0
    
    def _get_active_connections(self) -> int:
        """Get number of active connections"""
        try:
            connections = psutil.net_connections()
            return len([c for c in connections if c.status == 'ESTABLISHED'])
        except Exception:
            return 0

class RequestLogger:
    """Request logging middleware"""
    
    def __init__(self, app=None):
        self.app = app
        self.logger = StructuredLogger('request_logger')
        self.monitor = PerformanceMonitor()
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize the request logger with Flask app"""
        
        @app.before_request
        def before_request():
            g.start_time = time.time()
            g.request_id = self._generate_request_id()
            
            # Log request start
            self.logger.log_event('DEBUG', 'request_start', {
                'method': request.method,
                'path': request.path,
                'remote_addr': request.remote_addr,
                'user_agent': request.headers.get('User-Agent', ''),
                'request_id': g.request_id
            })
        
        @app.after_request
        def after_request(response):
            # Calculate request duration
            duration = time.time() - g.start_time
            
            # Record performance metric
            self.monitor.record_metric('request_duration', duration, {
                'method': request.method,
                'path': request.path,
                'status_code': str(response.status_code)
            })
            
            # Log request completion
            self.logger.log_request(
                request.method,
                request.path,
                response.status_code,
                duration,
                request_id=g.request_id
            )
            
            # Add request ID to response headers
            response.headers['X-Request-ID'] = g.request_id
            
            return response
        
        @app.errorhandler(Exception)
        def handle_exception(e):
            # Record error metric
            self.monitor.record_metric('error_count', 1, {
                'error_type': type(e).__name__,
                'path': request.path
            })
            
            # Log error
            self.logger.log_error(e, f"Request: {request.method} {request.path}")
            
            return {
                'error': 'Internal server error',
                'request_id': g.request_id
            }, 500
    
    def _generate_request_id(self) -> str:
        """Generate unique request ID"""
        import uuid
        return str(uuid.uuid4())

def log_function_call(func_name: str = None):
    """Decorator to log function calls"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            logger = StructuredLogger('function_logger')
            start_time = time.time()
            
            try:
                result = f(*args, **kwargs)
                duration = time.time() - start_time
                
                logger.log_event('DEBUG', 'function_call', {
                    'function': func_name or f.__name__,
                    'duration_ms': duration * 1000,
                    'success': True
                })
                
                return result
            except Exception as e:
                duration = time.time() - start_time
                
                logger.log_event('ERROR', 'function_call', {
                    'function': func_name or f.__name__,
                    'duration_ms': duration * 1000,
                    'success': False,
                    'error': str(e)
                })
                
                raise
        
        return decorated_function
    return decorator

def log_agent_interaction(agent_id: str):
    """Decorator to log agent interactions"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            logger = StructuredLogger('agent_logger')
            start_time = time.time()
            
            try:
                result = f(*args, **kwargs)
                duration = time.time() - start_time
                
                logger.log_agent_event(agent_id, 'interaction', {
                    'function': f.__name__,
                    'duration_ms': duration * 1000,
                    'success': True
                })
                
                return result
            except Exception as e:
                duration = time.time() - start_time
                
                logger.log_agent_event(agent_id, 'interaction_error', {
                    'function': f.__name__,
                    'duration_ms': duration * 1000,
                    'success': False,
                    'error': str(e)
                })
                
                raise
        
        return decorated_function
    return decorator

# Global logger instance
logger = StructuredLogger()
monitor = PerformanceMonitor()

# Logging configuration
LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        },
        'detailed': {
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
        },
        'json': {
            'format': '{"timestamp": "%(asctime)s", "logger": "%(name)s", "level": "%(levelname)s", "message": "%(message)s"}'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'INFO',
            'formatter': 'standard',
            'stream': 'ext://sys.stdout'
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'DEBUG',
            'formatter': 'detailed',
            'filename': 'logs/asi_agents.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5
        },
        'error_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'ERROR',
            'formatter': 'detailed',
            'filename': 'logs/errors.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5
        },
        'security_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'WARNING',
            'formatter': 'json',
            'filename': 'logs/security.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 10
        }
    },
    'loggers': {
        'asi_agents': {
            'level': 'DEBUG',
            'handlers': ['console', 'file'],
            'propagate': False
        },
        'security': {
            'level': 'WARNING',
            'handlers': ['security_file'],
            'propagate': False
        }
    }
}
