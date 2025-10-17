from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_socketio import SocketIO, emit, join_room
from flask_jwt_extended import JWTManager
from celery import Celery
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///asi_agents.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

# Initialize extensions
from models import db
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

# Initialize Celery
celery = Celery(
    app.import_name,
    backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0')
)
celery.conf.update(app.config)

# Import models after db initialization
from models import Agent, Message, User, KnowledgeGraph

# Import routes
from routes import auth_bp, agents_bp, messages_bp, knowledge_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(agents_bp, url_prefix='/api/agents')
app.register_blueprint(messages_bp, url_prefix='/api/messages')
app.register_blueprint(knowledge_bp, url_prefix='/api/knowledge')

# Socket.IO events
@socketio.on('connect')
def handle_connect():
    print('Client connected')
    # Don't emit status message to avoid duplicate notifications
    # emit('status', {'message': 'Connected to ASI Agents Platform'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join_agent')
def handle_join_agent(data):
    agent_id = data.get('agent_id')
    if agent_id:
        join_room(f'agent_{agent_id}')
        # Don't emit status message to avoid duplicate notifications
        # emit('status', {'message': f'Joined agent {agent_id}'})

@socketio.on('send_message')
def handle_message(data):
    agent_id = data.get('agent_id')
    message = data.get('message')
    
    if agent_id and message:
        # Process message with intelligent agent responses
        response = process_agent_message(agent_id, message)
        emit('agent_response', {
            'agent_id': agent_id,
            'message': response,
            'timestamp': str(datetime.utcnow())
        }, room=f'agent_{agent_id}')

