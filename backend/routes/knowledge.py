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

@knowledge_bp.route('/concept', methods=['POST'])
@jwt_required()
def add_concept():
    """Add new concept to the knowledge graph"""
    data = request.get_json()
    
    if not data or not data.get('concept'):
        return jsonify({'error': 'Concept is required'}), 400
    
    concept = data['concept']
    definition = data.get('definition', '')
    domain = data.get('domain', 'general')
    confidence_score = data.get('confidence_score', 0.8)
    relationships = data.get('relationships', {})
    source = data.get('source', 'manual')
    
    try:
        # Add to MeTTa Knowledge Graph
        metta_success = knowledge_graph.add_concept(concept, {
            'definition': definition,
            'domain': domain,
            'confidence_score': confidence_score,
            'relationships': relationships
        })
        
        # Add to local knowledge base
        local_knowledge = KnowledgeGraph(
            concept=concept,
            definition=definition,
            domain=domain,
            relationships=relationships,
            source=source,
            confidence_score=confidence_score
        )
        
        db.session.add(local_knowledge)
        db.session.commit()
        
        return jsonify({
            'message': 'Concept added successfully',
            'concept': concept,
            'definition': definition,
            'domain': domain,
            'metta_success': metta_success,
            'local_id': local_knowledge.id,
            'timestamp': datetime.utcnow().isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to add concept: {str(e)}'}), 500

@knowledge_bp.route('/add', methods=['POST'])
@jwt_required()
def add_knowledge():
    """Add new knowledge to the graph (legacy endpoint)"""
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
        
@knowledge_bp.route('/concepts', methods=['GET'])
@jwt_required()
def get_concepts():
    """Get all concepts from the knowledge graph"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        domain = request.args.get('domain', None)
        
        query = KnowledgeGraph.query
        if domain:
            query = query.filter_by(domain=domain)
        
        concepts = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'concepts': [{
                'id': concept.id,
                'concept': concept.concept,
                'definition': concept.definition,
                'domain': concept.domain,
                'confidence_score': concept.confidence_score,
                'source': concept.source,
                'created_at': concept.created_at.isoformat(),
                'updated_at': concept.updated_at.isoformat()
            } for concept in concepts.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': concepts.total,
                'pages': concepts.pages,
                'has_next': concepts.has_next,
                'has_prev': concepts.has_prev
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get concepts: {str(e)}'}), 500

@knowledge_bp.route('/concept/<int:concept_id>', methods=['PUT'])
@jwt_required()
def update_concept(concept_id):
    """Update a concept in the knowledge graph"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        concept = KnowledgeGraph.query.get(concept_id)
        if not concept:
            return jsonify({'error': 'Concept not found'}), 404
        
        # Update fields if provided
        if 'concept' in data:
            concept.concept = data['concept']
        if 'definition' in data:
            concept.definition = data['definition']
        if 'domain' in data:
            concept.domain = data['domain']
        if 'confidence_score' in data:
            concept.confidence_score = data['confidence_score']
        if 'relationships' in data:
            concept.relationships = data['relationships']
        if 'source' in data:
            concept.source = data['source']
        
        concept.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Concept updated successfully',
            'concept': {
                'id': concept.id,
                'concept': concept.concept,
                'definition': concept.definition,
                'domain': concept.domain,
                'confidence_score': concept.confidence_score,
                'source': concept.source,
                'updated_at': concept.updated_at.isoformat()
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update concept: {str(e)}'}), 500

@knowledge_bp.route('/concept/<int:concept_id>', methods=['DELETE'])
@jwt_required()
def delete_concept(concept_id):
    """Delete a concept from the knowledge graph"""
    try:
        concept = KnowledgeGraph.query.get(concept_id)
        if not concept:
            return jsonify({'error': 'Concept not found'}), 404
        
        concept_name = concept.concept
        db.session.delete(concept)
        db.session.commit()
        
        return jsonify({
            'message': 'Concept deleted successfully',
            'concept_name': concept_name,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete concept: {str(e)}'}), 500