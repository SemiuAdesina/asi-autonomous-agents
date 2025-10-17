from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from flask_sqlalchemy import SQLAlchemy

# This will be initialized in app.py
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    wallet_address = Column(String(42), unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    agents = relationship('Agent', backref='owner', lazy='dynamic')
    messages = relationship('Message', backref='user', lazy='dynamic')

class Agent(db.Model):
    __tablename__ = 'agents'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    address = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    capabilities = Column(JSON, nullable=True)
    status = Column(String(20), default='inactive')  # active, inactive, connecting
    agent_type = Column(String(50), nullable=False)  # healthcare, logistics, finance, etc.
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    agent_metadata = Column(JSON, nullable=True)
    
    # Relationships
    messages = relationship('Message', backref='agent', lazy='dynamic')

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    sender_type = Column(String(20), nullable=False)  # user, agent, system
    agent_id = Column(Integer, ForeignKey('agents.id'), nullable=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    message_type = Column(String(20), default='text')  # text, image, file, command
    agent_metadata = Column(JSON, nullable=True)

class KnowledgeGraph(db.Model):
    __tablename__ = 'knowledge_graph'
    
    id = Column(Integer, primary_key=True)
    concept = Column(String(200), nullable=False)
    definition = Column(Text, nullable=True)
    relationships = Column(JSON, nullable=True)
    source = Column(String(100), nullable=True)  # metta, manual, imported
    confidence_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AgentSession(db.Model):
    __tablename__ = 'agent_sessions'
    
    id = Column(Integer, primary_key=True)
    agent_id = Column(Integer, ForeignKey('agents.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    session_id = Column(String(100), unique=True, nullable=False)
    status = Column(String(20), default='active')  # active, ended, timeout
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    agent_metadata = Column(JSON, nullable=True)

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = Column(Integer, primary_key=True)
    agent_id = Column(Integer, ForeignKey('agents.id'), nullable=False)
    transaction_hash = Column(String(66), unique=True, nullable=False)
    transaction_type = Column(String(50), nullable=False)  # deploy, execute, transfer
    status = Column(String(20), default='pending')  # pending, confirmed, failed
    gas_used = Column(Integer, nullable=True)
    gas_price = Column(Integer, nullable=True)
    block_number = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    agent_metadata = Column(JSON, nullable=True)
