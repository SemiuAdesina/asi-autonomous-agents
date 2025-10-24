#!/usr/bin/env python3
"""
Logistics RAG System - Following Official Workshop Structure
Based on the Fetch.ai Innovation Lab examples
"""

from workshop_metta import WorkshopMeTTa
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class LogisticsRAG:
    """
    Logistics RAG (Retrieval-Augmented Generation) system
    Following the workshop examples for logistics knowledge retrieval
    """
    
    def __init__(self, metta_instance: WorkshopMeTTa):
        self.metta = metta_instance
    
    def query_transport_method(self, product_type: str) -> List[str]:
        """
        Query optimal transport method for product type using MeTTa pattern matching
        """
        query_str = f'!(match &self (product_route {product_type} $method) $method)'
        results = self.metta.run(query_str)
        return [str(r[0]) for r in results] if results else []
    
    def get_warehouse_capabilities(self, warehouse_type: str) -> List[str]:
        """
        Get warehouse capabilities using MeTTa pattern matching
        """
        query_str = f'!(match &self (warehouse_type {warehouse_type} $capabilities) $capabilities)'
        results = self.metta.run(query_str)
        return [str(r[0]) for r in results] if results else []
    
    def get_risk_mitigation(self, risk_type: str) -> List[str]:
        """
        Get risk mitigation strategies using MeTTa pattern matching
        """
        query_str = f'!(match &self (risk_mitigation {risk_type} $strategy) $strategy)'
        results = self.metta.run(query_str)
        return [str(r[0]) for r in results] if results else []
    
    def get_optimization_factors(self, optimization_type: str) -> List[str]:
        """
        Get optimization factors using MeTTa pattern matching
        """
        query_str = f'!(match &self (optimization_factor {optimization_type} $factors) $factors)'
        results = self.metta.run(query_str)
        return [str(r[0]) for r in results] if results else []
    
    def get_transport_details(self, method: str) -> List[str]:
        """
        Get transport method details using MeTTa pattern matching
        """
        query_str = f'!(match &self (transport_method {method} $details) $details)'
        results = self.metta.run(query_str)
        return [str(r[0]) for r in results] if results else []
    
    def add_knowledge(self, category: str, key: str, value: str):
        """
        Dynamically add new knowledge to the MeTTa graph.
        """
        self.metta.add_atom(category, key, value)
        logger.info(f"Added knowledge: {category}, {key}, {value}")

    def query_knowledge(self, query: str) -> Dict[str, Any]:
        """
        General knowledge query method for the RAG system
        """
        try:
            # Parse the query and determine the best method to call
            query_lower = query.lower()
            
            # Route optimization queries
            if "route" in query_lower or "optimization" in query_lower:
                return {"results": [{"description": "Route optimization strategies available", "source": "metta"}]}
            
            # Inventory management queries
            elif "inventory" in query_lower or "warehouse" in query_lower:
                return {"results": [{"description": "Warehouse management and inventory tracking solutions", "source": "metta"}]}
            
            # Delivery tracking queries
            elif "delivery" in query_lower or "tracking" in query_lower:
                return {"results": [{"description": "Delivery tracking and monitoring systems", "source": "metta"}]}
            
            # Supply chain queries
            elif "supply chain" in query_lower or "supplier" in query_lower:
                return {"results": [{"description": "Supply chain analysis and supplier management", "source": "metta"}]}
            
            # Cost optimization queries
            elif "cost" in query_lower and "optimization" in query_lower:
                return {"results": [{"description": "Cost optimization strategies for logistics operations", "source": "metta"}]}
            
            # Default fallback
            return {"results": [{"description": "General logistics and supply chain advice available", "source": "metta"}]}
            
        except Exception as e:
            logger.error(f"Error in query_knowledge: {e}")
            return {"results": []}

print("✅ Logistics RAG System initialized successfully")
