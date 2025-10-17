from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import KnowledgeGraph, db
from knowledge.metta_kg.integration import knowledge_graph
from datetime import datetime

knowledge_bp = Blueprint('knowledge', __name__)

@knowledge_bp.route('/query', methods=['POST'])
@jwt_required()
def query_knowledge():
    """Query the knowledge graph"""
    data = request.get_json()
    
    if not data or not data.get('query'):
        return jsonify({'error': 'Query is required'}), 400
    
    query_text = data['query']
    domain = data.get('domain', 'general')
    
    try:
        # Query MeTTa Knowledge Graph with intelligent responses
        kg_results = knowledge_graph.query(query_text)
        
        # Also query local knowledge base
        local_results = KnowledgeGraph.query.filter(
            KnowledgeGraph.concept.contains(query_text)
        ).limit(5).all()
        
        return jsonify({
            'query': query_text,
            'domain': domain,
            'kg_results': kg_results,
            'local_results': [{
                'id': result.id,
                'concept': result.concept,
                'definition': result.definition,
                'confidence_score': result.confidence_score,
                'source': result.source
            } for result in local_results],
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Knowledge query failed: {str(e)}'}), 500

@knowledge_bp.route('/concept/<concept_name>', methods=['GET'])
@jwt_required()
def get_concept(concept_name):
    """Get information about a specific concept"""
    try:
        # Query MeTTa Knowledge Graph
        metta_result = knowledge_graph.query_concept(concept_name)
        
        # Query local knowledge base
        local_result = KnowledgeGraph.query.filter_by(concept=concept_name).first()
        
        # Get relationships
        relationships = knowledge_graph.find_relationships(concept_name)
        
        return jsonify({
            'concept': concept_name,
            'metta_data': metta_result,
            'local_data': {
                'id': local_result.id,
                'concept': local_result.concept,
                'definition': local_result.definition,
                'confidence_score': local_result.confidence_score,
                'source': local_result.source
            } if local_result else None,
            'relationships': relationships,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get concept: {str(e)}'}), 500

@knowledge_bp.route('/domain/<domain_name>', methods=['GET'])
@jwt_required()
def get_domain_knowledge(domain_name):
    """Get knowledge context for a specific domain"""
    try:
        context = knowledge_graph.get_knowledge_context(domain_name)
        
        return jsonify(context), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get domain knowledge: {str(e)}'}), 500

@knowledge_bp.route('/add', methods=['POST'])
@jwt_required()
def add_knowledge():
    """Add new knowledge to the graph"""
    data = request.get_json()
    
    if not data or not data.get('concept'):
        return jsonify({'error': 'Concept is required'}), 400
    
    concept = data['concept']
    properties = data.get('properties', {})
    
    try:
        # Add to MeTTa Knowledge Graph
        metta_success = knowledge_graph.add_concept(concept, properties)
        
        # Add to local knowledge base
        local_knowledge = KnowledgeGraph(
            concept=concept,
            definition=properties.get('definition', ''),
            relationships=properties.get('relationships', {}),
            source='manual',
            confidence_score=properties.get('confidence_score', 0)
        )
        
        db.session.add(local_knowledge)
        db.session.commit()
        
        return jsonify({
            'message': 'Knowledge added successfully',
            'concept': concept,
            'metta_success': metta_success,
            'local_id': local_knowledge.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to add knowledge: {str(e)}'}), 500

@knowledge_bp.route('/relationships', methods=['POST'])
@jwt_required()
def create_relationship():
    """Create a relationship between concepts"""
    data = request.get_json()
    
    required_fields = ['from_concept', 'to_concept', 'relationship_type']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'from_concept, to_concept, and relationship_type are required'}), 400
    
    try:
        success = knowledge_graph.create_relationship(
            data['from_concept'],
            data['to_concept'],
            data['relationship_type'],
            data.get('properties', {})
        )
        
        if success:
            return jsonify({
                'message': 'Relationship created successfully',
                'from_concept': data['from_concept'],
                'to_concept': data['to_concept'],
                'relationship_type': data['relationship_type']
            }), 201
        else:
            return jsonify({'error': 'Failed to create relationship'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Failed to create relationship: {str(e)}'}), 500

@knowledge_bp.route('/search', methods=['GET'])
@jwt_required()
def search_knowledge():
    """Search the knowledge graph"""
    query = request.args.get('q', '')
    limit = int(request.args.get('limit', 10))
    
    if not query:
        return jsonify({'error': 'Search query is required'}), 400
    
    try:
        results = knowledge_graph.semantic_search(query, limit=limit)
        
        return jsonify({
            'query': query,
            'results': results,
            'count': len(results),
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Search failed: {str(e)}'}), 500
