from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from models import db, Agent, User, Message, KnowledgeGraph
from datetime import datetime, timedelta
import psutil
import os
import redis
import requests
from sqlalchemy import text
from utils.logging import monitor, logger

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Comprehensive health check endpoint"""
    health_status = {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'services': {}
    }
    
    overall_healthy = True
    
    # Database health check
    try:
        db.session.execute(text('SELECT 1'))
        health_status['services']['database'] = {
            'status': 'healthy',
            'type': 'postgresql',
            'response_time': '< 100ms'
        }
    except Exception as e:
        health_status['services']['database'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
        overall_healthy = False
    
    # Redis health check
    try:
        redis_client = redis.Redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379/0'))
        redis_client.ping()
        health_status['services']['redis'] = {
            'status': 'healthy',
            'type': 'redis',
            'response_time': '< 50ms'
        }
    except Exception as e:
        health_status['services']['redis'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
        overall_healthy = False
    
    # MeTTa Knowledge Graph health check
    try:
        # Check METTA_SERVER_URL first, then METTA_ENDPOINT, then default
        metta_endpoint = os.getenv('METTA_SERVER_URL') or os.getenv('METTA_ENDPOINT', 'http://localhost:8080')
        # Ensure localhost requests bypass proxy
        os.environ['NO_PROXY'] = 'localhost,127.0.0.1'
        response = requests.get(f"{metta_endpoint}/health", timeout=5)
        if response.status_code == 200:
            health_status['services']['metta_kg'] = {
                'status': 'healthy',
                'endpoint': metta_endpoint,
                'response_time': f'{response.elapsed.total_seconds() * 1000:.0f}ms'
            }
        else:
            raise Exception(f"HTTP {response.status_code}")
    except Exception as e:
        health_status['services']['metta_kg'] = {
            'status': 'unhealthy',
            'error': str(e),
            'fallback': 'mock_responses_enabled'
        }
        # Don't mark overall as unhealthy since we have fallback
    
    # System resources check
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        health_status['services']['system'] = {
            'status': 'healthy' if cpu_percent < 80 and memory.percent < 80 and disk.percent < 90 else 'warning',
            'cpu_usage': f'{cpu_percent}%',
            'memory_usage': f'{memory.percent}%',
            'disk_usage': f'{disk.percent}%'
        }
        
        if cpu_percent > 80 or memory.percent > 80 or disk.percent > 90:
            overall_healthy = False
    except Exception as e:
        health_status['services']['system'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
        overall_healthy = False
    
    # Application metrics
    try:
        total_users = User.query.count()
        total_agents = Agent.query.count()
        total_messages = Message.query.count()
        total_knowledge = KnowledgeGraph.query.count()
        
        # Recent activity (last 24 hours)
        recent_cutoff = datetime.utcnow() - timedelta(hours=24)
        recent_messages = Message.query.filter(Message.timestamp >= recent_cutoff).count()
        active_agents = Agent.query.filter(Agent.status == 'active').count()
        
        health_status['services']['application'] = {
            'status': 'healthy',
            'metrics': {
                'total_users': total_users,
                'total_agents': total_agents,
                'total_messages': total_messages,
                'total_knowledge_concepts': total_knowledge,
                'recent_messages_24h': recent_messages,
                'active_agents': active_agents
            }
        }
    except Exception as e:
        health_status['services']['application'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
        overall_healthy = False
    
    # Set overall status
    health_status['status'] = 'healthy' if overall_healthy else 'unhealthy'
    
    status_code = 200 if overall_healthy else 503
    return jsonify(health_status), status_code

@health_bp.route('/health/live', methods=['GET'])
def liveness_check():
    """Simple liveness check for Kubernetes"""
    return jsonify({
        'status': 'alive',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

@health_bp.route('/health/ready', methods=['GET'])
def readiness_check():
    """Readiness check for Kubernetes"""
    try:
        # Check if database is accessible
        db.session.execute(text('SELECT 1'))
        
        # Check if Redis is accessible
        redis_client = redis.Redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379/0'))
        redis_client.ping()
        
        return jsonify({
            'status': 'ready',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'not_ready',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 503

@health_bp.route('/portfolio-data', methods=['GET'])
@jwt_required()
def get_portfolio_data():
    """Get portfolio data for a wallet address"""
    try:
        wallet_address = request.args.get('wallet')
        if not wallet_address:
            return jsonify({'error': 'Wallet address is required'}), 400
        
        # Mock portfolio data - in production, this would fetch from DeFi APIs
        portfolio_data = {
            'isDemoData': False,
            'demoNotice': None,
            'walletAddress': wallet_address,
            'dataSource': 'DeFi APIs',
            'totalValue': 12.456,
            'totalValueChange': 0.234,
            'totalValueChangePercent': 1.92,
            'assets': [
                {
                    'symbol': 'ETH',
                    'name': 'Ethereum',
                    'amount': 5.2,
                    'value': 8.456,
                    'change24h': 0.123,
                    'changePercent24h': 1.48,
                    'allocation': 68.0
                },
                {
                    'symbol': 'USDC',
                    'name': 'USD Coin',
                    'amount': 4000,
                    'value': 4.0,
                    'change24h': 0.001,
                    'changePercent24h': 0.03,
                    'allocation': 32.0
                }
            ],
            'defiPositions': [
                {
                    'protocol': 'Uniswap V3',
                    'asset': 'ETH/USDC LP',
                    'amount': 0.5,
                    'value': 1500.00,
                    'apy': 12.5,
                    'link': 'https://app.uniswap.org/'
                },
                {
                    'protocol': 'Compound',
                    'asset': 'cETH',
                    'amount': 1.2,
                    'value': 3600.00,
                    'apy': 3.8,
                    'link': 'https://compound.finance/'
                },
                {
                    'protocol': 'Aave',
                    'asset': 'aUSDC',
                    'amount': 1000.00,
                    'value': 1000.00,
                    'apy': 4.2,
                    'link': 'https://aave.com/'
                }
            ]
        }
        
        return jsonify(portfolio_data), 200
        
    except Exception as e:
        logger.log_error(e, f"Failed to get portfolio data for wallet {wallet_address}")
        return jsonify({'error': 'Failed to get portfolio data'}), 500

@health_bp.route('/health/metrics', methods=['GET'])
def metrics():
    """Application metrics endpoint"""
    try:
        # Database metrics
        total_users = User.query.count()
        total_agents = Agent.query.count()
        total_messages = Message.query.count()
        total_knowledge = KnowledgeGraph.query.count()
        
        # Recent activity metrics
        recent_cutoff = datetime.utcnow() - timedelta(hours=24)
        recent_messages = Message.query.filter(Message.timestamp >= recent_cutoff).count()
        active_agents = Agent.query.filter(Agent.status == 'active').count()
        
        # System metrics
        system_metrics = monitor.get_system_metrics()
        app_metrics = monitor.get_application_metrics()
        
        metrics_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'application': {
                'total_users': total_users,
                'total_agents': total_agents,
                'total_messages': total_messages,
                'total_knowledge_concepts': total_knowledge,
                'recent_messages_24h': recent_messages,
                'active_agents': active_agents,
                **app_metrics
            },
            'system': system_metrics,
            'performance': monitor.metrics
        }
        
        # Log metrics access
        logger.log_event('INFO', 'metrics_accessed', {
            'total_users': total_users,
            'total_agents': total_agents,
            'active_agents': active_agents
        })
        
        return jsonify(metrics_data), 200
    except Exception as e:
        logger.log_error(e, "Failed to retrieve metrics")
        return jsonify({
            'error': 'Failed to retrieve metrics',
            'details': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500
