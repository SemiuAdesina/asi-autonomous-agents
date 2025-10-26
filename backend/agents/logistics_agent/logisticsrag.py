#!/usr/bin/env python3
"""
Logistics RAG System - Using Real MeTTa Integration
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'knowledge'))

from metta_kg.integration import MeTTaKnowledgeGraph
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class LogisticsRAG:
    """
    Logistics RAG (Retrieval-Augmented Generation) system
    Uses real MeTTa Knowledge Graph integration
    """
    
    def __init__(self, metta_instance: MeTTaKnowledgeGraph):
        self.metta = metta_instance
    
    def query_transport_method(self, product_type: str) -> List[str]:
        """Query optimal transport method for product type"""
        try:
            concept = self.metta.query_concept(product_type)
            if concept:
                return [concept.get('name', product_type)]
            return []
        except Exception as e:
            logger.error(f"Error querying transport method: {e}")
            return []
    
    def get_warehouse_capabilities(self, warehouse_type: str) -> List[str]:
        """Get warehouse capabilities"""
        try:
            relationships = self.metta.find_relationships(warehouse_type)
            capabilities = []
            for rel in relationships:
                if 'related' in rel:
                    capabilities.append(rel['related'].get('name', ''))
            return capabilities
        except Exception as e:
            logger.error(f"Error getting warehouse capabilities: {e}")
            return []
    
    def get_risk_mitigation(self, risk_type: str) -> List[str]:
        """Get risk mitigation strategies"""
        try:
            relationships = self.metta.find_relationships(risk_type)
            strategies = []
            for rel in relationships:
                if 'related' in rel:
                    strategies.append(rel['related'].get('name', ''))
            return strategies
        except Exception as e:
            logger.error(f"Error getting risk mitigation: {e}")
            return []
    
    def get_optimization_factors(self, optimization_type: str) -> List[str]:
        """Get optimization factors"""
        try:
            relationships = self.metta.find_relationships(optimization_type)
            factors = []
            for rel in relationships:
                if 'related' in rel:
                    factors.append(rel['related'].get('name', ''))
            return factors
        except Exception as e:
            logger.error(f"Error getting optimization factors: {e}")
            return []
    
    def get_transport_details(self, method: str) -> List[str]:
        """Get transport method details"""
        try:
            concept = self.metta.query_concept(method)
            if concept:
                return [str(concept)]
            return []
        except Exception as e:
            logger.error(f"Error getting transport details: {e}")
            return []
    
    def query_knowledge(self, query: str) -> Dict[str, Any]:
        """General knowledge query method"""
        try:
            # Use MeTTa query concept
            concept = self.metta.query_concept(query)
            if concept:
                return {"results": [{"description": str(concept), "source": "metta"}]}
            
            # Default fallback
            return {"results": [{"description": "General logistics and supply chain advice available", "source": "metta"}]}
        except Exception as e:
            logger.error(f"Error in query_knowledge: {e}")
            return {"results": []}
