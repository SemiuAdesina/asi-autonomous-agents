#!/usr/bin/env python3
"""
Logistics Coordinator HTTP Server
Provides HTTP endpoints for the Logistics Coordinator agent to communicate with the frontend.
"""

import os
import sys
import json
import asyncio
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

# Add the parent directory to the path to import our modules
sys.path.append(os.path.dirname(__file__))

from knowledge import LogisticsKnowledgeGraph
from logisticsrag import LogisticsRAG
from asi_one_integration import ASIOneIntegration
from utils import process_query

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://localhost:3004', 'http://localhost:3005', 'https://asi-frontend.onrender.com'], 
     methods=['GET', 'POST', 'OPTIONS'], 
     allow_headers=['Content-Type', 'Authorization'])

# Initialize components
knowledge_graph = LogisticsKnowledgeGraph()
logistics_rag = LogisticsRAG(knowledge_graph)
asi_one = ASIOneIntegration()

# Analytics tracking
analytics_data = {
    "total_interactions": 0,
    "successful_interactions": 0,
    "failed_interactions": 0,
    "average_response_time_ms": 0.0,
    "last_interaction": None,
    "total_ratings": 0,
    "average_rating": 0.0,
    "knowledge_updates": 0,
    "last_knowledge_update": None
}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "agent": "Logistics Coordinator",
        "metta_integration": True,
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/chat', methods=['POST'])
def chat():
    """Chat endpoint for logistics queries"""
    try:
        data = request.get_json()
        query = data.get('message', '')
        user_id = data.get('user_id', 'anonymous')
        
        if not query:
            return jsonify({"error": "No message provided"}), 400
        
        start_time = datetime.now()
        
        # Process the query using our RAG system and ASI:One
        response_text, confidence, sources = asyncio.run(process_query(
            query, 
            logistics_rag, 
            asi_one
        ))
        
        end_time = datetime.now()
        response_time = (end_time - start_time).total_seconds() * 1000
        
        # Update analytics
        analytics_data["total_interactions"] += 1
        analytics_data["successful_interactions"] += 1
        analytics_data["last_interaction"] = datetime.now().isoformat()
        
        # Update average response time
        if analytics_data["total_interactions"] > 0:
            analytics_data["average_response_time_ms"] = (
                (analytics_data["average_response_time_ms"] * (analytics_data["total_interactions"] - 1) + response_time) 
                / analytics_data["total_interactions"]
            )
        
        # Track knowledge updates (simulate learning from interactions)
        if confidence > 0.8:  # High confidence responses indicate successful learning
            analytics_data["knowledge_updates"] += 1
            analytics_data["last_knowledge_update"] = datetime.now().isoformat()
        
        return jsonify({
            "response": response_text,
            "confidence": confidence,
            "sources": sources,
            "agent": "Logistics Coordinator",
            "timestamp": datetime.now().isoformat(),
            "response_time_ms": response_time
        })
        
    except Exception as e:
        analytics_data["total_interactions"] += 1
        analytics_data["failed_interactions"] += 1
        
        return jsonify({
            "error": f"Logistics Coordinator error: {str(e)}",
            "agent": "Logistics Coordinator",
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/analytics', methods=['GET'])
def get_analytics():
    """Get analytics data"""
    return jsonify({
        "agent_id": "logistics-agent",
        "metrics": {
            "total_interactions": analytics_data["total_interactions"],
            "successful_interactions": analytics_data["successful_interactions"],
            "failed_interactions": analytics_data["failed_interactions"],
            "average_response_time_ms": analytics_data["average_response_time_ms"],
            "last_interaction": analytics_data["last_interaction"],
            "success_rate": (analytics_data["successful_interactions"] / max(analytics_data["total_interactions"], 1)) * 100,
            "total_ratings": analytics_data["total_ratings"],
            "average_rating": analytics_data["average_rating"],
            "knowledge_updates": analytics_data["knowledge_updates"],
            "last_knowledge_update": analytics_data["last_knowledge_update"]
        },
        "recent_interactions_24h": analytics_data["total_interactions"],  # Simplified for demo
        "timestamp": datetime.now().isoformat()
    })

@app.route('/analytics/rate', methods=['POST'])
def rate_interaction():
    """Rate the last interaction"""
    try:
        data = request.get_json()
        rating = data.get('rating', 0)
        
        if 1 <= rating <= 5:
            analytics_data["total_ratings"] += 1
            analytics_data["average_rating"] = (
                (analytics_data["average_rating"] * (analytics_data["total_ratings"] - 1) + rating) 
                / analytics_data["total_ratings"]
            )
            
            return jsonify({
                "message": "Rating recorded successfully",
                "average_rating": analytics_data["average_rating"]
            })
        else:
            return jsonify({"error": "Rating must be between 1 and 5"}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Use PORT environment variable or default to 8004
    port = int(os.getenv('PORT', 8004))
    print(f"Starting Logistics Coordinator HTTP Server on port {port}...")
    print("Available endpoints:")
    print("  GET  /health - Health check")
    print("  POST /chat - Chat with Logistics Coordinator")
    print("  GET  /analytics - Get analytics data")
    print("  POST /analytics/rate - Rate interaction")
    
    app.run(host='0.0.0.0', port=port, debug=False)
