#!/usr/bin/env python3
"""
Minimal Flask app for testing Render deployment
This is a simplified version to isolate the port binding issue
"""

from flask import Flask, jsonify
import os

# Create Flask app
app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        'status': 'success',
        'message': 'ASI Autonomous Agents Backend is running!',
        'version': '1.0.0'
    })

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': '2024-10-25T23:19:00Z',
        'service': 'asi-backend'
    })

@app.route('/api/test')
def test():
    return jsonify({
        'status': 'success',
        'message': 'API endpoint working',
        'data': {
            'agents': ['healthcare', 'financial', 'logistics'],
            'features': ['MeTTa Knowledge Graph', 'ASI:One Integration', 'Chat Protocol']
        }
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    print(f"🚀 Starting minimal Flask app on port {port}")
    print(f"🔧 Environment: {'production' if os.getenv('PORT') else 'development'}")
    
    app.run(debug=False, host='0.0.0.0', port=port)
