# Import all route blueprints
from .auth import auth_bp
from .agents import agents_bp
from .messages import messages_bp
from .knowledge import knowledge_bp
from .health import health_bp
from .multisig import multisig_bp
from .audit import audit_bp
from .sessions import sessions_bp
from .transactions import transactions_bp
from .generate import generate_bp

__all__ = ['auth_bp', 'agents_bp', 'messages_bp', 'knowledge_bp', 'health_bp', 'multisig_bp', 'audit_bp', 'sessions_bp', 'transactions_bp', 'generate_bp']
