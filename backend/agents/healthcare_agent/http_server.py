#!/usr/bin/env python3
"""
HTTP Server for Healthcare Agent - Connects frontend to MeTTa-integrated agent
"""

import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

# Add the current directory to Python path
sys.path.append(os.path.dirname(__file__))

# Import MeTTa components with error handling
try:
    from utils import process_query
    from medicalrag import MedicalRAG
    from knowledge import medical_metta
    from asi_one_integration import asi_one
    from analytics import analytics
    
    # Initialize components
    rag = MedicalRAG(medical_metta)
    llm = asi_one
    print("✅ All healthcare agent modules loaded successfully")
except Exception as e:
    print(f"❌ Error loading healthcare agent modules: {e}")
    import traceback
    traceback.print_exc()
    # Create minimal fallback
    class MockLLM:
        def generate_response(self, query, context):
            return "I apologize, but I'm experiencing technical difficulties."
    llm = MockLLM()
    rag = None

app = Flask(__name__)

# Enable CORS for frontend communication
CORS(app, origins=['http://localhost:3000', 'http://localhost:3004', 'http://localhost:3005', 'https://asi-frontend.onrender.com'], 
     methods=['GET', 'POST', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'])

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    """HTTP endpoint for chat messages from frontend"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400
        
        print(f"📱 Frontend message received: {message}")
        
        # Debug: Check if API key is loaded
        api_key = os.getenv('ASI_ONE_API_KEY')
        print(f"🔑 ASI_ONE_API_KEY loaded: {'YES' if api_key else 'NO'}")
        if api_key:
            print(f"🔑 Key starts with: {api_key[:10]}...")
        
        # Process the message using MeTTa and ASI:One
        start_time = datetime.now()
        if rag is None:
            response = "I apologize, but I'm experiencing technical difficulties. Please try again later."
        else:
            response = process_query(message, rag, llm)
        end_time = datetime.now()
        
        response_time_ms = int((end_time - start_time).total_seconds() * 1000)
        
        # Log interaction for analytics
        analytics.log_interaction(
            agent_id='healthcare-agent',
            user_query=message,
            agent_response=response,
            response_time_ms=response_time_ms
        )
        
        print(f"🧠 MeTTa response: {response}")
        print(f"⏱️ Response time: {response_time_ms}ms")
        
        return jsonify({
            'response': response,
            'timestamp': datetime.now().isoformat(),
            'agent': 'Healthcare Assistant',
            'metta_integration': True,
            'response_time_ms': response_time_ms
        })
        
    except Exception as e:
        print(f"❌ Error in chat endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'agent': 'Healthcare Assistant',
        'metta_integration': True,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/analytics', methods=['GET'])
def get_analytics():
    """Get agent analytics and metrics"""
    try:
        metrics = analytics.get_agent_metrics('healthcare-agent')
        recent_interactions = analytics.get_recent_interactions(24)  # Last 24 hours
        
        return jsonify({
            'agent_id': 'healthcare-agent',
            'metrics': {
                'total_interactions': metrics.total_interactions,
                'average_response_time_ms': round(metrics.average_response_time_ms, 2),
                'average_rating': round(metrics.average_rating, 2),
                'total_ratings': metrics.total_ratings,
                'success_rate': round(metrics.success_rate * 100, 2),
                'last_interaction': metrics.last_interaction.isoformat()
            },
            'recent_interactions_24h': len(recent_interactions),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analytics/rate', methods=['POST'])
def rate_interaction():
    """Rate the most recent interaction"""
    try:
        data = request.get_json()
        rating = data.get('rating')
        feedback = data.get('feedback', '')
        
        if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({'error': 'Rating must be an integer between 1 and 5'}), 400
        
        success = analytics.add_rating('healthcare-agent', rating, feedback)
        
        if success:
            return jsonify({
                'message': 'Rating added successfully',
                'rating': rating,
                'feedback': feedback,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'error': 'No recent interaction found to rate'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    # Use PORT environment variable or default to 8002
    port = int(os.getenv('PORT', 8002))
    print(f"🌐 Starting Healthcare Agent HTTP Server on port {port}")
    print("✅ MeTTa Knowledge Graph integration enabled")
    print("✅ ASI:One integration enabled")
    print("🚀 Ready to receive frontend requests!")
    
    app.run(host='0.0.0.0', port=port, debug=False)
