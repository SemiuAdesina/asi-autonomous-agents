# Import all route blueprints
from .auth import auth_bp
from .agents import agents_bp
from .messages import messages_bp
from .knowledge import knowledge_bp

__all__ = ['auth_bp', 'agents_bp', 'messages_bp', 'knowledge_bp']
