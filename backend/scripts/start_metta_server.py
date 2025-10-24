#!/usr/bin/env python3
"""
MeTTa Knowledge Graph Server Startup Script
This script starts a mock MeTTa server for development and testing
"""

import os
import sys
import json
import time
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import logging

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
CORS(app)

# Mock knowledge graph data
MOCK_KNOWLEDGE_GRAPH = {
    "concepts": {
        "healthcare": {
            "definition": "The organized provision of medical care to individuals or a community",
            "domain": "medical",
            "confidence_score": 0.95,
            "relationships": {
                "related_to": ["medicine", "treatment", "diagnosis"],
                "part_of": ["medical_system", "public_health"]
            }
        },
        "logistics": {
            "definition": "The detailed coordination of complex operations involving many people, facilities, or supplies",
            "domain": "operations",
            "confidence_score": 0.92,
            "relationships": {
                "related_to": ["supply_chain", "transportation", "inventory"],
                "part_of": ["business_operations", "military_operations"]
            }
        },
        "finance": {
            "definition": "The management of large amounts of money, especially by governments or large companies",
            "domain": "economics",
            "confidence_score": 0.90,
            "relationships": {
                "related_to": ["banking", "investment", "economics"],
                "part_of": ["business", "government"]
            }
        },
        "blockchain": {
            "definition": "A distributed ledger technology that maintains a continuously growing list of records",
            "domain": "technology",
            "confidence_score": 0.88,
            "relationships": {
                "related_to": ["cryptocurrency", "smart_contracts", "decentralization"],
                "part_of": ["web3", "distributed_systems"]
            }
        },
        "artificial_intelligence": {
            "definition": "The simulation of human intelligence in machines that are programmed to think and learn",
            "domain": "technology",
            "confidence_score": 0.94,
            "relationships": {
                "related_to": ["machine_learning", "neural_networks", "automation"],
                "part_of": ["computer_science", "technology"]
            }
        }
    },
    "relationships": [
        {
            "from": "healthcare",
            "to": "artificial_intelligence",
            "type": "uses",
            "properties": {"strength": 0.8, "context": "medical_diagnosis"}
        },
        {
            "from": "logistics",
            "to": "artificial_intelligence",
            "type": "uses",
            "properties": {"strength": 0.7, "context": "route_optimization"}
        },
        {
            "from": "finance",
            "to": "blockchain",
            "type": "uses",
            "properties": {"strength": 0.9, "context": "decentralized_finance"}
        }
    ]
}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "service": "MeTTa Knowledge Graph Server"
    }), 200

@app.route('/query', methods=['POST'])
def query_knowledge():
    """Query the knowledge graph"""
    try:
        data = request.get_json()
        query_text = data.get('query', '')
        
        if not query_text:
            return jsonify({'error': 'Query is required'}), 400
        
        # Simple keyword-based search
        results = []
        query_lower = query_text.lower()
        
        for concept_name, concept_data in MOCK_KNOWLEDGE_GRAPH["concepts"].items():
            if (query_lower in concept_name.lower() or 
                query_lower in concept_data["definition"].lower() or
                query_lower in concept_data["domain"].lower()):
                
                results.append({
                    "concept": concept_name,
                    "definition": concept_data["definition"],
                    "domain": concept_data["domain"],
                    "confidence_score": concept_data["confidence_score"],
                    "relationships": concept_data["relationships"]
                })
        
        # Find related concepts through relationships
        related_concepts = set()
        for relationship in MOCK_KNOWLEDGE_GRAPH["relationships"]:
            if (query_lower in relationship["from"].lower() or 
                query_lower in relationship["to"].lower()):
                related_concepts.add(relationship["from"])
                related_concepts.add(relationship["to"])
        
        # Add related concepts to results
        for concept_name in related_concepts:
            if concept_name not in [r["concept"] for r in results]:
                concept_data = MOCK_KNOWLEDGE_GRAPH["concepts"].get(concept_name)
                if concept_data:
                    results.append({
                        "concept": concept_name,
                        "definition": concept_data["definition"],
                        "domain": concept_data["domain"],
                        "confidence_score": concept_data["confidence_score"],
                        "relationships": concept_data["relationships"]
                    })
        
        return jsonify({
            "query": query_text,
            "results": results,
            "count": len(results),
            "timestamp": datetime.utcnow().isoformat(),
            "source": "MeTTa Mock Server"
        }), 200
        
    except Exception as e:
        logger.error(f"Query error: {e}")
        return jsonify({'error': f'Query failed: {str(e)}'}), 500