def process_agent_message(agent_id, message):
    """Process message with intelligent agent responses"""
    agent_responses = {
        'fetch-healthcare-001': {  # Healthcare Agent
            'keywords': {
                'symptom': "I understand you're experiencing symptoms. While I can provide general health guidance, it's important to consult with a healthcare professional for proper diagnosis. For immediate concerns, please contact your doctor or visit an emergency room.",
                'pain': "Pain management is important. I can help you understand different types of pain and when to seek medical attention. For persistent or severe pain, please consult a healthcare provider.",
                'medication': "I can help you understand medications and their general uses. However, medication decisions should always be made in consultation with a healthcare provider who knows your medical history.",
                'diet': "I can provide general nutrition guidance. A balanced diet rich in fruits, vegetables, whole grains, and lean proteins supports overall health. Consider consulting a registered dietitian for personalized advice.",
                'headache': "Headaches can have various causes including stress, dehydration, lack of sleep, or underlying health conditions. I recommend tracking your symptoms, staying hydrated, getting adequate rest, and scheduling an appointment with your healthcare provider for proper evaluation.",
                'fatigue': "Fatigue can be caused by many factors including sleep issues, stress, nutritional deficiencies, or underlying health conditions. I suggest maintaining a regular sleep schedule, eating a balanced diet, staying hydrated, and consulting with your healthcare provider if symptoms persist.",
                'headaches': "Headaches can have various causes including stress, dehydration, lack of sleep, or underlying health conditions. I recommend tracking your symptoms, staying hydrated, getting adequate rest, and scheduling an appointment with your healthcare provider for proper evaluation.",
                'tired': "Feeling tired can be caused by many factors including sleep issues, stress, nutritional deficiencies, or underlying health conditions. I suggest maintaining a regular sleep schedule, eating a balanced diet, staying hydrated, and consulting with your healthcare provider if symptoms persist."
            },
            'default': "As your Healthcare Assistant, I'm here to provide general health information and guidance. For specific medical concerns, symptoms, or treatment decisions, please consult with a qualified healthcare professional."
        },
        'fetch-logistics-002': {  # Logistics Agent
            'keywords': {
                'route': "I can help optimize your delivery routes and shipping strategies. For route optimization, I recommend analyzing traffic patterns, delivery windows, and vehicle capacity. Consider implementing GPS tracking and real-time route adjustments.",
                'delivery': "For delivery optimization, I suggest implementing automated tracking systems, demand forecasting, and just-in-time inventory strategies. This can reduce carrying costs while maintaining optimal stock levels.",
                'inventory': "Inventory management involves analyzing your entire procurement and distribution network. I can help identify bottlenecks, optimize supplier relationships, and implement cost-saving measures.",
                'supply': "Supply chain optimization involves analyzing your entire procurement and distribution network. I can help identify bottlenecks, optimize supplier relationships, and implement cost-saving measures."
            },
            'default': "As your Logistics Coordinator, I specialize in optimizing supply chains, managing inventory, and improving delivery efficiency. I can help you reduce costs, improve delivery times, and enhance overall operational performance."
        },
        'fetch-finance-003': {  # Financial Agent
            'keywords': {
                'portfolio': "For portfolio management, I recommend diversifying across different asset classes including stocks, bonds, and alternative investments. Consider your risk tolerance, time horizon, and financial goals when making investment decisions.",
                'investment': "Investment strategies should align with your risk tolerance and financial goals. I can help you understand different investment vehicles and create a diversified portfolio that balances risk and return.",
                'defi': "DeFi protocols offer innovative financial services but come with higher risks. I can help you understand yield farming, liquidity provision, and staking opportunities. Always research protocols thoroughly and never invest more than you can afford to lose.",
                'risk': "Risk management is crucial for financial success. I recommend diversifying your investments, setting stop-loss orders, and maintaining an emergency fund. For DeFi investments, consider using audited protocols and never put all your funds in one place."
            },
            'default': "As your Financial Advisor, I can help with portfolio optimization, risk assessment, and DeFi strategies. I'll provide insights on traditional investments and emerging DeFi opportunities while helping you manage risk appropriately."
        },
        'fetch-education-004': {  # Education Mentor Agent
            'keywords': {
                'learn': "I can help create personalized learning paths based on your goals and current knowledge level. Let me know what subject you'd like to explore or what skills you want to develop.",
                'study': "Effective studying involves active learning techniques like spaced repetition, practice testing, and elaborative interrogation. I can help you develop study strategies tailored to your learning style.",
                'course': "I can recommend courses and learning resources based on your interests and career goals. Whether you're looking for technical skills, soft skills, or academic subjects, I can guide you to the right materials.",
                'skill': "Skill development requires consistent practice and feedback. I can help you break down complex skills into manageable steps and track your progress over time.",
                'education': "Education is a lifelong journey. I can help you identify learning opportunities, set educational goals, and create a structured approach to acquiring new knowledge and skills.",
                'breakdown': "I can help break down complex topics into manageable, digestible parts. Whether you're learning a new programming language, studying for an exam, or mastering a new skill, I'll create a structured learning path for you."
            },
            'default': "As your Education Mentor, I'm here to guide your learning journey and help you achieve your educational goals. I can assist with personalized learning paths, study strategies, skill development, and finding the right resources for your needs."
        },
        'fetch-system-005': {  # System Monitor Agent
            'keywords': {
                'monitor': "I can help you monitor system performance, track metrics, and identify potential issues before they become problems. Let me know what systems you'd like to monitor.",
                'alert': "I can help set up intelligent alerting systems that notify you of important events while reducing false positives. This includes performance thresholds, error rates, and security events.",
                'performance': "Performance optimization involves analyzing bottlenecks, resource utilization, and system efficiency. I can help identify areas for improvement and suggest optimization strategies.",
                'security': "Security monitoring includes threat detection, vulnerability assessment, and incident response. I can help you implement comprehensive security monitoring and response procedures.",
                'scaling': "Auto-scaling helps maintain optimal performance under varying loads. I can help you implement intelligent scaling policies based on metrics like CPU usage, memory consumption, and request rates."
            },
            'default': "As your System Monitor, I specialize in monitoring system health, performance optimization, and proactive issue detection. I can help you maintain optimal system performance and quickly respond to any issues that arise."
        },
        'fetch-research-006': {  # Research Assistant Agent
            'keywords': {
                'research': "I can help you conduct comprehensive research by gathering information from multiple sources, analyzing data, and synthesizing findings. What topic would you like to research?",
                'analysis': "Data analysis involves examining patterns, trends, and relationships in your data. I can help you choose appropriate analytical methods and interpret the results.",
                'literature': "Literature review involves systematically searching, evaluating, and synthesizing existing research. I can help you identify relevant sources and organize your findings.",
                'hypothesis': "Hypothesis testing is a systematic approach to evaluating research questions. I can help you formulate testable hypotheses and design appropriate experiments or studies.",
                'data': "Data collection and analysis are fundamental to research. I can help you design data collection methods, choose appropriate statistical tests, and interpret your results."
            },
            'default': "As your Research Assistant, I can help with data analysis, literature reviews, hypothesis testing, and scientific computing. I'm equipped to assist with various research methodologies and can help you organize and analyze your findings effectively."
        }
    }
    
    agent_data = agent_responses.get(agent_id, agent_responses['fetch-healthcare-001'])
    message_lower = message.lower()
    
    # Check for keyword matches
    for keyword, response in agent_data['keywords'].items():
        if keyword in message_lower:
            return response
    
    # Return default response
    return agent_data['default']

# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'ASI Agents Platform is running',
        'version': '1.0.0'
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    # Run the application
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)