@app.route('/concept/<concept_name>', methods=['GET'])
def get_concept(concept_name):
    """Get a specific concept"""
    try:
        concept_data = MOCK_KNOWLEDGE_GRAPH["concepts"].get(concept_name)
        
        if not concept_data:
            return jsonify({'error': 'Concept not found'}), 404
        
        # Find relationships for this concept
        relationships = []
        for rel in MOCK_KNOWLEDGE_GRAPH["relationships"]:
            if rel["from"] == concept_name or rel["to"] == concept_name:
                relationships.append(rel)
        
        return jsonify({
            "concept": concept_name,
            "definition": concept_data["definition"],
            "domain": concept_data["domain"],
            "confidence_score": concept_data["confidence_score"],
            "relationships": concept_data["relationships"],
            "related_concepts": relationships,
            "timestamp": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Get concept error: {e}")
        return jsonify({'error': f'Failed to get concept: {str(e)}'}), 500

@app.route('/concept', methods=['POST'])
def add_concept():
    """Add a new concept to the knowledge graph"""
    try:
        data = request.get_json()
        
        concept_name = data.get('concept')
        if not concept_name:
            return jsonify({'error': 'Concept name is required'}), 400
        
        # Add to mock knowledge graph
        MOCK_KNOWLEDGE_GRAPH["concepts"][concept_name] = {
            "definition": data.get('definition', ''),
            "domain": data.get('domain', 'general'),
            "confidence_score": data.get('confidence_score', 0.8),
            "relationships": data.get('relationships', {})
        }
        
        return jsonify({
            "message": "Concept added successfully",
            "concept": concept_name,
            "timestamp": datetime.utcnow().isoformat()
        }), 201
        
    except Exception as e:
        logger.error(f"Add concept error: {e}")
        return jsonify({'error': f'Failed to add concept: {str(e)}'}), 500

@app.route('/relationship', methods=['POST'])
def add_relationship():
    """Add a relationship between concepts"""
    try:
        data = request.get_json()
        
        required_fields = ['from_concept', 'to_concept', 'relationship_type']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'from_concept, to_concept, and relationship_type are required'}), 400
        
        # Add to mock relationships
        MOCK_KNOWLEDGE_GRAPH["relationships"].append({
            "from": data['from_concept'],
            "to": data['to_concept'],
            "type": data['relationship_type'],
            "properties": data.get('properties', {})
        })
        
        return jsonify({
            "message": "Relationship added successfully",
            "from_concept": data['from_concept'],
            "to_concept": data['to_concept'],
            "relationship_type": data['relationship_type'],
            "timestamp": datetime.utcnow().isoformat()
        }), 201
        
    except Exception as e:
        logger.error(f"Add relationship error: {e}")
        return jsonify({'error': f'Failed to add relationship: {str(e)}'}), 500

@app.route('/search', methods=['GET'])
def search_concepts():
    """Search concepts in the knowledge graph"""
    try:
        query = request.args.get('q', '')
        limit = int(request.args.get('limit', 10))
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        results = []
        query_lower = query.lower()
        
        for concept_name, concept_data in MOCK_KNOWLEDGE_GRAPH["concepts"].items():
            if (query_lower in concept_name.lower() or 
                query_lower in concept_data["definition"].lower()):
                
                results.append({
                    "concept": concept_name,
                    "definition": concept_data["definition"],
                    "domain": concept_data["domain"],
                    "confidence_score": concept_data["confidence_score"]
                })
                
                if len(results) >= limit:
                    break
        
        return jsonify({
            "query": query,
            "results": results,
            "count": len(results),
            "timestamp": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Search error: {e}")
        return jsonify({'error': f'Search failed: {str(e)}'}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get knowledge graph statistics"""
    try:
        total_concepts = len(MOCK_KNOWLEDGE_GRAPH["concepts"])
        total_relationships = len(MOCK_KNOWLEDGE_GRAPH["relationships"])
        
        # Count concepts by domain
        domains = {}
        for concept_data in MOCK_KNOWLEDGE_GRAPH["concepts"].values():
            domain = concept_data["domain"]
            domains[domain] = domains.get(domain, 0) + 1
        
        return jsonify({
            "total_concepts": total_concepts,
            "total_relationships": total_relationships,
            "domains": domains,
            "timestamp": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Stats error: {e}")
        return jsonify({'error': f'Failed to get stats: {str(e)}'}), 500

def start_server():
    """Start the MeTTa server"""
    logger.info("Starting MeTTa Knowledge Graph Server...")
    logger.info("Server will be available at http://localhost:8080")
    
    # Run the Flask app
    app.run(
        host='0.0.0.0',
        port=8080,
        debug=True,
        threaded=True
    )

if __name__ == '__main__':
    start_server()
